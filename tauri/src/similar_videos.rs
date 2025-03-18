use czkawka_core::{
	common::split_path_compare,
	common_tool::CommonData,
	similar_videos::{SimilarVideos, SimilarVideosParameters, VideosEntry},
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
struct CustomVideosEntry {
	path: String,
	size: u64,
	modified_date: u64,
}

#[derive(Serialize, Clone)]
struct ScanResult {
	cmd: &'static str,
	list: Vec<(Option<CustomVideosEntry>, Vec<CustomVideosEntry>)>,
	message: String,
}

pub fn scan_similar_videos(app: AppHandle, settins: Settings) {
	spawn_scaner_thread(move || {
		let (stop_rx, progress_tx) = get_stop_rx_and_progress_tx(&app);

		let mut scaner = SimilarVideos::new(SimilarVideosParameters::new(
			settins.similar_videos_sub_similarity,
			settins.similar_videos_sub_ignore_same_size,
			settins.similar_videos_hide_hard_links,
		));

		scaner.set_delete_outdated_cache(
			settins.similar_videos_delete_outdated_entries,
		);
		apply_scaner_settings(&mut scaner, settins);

		scaner.find_similar_videos(Some(&stop_rx), Some(&progress_tx));

		let mut message = scaner.get_text_messages().create_messages_text();
		let mut raw_list;

		if scaner.get_use_reference() {
			raw_list = scaner
				.get_similar_videos_referenced()
				.iter()
				.cloned()
				.map(|(original, others)| (Some(original), others))
				.collect::<Vec<_>>();
		} else {
			raw_list = scaner
				.get_similar_videos()
				.iter()
				.cloned()
				.map(|items| (None, items))
				.collect::<Vec<_>>();
		}

		for (_, vec_fe) in &mut raw_list {
			vec_fe.par_sort_unstable_by(|a, b| {
				split_path_compare(a.path.as_path(), b.path.as_path())
			});
		}

		message = format!(
			"Found {} similar video files\n{}",
			raw_list.len(),
			message
		);

		let list = raw_list
			.into_iter()
			.map(|(ref_item, item)| {
				(
					ref_item.map(videos_entry_to_custom),
					item.into_iter().map(videos_entry_to_custom).collect(),
				)
			})
			.collect::<Vec<_>>();

		app.emit(
			"scan-result",
			ScanResult {
				cmd: "scan_similar_videos",
				list,
				message,
			},
		)
		.unwrap();
	});
}

fn videos_entry_to_custom(value: VideosEntry) -> CustomVideosEntry {
	CustomVideosEntry {
		path: value.path.to_string_lossy().to_string(),
		size: value.size,
		modified_date: value.modified_date,
	}
}
