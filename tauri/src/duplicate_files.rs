use czkawka_core::{
	common::split_path_compare,
	common_dir_traversal::CheckingMethod,
	common_tool::CommonData,
	duplicate::{
		DuplicateEntry, DuplicateFinder, DuplicateFinderParameters, HashType,
	},
};
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

use crate::{
	scaner::{apply_scaner_settings, spawn_scaner_thread},
	settings::Settings,
	state::get_stop_rx_and_progress_tx,
};

#[derive(Serialize, Deserialize, Clone)]
struct ScanResult {
	cmd: &'static str,
	list: Vec<(Option<DuplicateEntry>, Vec<DuplicateEntry>)>,
	message: String,
}

pub fn scan_duplicate_files(app: AppHandle, settings: Settings) {
	let (stop_rx, progress_tx) = get_stop_rx_and_progress_tx(&app);

	spawn_scaner_thread(move || {
		let hash_type =
			match settings.duplicates_sub_available_hash_type.as_ref() {
				"CRC32" => HashType::Crc32,
				"XXH3" => HashType::Xxh3,
				_ => HashType::Blake3,
			};
		let check_method = match settings.duplicates_sub_check_method.as_ref() {
			"Size" => CheckingMethod::Size,
			"Name" => CheckingMethod::Name,
			"SizeAndName" => CheckingMethod::SizeName,
			_ => CheckingMethod::Hash,
		};
		let mut scaner = DuplicateFinder::new(DuplicateFinderParameters::new(
			check_method,
			hash_type,
			settings.duplicate_hide_hard_links,
			settings.duplicate_use_prehash,
			settings.duplicate_minimal_hash_cache_size as u64,
			settings.duplicate_minimal_prehash_cache_size as u64,
			settings.duplicates_sub_name_case_sensitive,
		));

		scaner.set_delete_outdated_cache(
			settings.duplicate_delete_outdated_entries,
		);
		apply_scaner_settings(&mut scaner, settings);

		scaner.find_duplicates(Some(&stop_rx), Some(&progress_tx));

		let mut message = scaner.get_text_messages().create_messages_text();
		let mut list;
		if scaner.get_use_reference() {
			match scaner.get_params().check_method {
				CheckingMethod::Hash => {
					list = scaner
						.get_files_with_identical_hashes_referenced()
						.values()
						.flatten()
						.cloned()
						.map(|(original, other)| (Some(original), other))
						.collect::<Vec<_>>();
				}
				CheckingMethod::Name
				| CheckingMethod::Size
				| CheckingMethod::SizeName => {
					let values: Vec<_> = match scaner.get_params().check_method
					{
						CheckingMethod::Name => scaner
							.get_files_with_identical_name_referenced()
							.values()
							.cloned()
							.collect(),
						CheckingMethod::Size => scaner
							.get_files_with_identical_size_referenced()
							.values()
							.cloned()
							.collect(),
						CheckingMethod::SizeName => scaner
							.get_files_with_identical_size_names_referenced()
							.values()
							.cloned()
							.collect(),
						_ => unreachable!("Invalid check method."),
					};
					list = values
						.into_iter()
						.map(|(original, other)| (Some(original), other))
						.collect::<Vec<_>>();
				}
				_ => unreachable!("Invalid check method."),
			}
		} else {
			match scaner.get_params().check_method {
				CheckingMethod::Hash => {
					list = scaner
						.get_files_sorted_by_hash()
						.values()
						.flatten()
						.cloned()
						.map(|items| (None, items))
						.collect::<Vec<_>>();
				}
				CheckingMethod::Name
				| CheckingMethod::Size
				| CheckingMethod::SizeName => {
					let values: Vec<_> = match scaner.get_params().check_method
					{
						CheckingMethod::Name => scaner
							.get_files_sorted_by_names()
							.values()
							.cloned()
							.collect(),
						CheckingMethod::Size => scaner
							.get_files_sorted_by_size()
							.values()
							.cloned()
							.collect(),
						CheckingMethod::SizeName => scaner
							.get_files_sorted_by_size_name()
							.values()
							.cloned()
							.collect(),
						_ => unreachable!("Invalid check method."),
					};
					list = values
						.into_iter()
						.map(|items| (None, items))
						.collect::<Vec<_>>();
				}
				_ => unreachable!("Invalid check method."),
			}
		}

		for (_, vec) in &mut list {
			vec.par_sort_unstable_by(|a, b| {
				split_path_compare(a.path.as_path(), b.path.as_path())
			});
		}

		message = format!(
			"Found {} similar duplicates files\n{}",
			list.len(),
			message
		);

		app.emit(
			"scan-result",
			ScanResult {
				cmd: "scan_duplicate_files",
				list,
				message,
			},
		)
		.unwrap();
	});
}
