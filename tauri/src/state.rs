use std::sync::Mutex;

use crossbeam_channel::{unbounded, Receiver, Sender};
use czkawka_core::progress_data::ProgressData;
use tauri::{AppHandle, Manager};

pub struct AppState {
	pub is_number_of_threads_setup: bool,
	pub is_progress_thread_setup: bool,
	pub stop_tx: Sender<()>,
	pub stop_rx: Receiver<()>,
	pub progress_tx: Sender<ProgressData>,
	pub progress_rx: Receiver<ProgressData>,
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
