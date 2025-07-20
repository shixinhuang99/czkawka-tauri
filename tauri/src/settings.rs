use czkawka_core::{
	common::{get_all_available_threads, get_config_cache_path},
	common_items::{DEFAULT_EXCLUDED_DIRECTORIES, DEFAULT_EXCLUDED_ITEMS},
};
use serde::{Deserialize, Serialize};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Settings {
	pub included_directories: Vec<String>,
	pub included_directories_referenced: Vec<String>,
	pub excluded_directories: Vec<String>,
	pub excluded_items: String,
	pub allowed_extensions: String,
	pub excluded_extensions: String,
	pub minimum_file_size: i32,
	pub maximum_file_size: i32,
	pub recursive_search: bool,
	pub use_cache: bool,
	pub save_also_as_json: bool,
	pub duplicate_hide_hard_links: bool,
	pub duplicate_use_prehash: bool,
	pub duplicate_minimal_hash_cache_size: i32,
	pub duplicate_minimal_prehash_cache_size: i32,
	pub duplicate_delete_outdated_entries: bool,
	pub similar_images_hide_hard_links: bool,
	pub similar_images_delete_outdated_entries: bool,
	pub similar_videos_delete_outdated_entries: bool,
	pub similar_music_delete_outdated_entries: bool,
	pub similar_images_sub_hash_size: String,
	pub similar_images_sub_hash_alg: String,
	pub similar_images_sub_resize_algorithm: String,
	pub similar_images_sub_ignore_same_size: bool,
	pub similar_images_sub_similarity: i32,
	pub duplicates_sub_check_method: String,
	pub duplicates_sub_available_hash_type: String,
	pub duplicates_sub_name_case_sensitive: bool,
	pub biggest_files_sub_method: String,
	pub biggest_files_sub_number_of_files: i32,
	pub similar_videos_hide_hard_links: bool,
	pub similar_videos_sub_ignore_same_size: bool,
	pub similar_videos_sub_similarity: i32,
	pub similar_music_sub_audio_check_type: String,
	pub similar_music_sub_approximate_comparison: bool,
	pub similar_music_compare_fingerprints_only_with_similar_titles: bool,
	pub similar_music_sub_title: bool,
	pub similar_music_sub_artist: bool,
	pub similar_music_sub_year: bool,
	pub similar_music_sub_bitrate: bool,
	pub similar_music_sub_genre: bool,
	pub similar_music_sub_length: bool,
	pub similar_music_sub_maximum_difference_value: f32,
	pub similar_music_sub_minimal_fragment_duration_value: f32,
	pub broken_files_sub_audio: bool,
	pub broken_files_sub_pdf: bool,
	pub broken_files_sub_archive: bool,
	pub broken_files_sub_image: bool,
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct PlatformSettings {
	pub included_directories: Vec<String>,
	pub excluded_directories: Vec<String>,
	pub excluded_items: String,
	pub available_thread_number: usize,
	pub cache_dir_path: String,
}

impl Default for PlatformSettings {
	fn default() -> Self {
		PlatformSettings {
			included_directories: default_included_directories(),
			excluded_directories: default_excluded_directories(),
			excluded_items: default_excluded_items(),
			available_thread_number: get_all_available_threads(),
			cache_dir_path: get_config_cache_path()
				.map(|config_cache| {
					config_cache.cache_folder.to_string_lossy().to_string()
				})
				.unwrap_or_default(),
		}
	}
}

fn default_included_directories() -> Vec<String> {
	let mut included_directories = vec![];

	if let Some(home_dir) = home::home_dir() {
		included_directories.push(home_dir.to_string_lossy().to_string());
	} else if let Ok(current_dir) = std::env::current_dir() {
		included_directories.push(current_dir.to_string_lossy().to_string());
	} else if cfg!(target_family = "unix") {
		included_directories.push("/".to_string());
	} else {
		included_directories.push("C:\\".to_string());
	};

	included_directories
}

fn default_excluded_directories() -> Vec<String> {
	let mut dirs = vec![];

	if cfg!(target_os = "macos") {
		if let Some(home_dir) = home::home_dir() {
			let home_dir = home_dir.to_string_lossy();
			let items = [
				"Downloads",
				"Documents",
				"Desktop",
				"Pictures/Photos Library.photoslibrary",
				"Library/Photos/Libraries/Syndication.photoslibrary",
				"Library/Application Support/AddressBook",
				"Library/Calendars",
				"Library/Reminders",
			];
			for item in items {
				dirs.push(format!("{home_dir}/{item}"));
			}
		}
	}

	let default_dirs: Vec<_> = DEFAULT_EXCLUDED_DIRECTORIES
		.iter()
		.map(|s| s.to_string())
		.collect();

	dirs.extend(default_dirs);

	dirs
}

fn default_excluded_items() -> String {
	DEFAULT_EXCLUDED_ITEMS.to_string()
}
