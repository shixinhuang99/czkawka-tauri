use czkawka_core::{
	common::{
		model::CheckingMethod, split_path_compare, tool_data::CommonData,
		traits::Search,
	},
	tools::same_music::{
		MusicEntry, MusicSimilarity, SameMusic, SameMusicParameters,
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
struct CustomMusicEntry {
	size: u64,
	path: String,
	modified_date: u64,
	track_title: String,
	track_artist: String,
	year: String,
	length: String,
	genre: String,
	bitrate: u32,
}

#[derive(Serialize, Clone)]
struct ScanResult {
	cmd: &'static str,
	list: Vec<(Option<CustomMusicEntry>, Vec<CustomMusicEntry>)>,
	message: String,
}

pub fn scan_music_duplicates(app: AppHandle, settins: Settings) {
	spawn_scaner_thread(move || {
		let (stop_flag, progress_tx) = get_stop_flag_and_progress_tx(&app);

		let mut music_similarity: MusicSimilarity = MusicSimilarity::NONE;
		if settins.similar_music_sub_title {
			music_similarity |= MusicSimilarity::TRACK_TITLE;
		}
		if settins.similar_music_sub_artist {
			music_similarity |= MusicSimilarity::TRACK_ARTIST;
		}
		if settins.similar_music_sub_bitrate {
			music_similarity |= MusicSimilarity::BITRATE;
		}
		if settins.similar_music_sub_length {
			music_similarity |= MusicSimilarity::LENGTH;
		}
		if settins.similar_music_sub_year {
			music_similarity |= MusicSimilarity::YEAR;
		}
		if settins.similar_music_sub_genre {
			music_similarity |= MusicSimilarity::GENRE;
		}
		if music_similarity == MusicSimilarity::NONE {
			music_similarity =
				MusicSimilarity::TRACK_TITLE | MusicSimilarity::TRACK_ARTIST;
		}

		let audio_check_type =
			match settins.similar_music_sub_audio_check_type.as_ref() {
				"Fingerprint" => CheckingMethod::AudioContent,
				_ => CheckingMethod::AudioTags,
			};

		let mut scaner = SameMusic::new(SameMusicParameters::new(
			music_similarity,
			settins.similar_music_sub_approximate_comparison,
			audio_check_type,
			settins.similar_music_sub_minimal_fragment_duration_value,
			settins.similar_music_sub_maximum_difference_value as f64,
			settins.similar_music_compare_fingerprints_only_with_similar_titles,
		));

		scaner.set_delete_outdated_cache(
			settins.similar_music_delete_outdated_entries,
		);

		set_scaner_common_settings(&mut scaner, settins);

		scaner.search(&stop_flag, Some(&progress_tx));

		let mut message = scaner.get_text_messages().create_messages_text();
		let mut raw_list: Vec<_> = if scaner.get_use_reference() {
			scaner
				.get_similar_music_referenced()
				.iter()
				.cloned()
				.map(|(original, others)| (Some(original), others))
				.collect()
		} else {
			scaner
				.get_duplicated_music_entries()
				.iter()
				.cloned()
				.map(|items| (None, items))
				.collect()
		};

		for (_, vec_fe) in &mut raw_list {
			vec_fe.par_sort_unstable_by(|a, b| {
				split_path_compare(a.path.as_path(), b.path.as_path())
			});
		}

		message = format!(
			"Found {} similar music files\n{}",
			raw_list.len(),
			message
		);

		let list = raw_list
			.into_iter()
			.map(|(ref_item, item)| {
				(
					ref_item.map(music_entry_to_custom),
					item.into_iter().map(music_entry_to_custom).collect(),
				)
			})
			.collect::<Vec<_>>();

		app.emit(
			"scan-result",
			ScanResult {
				cmd: "scan_music_duplicates",
				list,
				message,
			},
		)
		.unwrap();

		set_scaner_state(app, scaner);
	});
}

fn music_entry_to_custom(value: MusicEntry) -> CustomMusicEntry {
	CustomMusicEntry {
		size: value.size,
		path: value.path.to_string_lossy().to_string(),
		modified_date: value.modified_date,
		track_title: value.track_title,
		track_artist: value.track_artist,
		year: value.year,
		length: value.length,
		genre: value.genre,
		bitrate: value.bitrate,
	}
}

crate::gen_set_scaner_state_fn!(
	same_music_state,
	czkawka_core::tools::same_music::SameMusic
);
