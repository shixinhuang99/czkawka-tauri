use std::sync::Mutex;

use czkawka_core::common_traits::PrintResults;
use serde::Deserialize;
use tauri::{AppHandle, Emitter, Manager};

use crate::state::AppState;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Options {
	current_tool: String,
	destination: String,
}

pub fn save_result(app: AppHandle, options: Options) {
	let Options {
		current_tool,
		destination,
	} = options;
	let state_mutex = app.state::<Mutex<AppState>>();
	let state = state_mutex.lock().unwrap();

	let result = match current_tool.as_ref() {
		"Duplicate Files" => state.duplication_state.as_ref().map(|scaner| {
			scaner.save_all_in_one(&destination, "results_duplicates")
		}),
		"Empty Folders" => state.empty_folders_state.as_ref().map(|scaner| {
			scaner.save_all_in_one(&destination, "results_empty_directories")
		}),
		"Big Files" => state.big_files_state.as_ref().map(|scaner| {
			scaner.save_all_in_one(&destination, "results_big_files")
		}),
		"Empty Files" => state.empty_files_state.as_ref().map(|scaner| {
			scaner.save_all_in_one(&destination, "results_empty_files")
		}),
		"Temporary Files" => {
			state.temporary_files_state.as_ref().map(|scaner| {
				scaner.save_all_in_one(&destination, "results_temporary_files")
			})
		}
		"Similar Images" => state.similar_images_state.as_ref().map(|scaner| {
			scaner.save_all_in_one(&destination, "results_similar_images")
		}),
		"Similar Videos" => state.similar_videos_state.as_ref().map(|scaner| {
			scaner.save_all_in_one(&destination, "results_similar_videos")
		}),
		"Music Duplicates" => state.same_music_state.as_ref().map(|scaner| {
			scaner.save_all_in_one(&destination, "results_same_music")
		}),
		"Invalid Symlinks" => {
			state.same_invalid_symlinks.as_ref().map(|scaner| {
				scaner.save_all_in_one(&destination, "results_invalid_symlinks")
			})
		}
		"Broken Files" => state.broken_files_state.as_ref().map(|scaner| {
			scaner.save_all_in_one(&destination, "results_broken_files")
		}),
		"Bad Extensions" => state.bad_extensions_state.as_ref().map(|scaner| {
			scaner.save_all_in_one(&destination, "results_bad_extensions")
		}),
		_ => return,
	};

	let message = if result.is_some_and(|v| v.is_ok()) {
		format!(
			"Successfully saved `{}` results to `{}`",
			current_tool, destination
		)
	} else {
		format!(
			"Failed to Save `{}` results to `{}`",
			current_tool, destination
		)
	};

	app.emit("save-result-done", message).unwrap();
}
