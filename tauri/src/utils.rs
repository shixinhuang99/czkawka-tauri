use std::path::PathBuf;

pub fn covert_strs_to_path_bufs(strs: Vec<String>) -> Vec<PathBuf> {
	strs.into_iter().map(PathBuf::from).collect()
}

pub fn split_str_with_comma(s: String) -> Vec<String> {
	s.split(',').map(|s| s.to_string()).collect()
}
