use std::{fs, path::Path};

use czkawka_core::common::remove_folder_if_contains_only_empty_folders;
use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Options {
	paths: Vec<String>,
	move_deleted_files_to_trash: bool,
	is_empty_folders_tool: bool,
}

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct DeleteFilesResult {
	success_paths: Vec<String>,
	errors: Vec<String>,
}

pub fn delete_files(app: AppHandle, options: Options) {
	std::thread::spawn(move || {
		let result = delete_files_impl(options);
		app.emit("delete-files-result", result).unwrap();
	});
}

fn delete_files_impl(options: Options) -> DeleteFilesResult {
	let Options {
		paths,
		move_deleted_files_to_trash,
		is_empty_folders_tool,
	} = options;

	paths
		.par_iter()
		.fold(DeleteFilesResult::default, |mut result, path_str| {
			let path = Path::new(path_str);

			if !path.exists() {
				result.errors.push(format!("`{path_str}` not found"));
				return result;
			}

			let fs_result = if is_empty_folders_tool {
				remove_folder_if_contains_only_empty_folders(
					path,
					move_deleted_files_to_trash,
				)
			} else if move_deleted_files_to_trash {
				trash::delete(path).map_err(|err| err.to_string())
			} else {
				fs::remove_file(path).map_err(|err| err.to_string())
			};

			match fs_result {
				Ok(_) => result.success_paths.push(path_str.clone()),
				Err(err) => result
					.errors
					.push(format!("`{path_str}` Failed, reason: {err}")),
			}

			result
		})
		.reduce(DeleteFilesResult::default, |mut acc, mut x| {
			acc.success_paths.append(&mut x.success_paths);
			acc.errors.append(&mut x.errors);
			acc
		})
}
