#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod big_files;
mod duplicate_files;
mod empty_files;
mod empty_folders;
mod image;
mod invalid_symlinks;
mod music_duplicates;
mod progress;
mod scaner;
mod settings;
mod similar_images;
mod similar_videos;
mod state;
mod temporary_files;
mod utils;

use std::sync::Mutex;

use czkawka_core::common::{get_number_of_threads, set_number_of_threads};
use tauri::{AppHandle, Emitter, Manager, State};

use crate::{
	image::ImageInfo,
	progress::process_progress_data,
	settings::{PlatformSettings, Settings},
	state::AppState,
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
			read_image,
			scan_duplicate_files,
			scan_empty_folders,
			scan_big_files,
			scan_empty_files,
			scan_temporary_files,
			scan_similar_images,
			scan_similar_videos,
			scan_music_duplicates,
			scan_invalid_symlinks,
		])
		.plugin(tauri_plugin_opener::init())
		.plugin(tauri_plugin_dialog::init())
		.run(tauri::generate_context!())
		.expect("Failed to launch app");
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

#[tauri::command]
fn read_image(path: String) -> Result<ImageInfo, ()> {
	image::read_image(path)
}

#[tauri::command]
fn scan_big_files(app: AppHandle, settings: Settings) {
	big_files::scan_big_files(app, settings);
}

#[tauri::command]
fn scan_duplicate_files(app: AppHandle, settings: Settings) {
	duplicate_files::scan_duplicate_files(app, settings);
}

#[tauri::command]
fn scan_empty_folders(app: AppHandle, settings: Settings) {
	empty_folders::scan_empty_folders(app, settings);
}

#[tauri::command]
fn scan_empty_files(app: AppHandle, settings: Settings) {
	empty_files::scan_empty_files(app, settings);
}

#[tauri::command]
fn scan_temporary_files(app: AppHandle, settings: Settings) {
	temporary_files::scan_temporary_files(app, settings);
}

#[tauri::command]
fn scan_similar_images(app: AppHandle, settings: Settings) {
	similar_images::scan_similar_images(app, settings);
}

#[tauri::command]
fn scan_similar_videos(app: AppHandle, settings: Settings) {
	similar_videos::scan_similar_videos(app, settings);
}

#[tauri::command]
fn scan_music_duplicates(app: AppHandle, settings: Settings) {
	music_duplicates::scan_music_duplicates(app, settings);
}

#[tauri::command]
fn scan_invalid_symlinks(app: AppHandle, settings: Settings) {
	invalid_symlinks::scan_invalid_symlinks(app, settings);
}
