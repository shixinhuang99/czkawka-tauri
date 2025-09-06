use std::{env, path::PathBuf, process::Command};

pub fn set_ffmpeg_path(resource_dir: Option<PathBuf>) {
	let mut paths = get_sys_paths();

	log::info!("Current paths: {:#?}", paths);

	if let Some(resource_dir) = resource_dir {
		log::info!("resource_dir: {}", resource_dir.display());

		let ffmpeg_dir = resource_dir.join("ffmpeg");

		let (ffmpeg_exe, ffprobe_exe) = if cfg!(windows) {
			(
				ffmpeg_dir.join("ffmpeg.exe"),
				ffmpeg_dir.join("ffprobe.exe"),
			)
		} else {
			(ffmpeg_dir.join("ffmpeg"), ffmpeg_dir.join("ffprobe"))
		};

		if ffmpeg_exe.exists() && ffprobe_exe.exists() {
			paths.insert(0, ffmpeg_dir);
			log::info!(
				"The ffmpeg and ffprobe executable files exists in the resource directory"
			);
		} else {
			log::info!(
				"The ffmpeg and ffprobe executable files do not exists in the resource directory"
			);
		}
	}

	let Ok(new_path) = env::join_paths(paths) else {
		log::info!("Failed to join paths");
		return;
	};

	log::info!("New PATH: {}", new_path.display());

	unsafe {
		env::set_var("PATH", new_path);
	}

	exe_info("ffmpeg");
	exe_info("ffprobe");
}

fn exe_info(name: &str) {
	let command = if cfg!(windows) {
		"where"
	} else {
		"which"
	};

	match Command::new(command).arg(name).output() {
		Ok(output) if output.status.success() => {
			let exe_path =
				String::from_utf8_lossy(&output.stdout).trim().to_string();
			log::info!("Found {} at: {}", name, exe_path);

			match Command::new(name).arg("-version").output() {
				Ok(version_output) if version_output.status.success() => {
					let version_info =
						String::from_utf8_lossy(&version_output.stdout);
					log::info!("{} version info:\n{}", name, version_info);
				}
				Ok(version_output) => {
					log::info!(
						"{} -version failed with status: {}",
						name,
						version_output.status
					);
				}
				Err(e) => {
					log::info!("Failed to execute {} -version: {}", name, e);
				}
			}
		}
		Ok(_) => {
			log::info!("{} not found via {} command", name, command);
		}
		Err(e) => {
			log::info!("Failed to execute {} command: {}", command, e);
		}
	}
}

fn get_sys_paths() -> Vec<PathBuf> {
	let path_string = if cfg!(windows) {
		Command::new("cmd")
			.args(["/C", "echo %PATH%"])
			.output()
			.ok()
			.and_then(|output| {
				if output.status.success() {
					Some(
						String::from_utf8_lossy(&output.stdout)
							.trim()
							.to_string(),
					)
				} else {
					None
				}
			})
			.unwrap_or_else(|| {
				"C:\\Windows\\System32;C:\\Windows;C:\\Windows\\System32\\Wbem"
					.to_string()
			})
	} else {
		let shell =
			env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string());
		Command::new(&shell)
    		.args(["-l", "-c", "echo $PATH"])
			.output()
			.ok()
			.and_then(|output| {
				if output.status.success() {
					let path = String::from_utf8_lossy(&output.stdout).trim().to_string();
					if !path.is_empty() {
						Some(path)
					} else {
						None
					}
				} else {
					None
				}
			})
			.unwrap_or_else(|| {
				"/usr/local/bin:/opt/homebrew/bin:/usr/local/opt/bin:/opt/local/bin".to_string()
			})
	};

	env::split_paths(&path_string).collect::<Vec<_>>()
}
