#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod progress;
mod scaner;
mod settings;
mod utils;

use std::sync::Mutex;

use crossbeam_channel::{unbounded, Receiver, Sender};
use czkawka_core::{
	big_file::{BigFile, BigFileParameters, SearchMode},
	common::{get_number_of_threads, set_number_of_threads},
	common_dir_traversal::FileEntry,
	common_tool::CommonData,
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

#[derive(Serialize, Deserialize, Clone)]
struct ScanResult {
	cmd: &'static str,
	list: Vec<FileEntry>,
	message: String,
}

#[tauri::command]
fn scan_big_files(app: AppHandle, settings: Settings) {
	let (stop_rx, progress_tx) = {
		let state_mutex = app.state::<Mutex<AppState>>();
		let state = state_mutex.lock().unwrap();
		(state.stop_rx.clone(), state.progress_tx.clone())
	};

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
		let message = scaner.get_text_messages().create_messages_text();

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
