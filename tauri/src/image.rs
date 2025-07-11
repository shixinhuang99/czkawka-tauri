use base64::prelude::*;
use serde::{Deserialize, Serialize};
use std::path::Path;

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageInfo {
	pub base64: String,
	pub mime_type: &'static str,
}

fn get_mime_type_from_extension(path: &str) -> Option<&'static str> {
	let path = Path::new(path);
	let extension = path.extension()?.to_str()?.to_lowercase();
	
	match extension.as_str() {
		"jxl" => Some("image/jxl"),
		"avif" => Some("image/avif"),
		"heic" => Some("image/heic"),
		"heif" => Some("image/heif"),
		"tiff" | "tif" => Some("image/tiff"),
		"ico" => Some("image/x-icon"),
		"svg" => Some("image/svg+xml"),
		_ => None,
	}
}

pub fn read_image(path: String) -> Result<ImageInfo, ()> {
	let data = std::fs::read(&path).map_err(|_| ())?;
	
	// 首先尝试用 infer 检测 MIME 类型
	let mime_type = if let Some(kind) = infer::get(&data) {
		kind.mime_type()
	} else {
		// 如果 infer 检测不到，回退到基于扩展名的判断
		get_mime_type_from_extension(&path).ok_or(())?
	};
	
	let base64 = BASE64_STANDARD.encode(data);

	Ok(ImageInfo { base64, mime_type })
}
