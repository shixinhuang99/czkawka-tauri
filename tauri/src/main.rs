#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::env;

use czkawka_core::{
	common::get_all_available_threads,
	common_items::{DEFAULT_EXCLUDED_DIRECTORIES, DEFAULT_EXCLUDED_ITEMS},
};
use serde::{Deserialize, Serialize};

fn main() {
	run();
}

fn run() {
	tauri::Builder::default()
		.invoke_handler(tauri::generate_handler![
			view_github,
			set_theme,
			get_partial_settings
		])
		.run(tauri::generate_context!())
		.unwrap();
}

#[tauri::command]
fn view_github() {
	let url = env!("CARGO_PKG_REPOSITORY");
	let _ = opener::open_browser(url);
}

#[tauri::command]
fn set_theme(ww: tauri::WebviewWindow, theme: String) {
	use tauri::Theme::*;

	let window_theme = match theme.as_ref() {
		"light" => Some(Light),
		"dark" => Some(Dark),
		_ => None,
	};

	let _ = ww.set_theme(window_theme);
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PartialSettings {
	included_directories: Vec<String>,
	excluded_directories: Vec<String>,
	excluded_items: String,
	available_thread_number: usize,
}

#[tauri::command]
fn get_partial_settings() -> PartialSettings {
	PartialSettings {
		included_directories: default_included_directories(),
		excluded_directories: default_excluded_directories(),
		excluded_items: default_excluded_items(),
		available_thread_number: get_all_available_threads(),
	}
}

fn default_included_directories() -> Vec<String> {
	let mut included_directories = vec![];

	if let Ok(current_dir) = env::current_dir() {
		included_directories.push(current_dir.to_string_lossy().to_string());
	} else if let Some(home_dir) = home::home_dir() {
		included_directories.push(home_dir.to_string_lossy().to_string());
	} else if cfg!(target_family = "unix") {
		included_directories.push("/".to_string());
	} else {
		included_directories.push("C:\\".to_string());
	};

	included_directories
}

fn default_excluded_directories() -> Vec<String> {
	DEFAULT_EXCLUDED_DIRECTORIES
		.iter()
		.map(|s| s.to_string())
		.collect()
}

fn default_excluded_items() -> String {
	DEFAULT_EXCLUDED_ITEMS.to_string()
}
