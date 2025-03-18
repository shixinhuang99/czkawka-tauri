use czkawka_core::{
	bad_extensions::{BadExtensions, BadExtensionsParameters, BadFileEntry},
	common::split_path_compare,
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
	list: Vec<BadFileEntry>,
	message: String,
}

pub fn scan_bad_extensions(app: AppHandle, settings: Settings) {
	spawn_scaner_thread(move || {
		let (stop_rx, progress_tx) = get_stop_rx_and_progress_tx(&app);

		let mut scaner = BadExtensions::new(BadExtensionsParameters::new());

		apply_scaner_settings(&mut scaner, settings);

		scaner.find_bad_extensions_files(Some(&stop_rx), Some(&progress_tx));

		let mut list = scaner.get_bad_extensions_files().clone();
		let mut message = scaner.get_text_messages().create_messages_text();

		list.par_sort_unstable_by(|a, b| {
			split_path_compare(a.path.as_path(), b.path.as_path())
		});

		message = format!(
			"Found {} files with bad extensions\n{}",
			list.len(),
			message
		);

		app.emit(
			"scan-result",
			ScanResult {
				cmd: "scan_bad_extensions",
				list,
				message,
			},
		)
		.unwrap();
	});
}
