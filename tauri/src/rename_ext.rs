use std::{fs, path::PathBuf};

use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

#[derive(Deserialize)]
pub struct Options {
	items: Vec<Item>,
}

#[derive(Deserialize)]
struct Item {
	path: String,
	ext: String,
}

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct RenameExtResult {
	success_paths: Vec<String>,
	errors: Vec<String>,
}

pub fn rename_ext(app: AppHandle, options: Options) {
	std::thread::spawn(move || {
		let result = rename_ext_impl(options);
		app.emit("rename-ext-result", result).unwrap();
	});
}

fn rename_ext_impl(options: Options) -> RenameExtResult {
	let Options { items } = options;

	items
		.par_iter()
		.fold(RenameExtResult::default, |mut result, item| {
			let old_path = PathBuf::from(&item.path);
			let mut new_path = old_path.clone();

			new_path.set_extension(&item.ext);

			if new_path == old_path {
				result.success_paths.push(item.path.clone());
				return result;
			}

			match fs::rename(old_path, new_path) {
				Ok(_) => result.success_paths.push(item.path.clone()),
				Err(err) => result
					.errors
					.push(format!("`{}` Failed, reason: {}", item.path, err)),
			}

			result
		})
		.reduce(RenameExtResult::default, |mut acc, mut x| {
			acc.success_paths.append(&mut x.success_paths);
			acc.errors.append(&mut x.errors);
			acc
		})
}
