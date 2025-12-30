use std::path::Path;

use czkawka_core::{common::DEFAULT_THREAD_SIZE, common_tool::CommonData};
use serde::Serialize;

use crate::{
	settings::Settings,
	utils::{convert_strs_to_path_bufs, split_str_with_comma},
};

#[derive(Serialize)]
pub struct ConflictInfo {
	pub included: String,
	pub excluded: String,
}

pub fn spawn_scaner_thread<F: FnOnce() + Send + 'static>(f: F) {
	std::thread::Builder::new()
		.stack_size(DEFAULT_THREAD_SIZE)
		.spawn(f)
		.expect("Failed to spawn scaner thread");
}

/// Helper function to find all conflicts between included and excluded directories
/// Returns a list of (included_path, excluded_path) tuples where included is inside excluded
fn find_conflicts(
	included: &[String],
	excluded: &[String],
) -> Vec<(String, String)> {
	let mut conflicts = Vec::new();

	for include_path in included {
		let include = Path::new(include_path);

		for exclude_path in excluded {
			let exclude = Path::new(exclude_path);

			// Check if included directory is inside an excluded directory
			if include.starts_with(exclude) {
				conflicts.push((include_path.clone(), exclude_path.clone()));
			}
		}
	}

	conflicts
}

/// Validates that included directories are not excluded by parent directories
/// Returns a list of human-readable messages
pub fn validate_directory_conflicts(
	included: &[String],
	excluded: &[String],
) -> Vec<String> {
	find_conflicts(included, excluded)
		.into_iter()
		.map(|(inc, exc)| format!("Included '{}' and Excluded '{}'", inc, exc))
		.collect()
}

/// Check if adding a single path to a specific field would create a conflict
/// Returns conflict info if there's a conflict, None otherwise
pub fn check_path_conflict(
	path_to_add: &str,
	target_field: &str,
	current_included: &[String],
	current_excluded: &[String],
) -> Option<ConflictInfo> {
	let conflicts = if target_field == "includedDirectories" {
		// Check if new included path is inside any excluded path
		find_conflicts(&[path_to_add.to_string()], current_excluded)
	} else if target_field == "excludedDirectories" {
		// Check if new excluded path contains any included path
		find_conflicts(current_included, &[path_to_add.to_string()])
	} else {
		Vec::new()
	};

	conflicts.first().map(|(inc, exc)| ConflictInfo {
		included: inc.clone(),
		excluded: exc.clone(),
	})
}

pub fn set_scaner_common_settings<T: CommonData>(
	scaner: &mut T,
	settings: Settings,
) {
	// Validate directory conflicts
	let warnings = validate_directory_conflicts(
		&settings.included_directories,
		&settings.excluded_directories,
	);
	for warning in &warnings {
		log::warn!("⚠️  {}", warning);
	}

	// Also check reference directories
	if !settings.included_directories_referenced.is_empty() {
		let ref_warnings = validate_directory_conflicts(
			&settings.included_directories_referenced,
			&settings.excluded_directories,
		);
		for warning in &ref_warnings {
			log::warn!("⚠️  {}", warning);
		}
	}

	let all_referenced = settings.included_directories.len()
		== settings.included_directories_referenced.len();

	scaner.set_included_directory(convert_strs_to_path_bufs(
		settings.included_directories,
	));
	if !all_referenced {
		scaner.set_reference_directory(convert_strs_to_path_bufs(
			settings.included_directories_referenced,
		));
	}
	scaner.set_excluded_directory(convert_strs_to_path_bufs(
		settings.excluded_directories,
	));
	scaner.set_recursive_search(settings.recursive_search);
	scaner.set_minimal_file_size(settings.minimum_file_size as u64 * 1000);
	scaner.set_maximal_file_size(settings.maximum_file_size as u64 * 1000);
	scaner.set_allowed_extensions(settings.allowed_extensions.clone());
	scaner.set_excluded_extensions(settings.excluded_extensions.clone());
	scaner.set_excluded_items(split_str_with_comma(settings.excluded_items));
	scaner.set_use_cache(settings.use_cache);
	scaner.set_save_also_as_json(settings.save_also_as_json);
}
