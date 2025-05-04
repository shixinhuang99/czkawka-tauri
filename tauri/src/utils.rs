use std::path::PathBuf;

pub fn convert_strs_to_path_bufs(strs: Vec<String>) -> Vec<PathBuf> {
	strs.into_iter().map(PathBuf::from).collect()
}

pub fn split_str_with_comma(s: String) -> Vec<String> {
	s.split(',').map(|s| s.to_string()).collect()
}

#[cfg(feature = "ffmpeg")]
pub fn set_ffmpeg_path(resource_dir: PathBuf) {
	use std::env;

	let Ok(path) = env::var("PATH") else {
		return;
	};

	let mut paths = env::split_paths(&path).collect::<Vec<_>>();

	paths.insert(0, resource_dir.join("ffmpeg"));

	let Ok(new_paths) = env::join_paths(paths) else {
		return;
	};

	unsafe {
		env::set_var("PATH", new_paths);
	}
}
