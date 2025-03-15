#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod progress;
mod scaner;
mod settings;
mod utils;

use std::sync::Mutex;

use crossbeam_channel::{unbounded, Receiver, Sender};
use czkawka_core::{
	big_file::{BigFile, BigFileParameters, SearchMode},
	common::{
		get_number_of_threads, set_number_of_threads, split_path_compare,
	},
	common_dir_traversal::CheckingMethod,
	common_tool::CommonData,
	duplicate::{DuplicateFinder, DuplicateFinderParameters, HashType},
	progress_data::ProgressData,
};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager, State};

use crate::{
	progress::process_progress_data,
	scaner::{apply_scaner_settings, spawn_scaner_thread},
	settings::{PlatformSettings, Settings},
};

fn main() {
	tauri::Builder::default()
		.setup(move |app| {
			app.manage(Mutex::new(AppState::default()));
			Ok(())
		})
		.invoke_handler(tauri::generate_handler![
			get_platform_settings,
			setup_number_of_threads,
			stop_scan,
			listen_scan_progress,
			scan_big_files,
			scan_duplicate_files,
		])
		.plugin(tauri_plugin_opener::init())
		.plugin(tauri_plugin_dialog::init())
		.run(tauri::generate_context!())
		.expect("Failed to launch app");
}

struct AppState {
	is_number_of_threads_setup: bool,
	is_progress_thread_setup: bool,
	stop_tx: Sender<()>,
	stop_rx: Receiver<()>,
	progress_tx: Sender<ProgressData>,
	progress_rx: Receiver<ProgressData>,
}

impl Default for AppState {
	fn default() -> Self {
		let (stop_tx, stop_rx) = unbounded();
		let (progress_tx, progress_rx) = unbounded();

		AppState {
			is_number_of_threads_setup: false,
			is_progress_thread_setup: false,
			stop_tx,
			stop_rx,
			progress_tx,
			progress_rx,
		}
	}
}

#[tauri::command]
fn get_platform_settings() -> PlatformSettings {
	PlatformSettings::default()
}

#[tauri::command]
fn setup_number_of_threads(
	state: State<'_, Mutex<AppState>>,
	number_of_threads: usize,
) -> usize {
	let mut state = state.lock().unwrap();
	if state.is_number_of_threads_setup {
		return get_number_of_threads();
	}
	set_number_of_threads(number_of_threads);
	state.is_number_of_threads_setup = true;
	get_number_of_threads()
}

#[tauri::command]
fn stop_scan(state: State<'_, Mutex<AppState>>) {
	let state = state.lock().unwrap();
	state.stop_tx.send(()).unwrap();
}

#[tauri::command]
fn listen_scan_progress(app: AppHandle) {
	let state_mutex = app.state::<Mutex<AppState>>();
	let mut state = state_mutex.lock().unwrap();
	if state.is_progress_thread_setup {
		return;
	}
	state.is_progress_thread_setup = true;
	let progress_rx = state.progress_rx.clone();

	drop(state);

	std::thread::spawn(move || loop {
		let Ok(progress_data) = progress_rx.recv() else {
			return;
		};

		let data = process_progress_data(progress_data);

		app.emit("scan-progress", data).unwrap();
	});
}

fn get_stop_rx_and_progress_tx(
	app: &AppHandle,
) -> (Receiver<()>, Sender<ProgressData>) {
	let state_mutex = app.state::<Mutex<AppState>>();
	let state = state_mutex.lock().unwrap();
	(state.stop_rx.clone(), state.progress_tx.clone())
}

#[derive(Serialize, Deserialize, Clone)]
struct ScanResult<T> {
	cmd: &'static str,
	list: Vec<T>,
	message: String,
}

#[tauri::command]
fn scan_big_files(app: AppHandle, settings: Settings) {
	let (stop_rx, progress_tx) = get_stop_rx_and_progress_tx(&app);

	spawn_scaner_thread(move || {
		let search_mode = match settings.biggest_files_sub_method.as_ref() {
			"SmallestFiles" => SearchMode::SmallestFiles,
			_ => SearchMode::BiggestFiles,
		};
		let mut scaner = BigFile::new(BigFileParameters::new(
			settings.biggest_files_sub_number_of_files as usize,
			search_mode,
		));

		apply_scaner_settings(&mut scaner, settings);

		scaner.find_big_files(Some(&stop_rx), Some(&progress_tx));

		let mut list = scaner.get_big_files().clone();
		let mut message = scaner.get_text_messages().create_messages_text();

		message = format!("Found {} files\n{}", list.len(), message);

		if search_mode == SearchMode::BiggestFiles {
			list.par_sort_unstable_by_key(|fe| u64::MAX - fe.size);
		} else {
			list.par_sort_unstable_by_key(|fe| fe.size);
		}

		app.emit(
			"scan-result",
			ScanResult {
				cmd: "scan_big_files",
				list,
				message,
			},
		)
		.unwrap();
	});
}

