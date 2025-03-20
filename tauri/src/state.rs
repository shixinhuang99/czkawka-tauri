use std::sync::Mutex;

use crossbeam_channel::{unbounded, Receiver, Sender};
use czkawka_core::{
	bad_extensions::BadExtensions, big_file::BigFile,
	broken_files::BrokenFiles, duplicate::DuplicateFinder,
	empty_files::EmptyFiles, empty_folder::EmptyFolder,
	invalid_symlinks::InvalidSymlinks, progress_data::ProgressData,
	same_music::SameMusic, similar_images::SimilarImages,
	similar_videos::SimilarVideos, temporary::Temporary,
};
use tauri::{AppHandle, Manager};

pub struct AppState {
	pub is_number_of_threads_setup: bool,
	pub is_progress_thread_setup: bool,
	pub stop_tx: Sender<()>,
	pub stop_rx: Receiver<()>,
	pub progress_tx: Sender<ProgressData>,
	pub progress_rx: Receiver<ProgressData>,
	pub duplication_state: Option<DuplicateFinder>,
	pub empty_folders_state: Option<EmptyFolder>,
	pub empty_files_state: Option<EmptyFiles>,
	pub temporary_files_state: Option<Temporary>,
	pub big_files_state: Option<BigFile>,
	pub similar_images_state: Option<SimilarImages>,
	pub similar_videos_state: Option<SimilarVideos>,
	pub same_music_state: Option<SameMusic>,
	pub same_invalid_symlinks: Option<InvalidSymlinks>,
	pub broken_files_state: Option<BrokenFiles>,
	pub bad_extensions_state: Option<BadExtensions>,
}

impl Default for AppState {
	fn default() -> Self {
		let (stop_tx, stop_rx) = unbounded();
		let (progress_tx, progress_rx) = unbounded();

		AppState {
			is_number_of_threads_setup: false,
			is_progress_thread_setup: false,
			stop_tx,
			stop_rx,
			progress_tx,
			progress_rx,
			duplication_state: None,
			empty_folders_state: None,
			empty_files_state: None,
			temporary_files_state: None,
			big_files_state: None,
			similar_images_state: None,
			similar_videos_state: None,
			same_music_state: None,
			same_invalid_symlinks: None,
			broken_files_state: None,
			bad_extensions_state: None,
		}
	}
}

pub fn get_stop_rx_and_progress_tx(
	app: &AppHandle,
) -> (Receiver<()>, Sender<ProgressData>) {
	let state_mutex = app.state::<Mutex<AppState>>();
	let state = state_mutex.lock().unwrap();
	(state.stop_rx.clone(), state.progress_tx.clone())
}

#[macro_export]
macro_rules! gen_set_scaner_state_fn {
	($name:ident, $scaner:path) => {
		fn set_scaner_state(app: tauri::AppHandle, scaner: $scaner) {
			use tauri::Manager;

			let state_mutex =
				app.state::<std::sync::Mutex<$crate::state::AppState>>();
			let mut state = state_mutex.lock().unwrap();
			state.$name = Some(scaner);
		}
	};
}
