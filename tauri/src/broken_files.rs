use czkawka_core::{
	broken_files::{
		BrokenEntry, BrokenFiles, BrokenFilesParameters, CheckedTypes,
	},
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
	list: Vec<BrokenEntry>,
	message: String,
}

pub fn scan_broken_files(app: AppHandle, settings: Settings) {
	spawn_scaner_thread(move || {
		let (stop_rx, progress_tx) = get_stop_rx_and_progress_tx(&app);

		let mut checked_types: CheckedTypes = CheckedTypes::NONE;
		if settings.broken_files_sub_audio {
			checked_types |= CheckedTypes::AUDIO;
		}
		if settings.broken_files_sub_pdf {
			checked_types |= CheckedTypes::PDF;
		}
		if settings.broken_files_sub_image {
			checked_types |= CheckedTypes::IMAGE;
		}
		if settings.broken_files_sub_archive {
			checked_types |= CheckedTypes::ARCHIVE;
		}
		if checked_types == CheckedTypes::NONE {
			checked_types = CheckedTypes::AUDIO;
		}

		let mut scaner =
			BrokenFiles::new(BrokenFilesParameters::new(checked_types));

		apply_scaner_settings(&mut scaner, settings);

		scaner.find_broken_files(Some(&stop_rx), Some(&progress_tx));

		let mut list = scaner.get_broken_files().clone();
		let mut message = scaner.get_text_messages().create_messages_text();

		list.par_sort_unstable_by(|a, b| {
			split_path_compare(a.path.as_path(), b.path.as_path())
		});

		message = format!("Found {} files\n{}", list.len(), message);

		app.emit(
			"scan-result",
			ScanResult {
				cmd: "scan_broken_files",
				list,
				message,
			},
		)
		.unwrap();
	});
}