#[tauri::command]
fn scan_duplicate_files(app: AppHandle, settings: Settings) {
	let (stop_rx, progress_tx) = get_stop_rx_and_progress_tx(&app);

	spawn_scaner_thread(move || {
		let hash_type =
			match settings.duplicates_sub_available_hash_type.as_ref() {
				"CRC32" => HashType::Crc32,
				"XXH3" => HashType::Xxh3,
				_ => HashType::Blake3,
			};
		let check_method = match settings.duplicates_sub_check_method.as_ref() {
			"Size" => CheckingMethod::Size,
			"Name" => CheckingMethod::Name,
			"SizeAndName" => CheckingMethod::SizeName,
			_ => CheckingMethod::Hash,
		};
		let mut scaner = DuplicateFinder::new(DuplicateFinderParameters::new(
			check_method,
			hash_type,
			settings.duplicate_hide_hard_links,
			settings.duplicate_use_prehash,
			settings.duplicate_minimal_hash_cache_size as u64,
			settings.duplicate_minimal_prehash_cache_size as u64,
			settings.duplicates_sub_name_case_sensitive,
		));

		scaner.set_delete_outdated_cache(
			settings.duplicate_delete_outdated_entries,
		);
		apply_scaner_settings(&mut scaner, settings);

		scaner.find_duplicates(Some(&stop_rx), Some(&progress_tx));

		let mut message = scaner.get_text_messages().create_messages_text();
		let mut list;
		if scaner.get_use_reference() {
			match scaner.get_params().check_method {
				CheckingMethod::Hash => {
					list = scaner
						.get_files_with_identical_hashes_referenced()
						.values()
						.flatten()
						.cloned()
						.map(|(original, other)| (Some(original), other))
						.collect::<Vec<_>>();
				}
				CheckingMethod::Name
				| CheckingMethod::Size
				| CheckingMethod::SizeName => {
					let values: Vec<_> = match scaner.get_params().check_method
					{
						CheckingMethod::Name => scaner
							.get_files_with_identical_name_referenced()
							.values()
							.cloned()
							.collect(),
						CheckingMethod::Size => scaner
							.get_files_with_identical_size_referenced()
							.values()
							.cloned()
							.collect(),
						CheckingMethod::SizeName => scaner
							.get_files_with_identical_size_names_referenced()
							.values()
							.cloned()
							.collect(),
						_ => unreachable!("Invalid check method."),
					};
					list = values
						.into_iter()
						.map(|(original, other)| (Some(original), other))
						.collect::<Vec<_>>();
				}
				_ => unreachable!("Invalid check method."),
			}
		} else {
			match scaner.get_params().check_method {
				CheckingMethod::Hash => {
					list = scaner
						.get_files_sorted_by_hash()
						.values()
						.flatten()
						.cloned()
						.map(|items| (None, items))
						.collect::<Vec<_>>();
				}
				CheckingMethod::Name
				| CheckingMethod::Size
				| CheckingMethod::SizeName => {
					let values: Vec<_> = match scaner.get_params().check_method
					{
						CheckingMethod::Name => scaner
							.get_files_sorted_by_names()
							.values()
							.cloned()
							.collect(),
						CheckingMethod::Size => scaner
							.get_files_sorted_by_size()
							.values()
							.cloned()
							.collect(),
						CheckingMethod::SizeName => scaner
							.get_files_sorted_by_size_name()
							.values()
							.cloned()
							.collect(),
						_ => unreachable!("Invalid check method."),
					};
					list = values
						.into_iter()
						.map(|items| (None, items))
						.collect::<Vec<_>>();
				}
				_ => unreachable!("Invalid check method."),
			}
		}

		for (_, vec) in &mut list {
			vec.par_sort_unstable_by(|a, b| {
				split_path_compare(a.path.as_path(), b.path.as_path())
			});
		}

		message = format!(
			"Found {} similar duplicates files\n{}",
			list.len(),
			message
		);

		app.emit(
			"scan-result",
			ScanResult {
				cmd: "scan_duplicate_files",
				list,
				message,
			},
		)
		.unwrap();
	});
}
