use czkawka_core::{
	common_tool::CommonData,
	tools::similar_images::{
		ImagesEntry, SimilarImages, SimilarImagesParameters,
		get_string_from_similarity,
	},
};
use image_hasher::{FilterType, HashAlg};
use rayon::prelude::*;
use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::{
	scaner::{set_scaner_common_settings, spawn_scaner_thread},
	settings::Settings,
	state::get_stop_flag_and_progress_tx,
};

#[derive(Serialize, Clone)]
struct CustomImagesEntry {
	path: String,
	size: u64,
	width: u32,
	height: u32,
	modified_date: u64,
	similarity: String,
}

#[derive(Serialize, Clone)]
struct ScanResult {
	cmd: &'static str,
	list: Vec<(Option<CustomImagesEntry>, Vec<CustomImagesEntry>)>,
	message: String,
}

pub fn scan_similar_images(app: AppHandle, settins: Settings) {
	spawn_scaner_thread(move || {
		let (stop_flag, progress_tx) = get_stop_flag_and_progress_tx(&app);

		let hash_alg = match settins.similar_images_sub_hash_alg.as_ref() {
			"Gradient" => HashAlg::Gradient,
			"BlockHash" => HashAlg::Blockhash,
			"VertGradient" => HashAlg::VertGradient,
			"DoubleGradient" => HashAlg::DoubleGradient,
			"Median" => HashAlg::Median,
			_ => HashAlg::Mean,
		};
		let resize_algorithm =
			match settins.similar_images_sub_resize_algorithm.as_ref() {
				"Gaussian" => FilterType::Gaussian,
				"CatmullRom" => FilterType::CatmullRom,
				"Triangle" => FilterType::Triangle,
				"Nearest" => FilterType::Nearest,
				_ => FilterType::Lanczos3,
			};
		let hash_size = settins
			.similar_images_sub_hash_size
			.parse::<u8>()
			.unwrap_or(16);
		let mut scaner = SimilarImages::new(SimilarImagesParameters::new(
			settins.similar_images_sub_similarity as u32,
			hash_size,
			hash_alg,
			resize_algorithm,
			settins.similar_images_sub_ignore_same_size,
			settins.similar_images_hide_hard_links,
		));

		scaner.set_delete_outdated_cache(
			settins.similar_images_delete_outdated_entries,
		);
		set_scaner_common_settings(&mut scaner, settins);

		scaner.find_similar_images(Some(&stop_flag), Some(&progress_tx));

		let mut message = scaner.get_text_messages().create_messages_text();
		let mut raw_list: Vec<_> = if scaner.get_use_reference() {
			scaner
				.get_similar_images_referenced()
				.iter()
				.cloned()
				.map(|(original, others)| (Some(original), others))
				.collect()
		} else {
			scaner
				.get_similar_images()
				.iter()
				.cloned()
				.map(|items| (None, items))
				.collect()
		};

		for (_, vec_fe) in &mut raw_list {
			vec_fe.par_sort_unstable_by_key(|e| e.similarity);
		}

		message = format!(
			"Found {} similar image files\n{}",
			raw_list.len(),
			message
		);

		let list = raw_list
			.into_iter()
			.map(|(ref_item, item)| {
				(
					ref_item.map(|v| images_entry_to_custom(v, hash_size)),
					item.into_iter()
						.map(|v| images_entry_to_custom(v, hash_size))
						.collect(),
				)
			})
			.collect::<Vec<_>>();

		app.emit(
			"scan-result",
			ScanResult {
				cmd: "scan_similar_images",
				list,
				message,
			},
		)
		.unwrap();

		set_scaner_state(app, scaner);
	});
}

fn images_entry_to_custom(
	value: ImagesEntry,
	hash_size: u8,
) -> CustomImagesEntry {
	CustomImagesEntry {
		path: value.path.to_string_lossy().to_string(),
		size: value.size,
		width: value.width,
		height: value.height,
		modified_date: value.modified_date,
		similarity: get_string_from_similarity(&value.similarity, hash_size),
	}
}

crate::gen_set_scaner_state_fn!(
	similar_images_state,
	czkawka_core::tools::similar_images::SimilarImages
);
