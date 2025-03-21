use czkawka_core::{
	common::split_path_compare, common_tool::CommonData,
	tools::empty_folder::EmptyFolder,
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
struct CustomFolderEntry {
	path: String,
	modified_date: u64,
}

#[derive(Serialize, Clone)]
struct ScanResult {
	cmd: &'static str,
	list: Vec<CustomFolderEntry>,
	message: String,
}

pub fn scan_empty_folders(app: AppHandle, settings: Settings) {
	spawn_scaner_thread(move || {
		let (stop_flag, progress_tx) = get_stop_flag_and_progress_tx(&app);

		let mut scaner = EmptyFolder::new();

		set_scaner_common_settings(&mut scaner, settings);

		scaner.find_empty_folders(Some(&stop_flag), Some(&progress_tx));

		let mut raw_list = scaner
			.get_empty_folder_list()
			.values()
			.cloned()
			.collect::<Vec<_>>();
		let mut message = scaner.get_text_messages().create_messages_text();

		raw_list.par_sort_unstable_by(|a, b| {
			split_path_compare(a.path.as_path(), b.path.as_path())
		});

		message =
			format!("Found {} empty folders\n{}", raw_list.len(), message);

		let list = raw_list
			.into_iter()
			.map(|item| CustomFolderEntry {
				path: item.path.to_string_lossy().to_string(),
				modified_date: item.modified_date,
			})
			.collect::<Vec<_>>();

		app.emit(
			"scan-result",
			ScanResult {
				cmd: "scan_empty_folders",
				list,
				message,
			},
		)
		.unwrap();

		set_scaner_state(app, scaner);
	});
}

crate::gen_set_scaner_state_fn!(
	empty_folders_state,
	czkawka_core::tools::empty_folder::EmptyFolder
);
