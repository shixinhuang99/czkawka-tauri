use czkawka_core::{
	common::split_path_compare, common_dir_traversal::FileEntry,
	common_tool::CommonData, tools::empty_files::EmptyFiles,
};
use rayon::prelude::*;
use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::{
	scaner::{set_scaner_common_settings, spawn_scaner_thread},
	settings::Settings,
	state::get_stop_flag_and_progress_tx,
};

#[derive(Serialize, Clone)]
struct ScanResult {
	cmd: &'static str,
	list: Vec<FileEntry>,
	message: String,
}

pub fn scan_empty_files(app: AppHandle, settings: Settings) {
	spawn_scaner_thread(move || {
		let (stop_flag, progress_tx) = get_stop_flag_and_progress_tx(&app);

		let mut scaner = EmptyFiles::new();

		set_scaner_common_settings(&mut scaner, settings);

		scaner.find_empty_files(Some(&stop_flag), Some(&progress_tx));

		let mut list = scaner.get_empty_files().clone();
		let mut message = scaner.get_text_messages().create_messages_text();

		list.par_sort_unstable_by(|a, b| {
			split_path_compare(a.path.as_path(), b.path.as_path())
		});

		message = format!("Found {} empty files\n{}", list.len(), message);

		app.emit(
			"scan-result",
			ScanResult {
				cmd: "scan_empty_files",
				list,
				message,
			},
		)
		.unwrap();

		set_scaner_state(app, scaner);
	});
}

crate::gen_set_scaner_state_fn!(
	empty_files_state,
	czkawka_core::tools::empty_files::EmptyFiles
);
