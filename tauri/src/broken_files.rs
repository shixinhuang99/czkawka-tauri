use czkawka_core::{
	common::{split_path_compare, tool_data::CommonData, traits::Search},
	tools::broken_files::{
		BrokenEntry, BrokenFiles, BrokenFilesParameters, CheckedTypes,
	},
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
	list: Vec<BrokenEntry>,
	message: String,
}

pub fn scan_broken_files(app: AppHandle, settings: Settings) {
	spawn_scaner_thread(move || {
		let (stop_flag, progress_tx) = get_stop_flag_and_progress_tx(&app);

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

		set_scaner_common_settings(&mut scaner, settings);

		scaner.search(&stop_flag, Some(&progress_tx));

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

		set_scaner_state(app, scaner);
	});
}

crate::gen_set_scaner_state_fn!(
	broken_files_state,
	czkawka_core::tools::broken_files::BrokenFiles
);
