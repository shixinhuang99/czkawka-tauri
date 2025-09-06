use std::{fs, path::PathBuf};

use simplelog::{Config, LevelFilter, WriteLogger};

pub fn convert_strs_to_path_bufs(strs: Vec<String>) -> Vec<PathBuf> {
	strs.into_iter().map(PathBuf::from).collect()
}

pub fn split_str_with_comma(s: String) -> Vec<String> {
	s.split(',').map(|s| s.to_string()).collect()
}

pub fn setup_log(app_env: &tauri::Env) {
	let Ok(current_exe_path) = tauri::process::current_binary(app_env) else {
		return;
	};
	let log_path = if let Some(parent) = current_exe_path.parent() {
		parent.join("czkawka-tauri.log")
	} else {
		return;
	};
	println!("log_path: {}", log_path.display());
	let Ok(log_file) = fs::File::create(log_path) else {
		return;
	};
	let _ = WriteLogger::init(LevelFilter::Info, Config::default(), log_file);
}
