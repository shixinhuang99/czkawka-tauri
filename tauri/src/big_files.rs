use czkawka_core::{
	big_file::{BigFile, BigFileParameters, SearchMode},
	common_dir_traversal::FileEntry,
	common_tool::CommonData,
};
use rayon::prelude::*;
use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::{
	scaner::{apply_scaner_settings, spawn_scaner_thread},
	settings::Settings,
	state::get_stop_rx_and_progress_tx,
};

#[derive(Serialize, Clone)]
struct ScanResult {
	cmd: &'static str,
	list: Vec<FileEntry>,
	message: String,
}

pub fn scan_big_files(app: AppHandle, settings: Settings) {
	spawn_scaner_thread(move || {
		let (stop_rx, progress_tx) = get_stop_rx_and_progress_tx(&app);

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

		set_scaner_state(app, scaner);
	});
}

crate::gen_set_scaner_state_fn!(
	big_files_state,
	czkawka_core::big_file::BigFile
);
