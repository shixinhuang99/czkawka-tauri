use std::{
	fs, io,
	path::{Path, PathBuf},
};

use rayon::prelude::*;
use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter};

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Options {
	paths: Vec<String>,
	destination: String,
	copy_mode: bool,
	preserve_structure: bool,
	override_mode: bool,
}

#[derive(Serialize, Clone, Default)]
#[serde(rename_all = "camelCase")]
struct MoveFilesResult {
	success_paths: Vec<String>,
	errors: Vec<String>,
}

pub fn move_files(app: AppHandle, options: Options) {
	std::thread::spawn(move || {
		let result = move_files_impl(options);
		app.emit("move-files-result", result).unwrap();
	});
}

fn move_files_impl(options: Options) -> MoveFilesResult {
	let Options {
		paths,
		destination,
		copy_mode,
		preserve_structure,
		override_mode,
	} = options;

	paths
		.par_iter()
		.fold(MoveFilesResult::default, |mut result, source_str| {
			let source_path = PathBuf::from(source_str);
			let source_name = match source_path.file_name() {
				Some(file_name) => file_name.to_string_lossy().to_string(),
				None => {
					result.errors.push(format!(
						"Failed to get file name of `{source_str}`"
					));
					return result;
				}
			};
			let mut dest_path = PathBuf::from(&destination);

			if preserve_structure && let Some(parent) = source_path.parent() {
				let relative_path = parent
					.components()
					.filter(|c| matches!(c, std::path::Component::Normal(_)))
					.collect::<PathBuf>();
				dest_path.push(relative_path);
			}

			if let Err(err) = fs::create_dir_all(&dest_path) {
				result
					.errors
					.push(format!("`{}` Failed, reason: {}", source_str, err));
				return result;
			}

			dest_path.push(&source_name);

			if dest_path.exists() && !override_mode {
				result.errors.push(format!(
					"`{}` already exists",
					dest_path.to_string_lossy()
				));
				return result;
			}

			let fs_result = if copy_mode {
				copy_item(&source_path, &dest_path)
			} else {
				move_item(&source_path, &dest_path)
			};

			match fs_result {
				Ok(_) => result.success_paths.push(source_str.clone()),
				Err(err) => result
					.errors
					.push(format!("`{}` Failed, reason: {}", source_str, err)),
			};

			result
		})
		.reduce(MoveFilesResult::default, |mut acc, mut x| {
			acc.success_paths.append(&mut x.success_paths);
			acc.errors.append(&mut x.errors);
			acc
		})
}

fn copy_item(source: &Path, dest: &Path) -> Result<(), io::Error> {
	if source.is_dir() {
		dircpy::CopyBuilder::new(source, dest)
			.overwrite(true)
			.run()?;
	} else {
		fs::copy(source, dest)?;
	}

	Ok(())
}

fn move_item(source: &Path, dest: &Path) -> Result<(), io::Error> {
	if fs::rename(source, dest).is_ok() {
		return Ok(());
	}

	copy_item(source, dest)?;
	fs::remove_file(source)?;

	Ok(())
}
