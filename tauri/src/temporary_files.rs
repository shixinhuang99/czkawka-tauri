use czkawka_core::{
	common::{split_path_compare, tool_data::CommonData, traits::Search},
	tools::temporary::{Temporary, TemporaryFileEntry},
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
	list: Vec<TemporaryFileEntry>,
	message: String,
}

pub fn scan_temporary_files(app: AppHandle, settings: Settings) {
	spawn_scaner_thread(move || {
		let (stop_flag, progress_tx) = get_stop_flag_and_progress_tx(&app);

		let mut scaner = Temporary::new();

		set_scaner_common_settings(&mut scaner, settings);

		scaner.search(&stop_flag, Some(&progress_tx));

		let mut list = scaner.get_temporary_files().clone();
		let mut message = scaner.get_text_messages().create_messages_text();

		list.par_sort_unstable_by(|a, b| {
			split_path_compare(a.path.as_path(), b.path.as_path())
		});

		message = format!("Found {} files\n{}", list.len(), message);

		app.emit(
			"scan-result",
			ScanResult {
				cmd: "scan_temporary_files",
				list,
				message,
			},
		)
		.unwrap();

		set_scaner_state(app, scaner);
	});
}

crate::gen_set_scaner_state_fn!(
	temporary_files_state,
	czkawka_core::tools::temporary::Temporary
);
