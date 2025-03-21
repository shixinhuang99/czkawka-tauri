use czkawka_core::{
	common_dir_traversal::ToolType,
	progress_data::{CurrentStage, ProgressData},
};
use humansize::{DECIMAL, format_size};
use serde::Serialize;

#[derive(Serialize, Clone)]
#[serde(rename_all = "camelCase")]
pub struct ProgressToSend {
	pub current_progress: i32,
	pub all_progress: i32,
	pub step_name: String,
}

pub fn process_progress_data(progress_data: ProgressData) -> ProgressToSend {
	if progress_data.current_stage_idx == 0 {
		progress_collect_items(
			&progress_data,
			progress_data.tool_type != ToolType::EmptyFolders,
		)
	} else if progress_data.sstage.check_if_loading_saving_cache() {
		progress_save_load_cache(&progress_data)
	} else {
		progress_default(&progress_data)
	}
}

fn progress_save_load_cache(item: &ProgressData) -> ProgressToSend {
	let step_name = match item.sstage {
		CurrentStage::SameMusicCacheLoadingTags => "Loading tags cache",
		CurrentStage::SameMusicCacheLoadingFingerprints => {
			"Loading fingerprints cache"
		}
		CurrentStage::SameMusicCacheSavingTags => "Saving tags cache",
		CurrentStage::SameMusicCacheSavingFingerprints => {
			"Saving fingerprints cache"
		}
		CurrentStage::DuplicatePreHashCacheLoading => "Loading prehash cache",
		CurrentStage::DuplicatePreHashCacheSaving => "Saving prehash cache",
		CurrentStage::DuplicateCacheLoading => "Loading hash cache",
		CurrentStage::DuplicateCacheSaving => "Saving hash cache",
		_ => unreachable!(),
	};
	let (all_progress, current_progress) = common_get_data(item);
	ProgressToSend {
		all_progress,
		current_progress,
		step_name: step_name.into(),
	}
}

fn progress_collect_items(item: &ProgressData, files: bool) -> ProgressToSend {
	let step_name = match item.sstage {
		CurrentStage::DuplicateScanningName => {
			format!("Scanning name of {} file", item.entries_checked)
		}
		CurrentStage::DuplicateScanningSizeName => {
			format!("Scanning size and name of {} file", item.entries_checked)
		}
		CurrentStage::DuplicateScanningSize => {
			format!("Scanning size of {} file", item.entries_checked)
		}
		_ => {
			if files {
				format!("Scanning {} file", item.entries_checked)
			} else {
				format!("Scanning {} folder", item.entries_checked)
			}
		}
	};
	let (all_progress, current_progress) = no_current_stage_get_data(item);
	ProgressToSend {
		all_progress,
		current_progress,
		step_name,
	}
}

fn progress_default(item: &ProgressData) -> ProgressToSend {
	let items_stats =
		format!("{}/{}", item.entries_checked, item.entries_to_check);
	let size_stats = format!(
		"{}/{}",
		format_size(item.bytes_checked, DECIMAL),
		format_size(item.bytes_to_check, DECIMAL)
	);
	let step_name = match item.sstage {
		CurrentStage::SameMusicReadingTags => {
			format!("Checked tags of {items_stats}")
		}
		CurrentStage::SameMusicCalculatingFingerprints => {
			format!("Checked content of {items_stats} ({size_stats})")
		}
		CurrentStage::SameMusicComparingTags => {
			format!("Compared tags of {items_stats}")
		}
		CurrentStage::SameMusicComparingFingerprints => {
			format!("Compared content of {items_stats}")
		}
		CurrentStage::SimilarImagesCalculatingHashes => {
			format!("Hashed of {items_stats} image ({size_stats})")
		}
		CurrentStage::SimilarImagesComparingHashes => {
			format!("Compared {items_stats} image hash")
		}
		CurrentStage::SimilarVideosCalculatingHashes => {
			format!("Hashed of {items_stats} video")
		}
		CurrentStage::BrokenFilesChecking => {
			format!("Checked {items_stats} file ({size_stats})")
		}
		CurrentStage::BadExtensionsChecking => {
			format!("Checked {items_stats} file")
		}
		CurrentStage::DuplicatePreHashing => format!(
			"Analyzed partial hash of {items_stats} files ({size_stats})"
		),
		CurrentStage::DuplicateFullHashing => {
			format!("Analyzed full hash of {items_stats} files ({size_stats})")
		}
		_ => unreachable!(),
	};
	let (all_progress, current_progress) = common_get_data(item);
	ProgressToSend {
		all_progress,
		current_progress,
		step_name,
	}
}

// Used when current stage not have enough data to show status, so we show only all_stages
// Happens if we are searching files and we don't know how many files we need to check
fn no_current_stage_get_data(item: &ProgressData) -> (i32, i32) {
	let all_stages =
		(item.current_stage_idx as f64) / (item.max_stage_idx + 1) as f64;

	((all_stages * 100.0) as i32, -1)
}

// Used to calculate number of files to check and also to calculate current progress according to number of files to check and checked
fn common_get_data(item: &ProgressData) -> (i32, i32) {
	if item.entries_to_check != 0 {
		let all_stages = (item.current_stage_idx as f64
			+ item.entries_checked as f64 / item.entries_to_check as f64)
			/ (item.max_stage_idx + 1) as f64;
		let all_stages = all_stages.min(0.99);

		let current_stage =
			item.entries_checked as f64 / item.entries_to_check as f64;
		let current_stage = current_stage.min(0.99);
		((all_stages * 100.0) as i32, (current_stage * 100.0) as i32)
	} else {
		let all_stages =
			(item.current_stage_idx as f64) / (item.max_stage_idx + 1) as f64;
		let all_stages = all_stages.min(0.99);
		((all_stages * 100.0) as i32, 0)
	}
}
