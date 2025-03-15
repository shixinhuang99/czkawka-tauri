use czkawka_core::{common::DEFAULT_THREAD_SIZE, common_tool::CommonData};

use crate::{
	settings::Settings,
	utils::{convert_strs_to_path_bufs, split_str_with_comma},
};

pub fn spawn_scaner_thread<F: FnOnce() + Send + 'static>(f: F) {
	std::thread::Builder::new()
		.stack_size(DEFAULT_THREAD_SIZE)
		.spawn(f)
		.expect("Failed to spawn scaner thread");
}

pub fn apply_scaner_settings<T: CommonData>(
	scaner: &mut T,
	settings: Settings,
) {
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
