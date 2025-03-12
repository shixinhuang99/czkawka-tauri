#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod scaner;
mod settings;
mod utils;

use std::sync::Mutex;

use czkawka_core::{
	big_file::{BigFile, BigFileParameters, SearchMode},
	common::{get_number_of_threads, set_number_of_threads},
	common_dir_traversal::FileEntry,
	common_tool::CommonData,
};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::{Manager, State};

use crate::{
	scaner::{apply_scaner_settings, spawn_scaner_thread},
	settings::{PlatformSettings, Settings},
};

fn main() {
	run();
}

#[derive(Default)]
struct AppState {
	is_number_of_threads_setup: bool,
}

fn run() {
	tauri::Builder::default()
		.setup(|app| {
			app.manage(Mutex::new(AppState::default()));
			Ok(())
		})
		.invoke_handler(tauri::generate_handler![
			get_platform_settings,
			setup_number_of_threads,
			scan_big_files,
		])
		.plugin(tauri_plugin_opener::init())
		.plugin(tauri_plugin_dialog::init())
		.run(tauri::generate_context!())
		.unwrap();
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

#[derive(Serialize, Deserialize)]
struct BigFilesResult {
	files: Vec<FileEntry>,
	message: String,
}

#[tauri::command]
fn scan_big_files(settings: Settings) -> BigFilesResult {
	let search_mode = match settings.biggest_files_sub_method.as_ref() {
		"BiggestFiles" => SearchMode::BiggestFiles,
		"SmallestFiles" => SearchMode::SmallestFiles,
		_ => {
			return BigFilesResult {
				files: vec![],
				message: "Unknown search mode".to_string(),
			};
		}
	};

	let result = spawn_scaner_thread(move || {
		let mut scaner = BigFile::new(BigFileParameters::new(
			settings.biggest_files_sub_number_of_files as usize,
			search_mode,
		));
		apply_scaner_settings(&mut scaner, settings);
		scaner.find_big_files(None, None);
		let mut files = scaner.get_big_files().clone();
		let message = scaner.get_text_messages().create_messages_text();

		if search_mode == SearchMode::BiggestFiles {
			files.par_sort_unstable_by_key(|fe| u64::MAX - fe.size);
		} else {
			files.par_sort_unstable_by_key(|fe| fe.size);
		}

		BigFilesResult { files, message }
	});

	result
}
