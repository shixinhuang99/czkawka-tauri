#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
	run();
}

fn run() {
	tauri::Builder::default()
		.invoke_handler(tauri::generate_handler![view_github, set_theme,])
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
