use base64::prelude::*;
use serde::{Deserialize, Serialize};
use std::path::Path;
use std::io::Cursor;

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

fn decode_jxl_to_png(data: &[u8]) -> Result<Vec<u8>, Box<dyn std::error::Error>> {
	// 使用 image crate 和 JxlDecoder 解码 JXL 图像
	let cursor = Cursor::new(data);
	let decoder = jxl_oxide::integration::JxlDecoder::new(cursor)?;
	
	// 使用 image crate 的统一接口解码图像
	let dynamic_image = image::DynamicImage::from_decoder(decoder)?;
	
	// 转换为 PNG 格式
	let mut png_data = Vec::new();
	let mut png_cursor = Cursor::new(&mut png_data);
	dynamic_image.write_to(&mut png_cursor, image::ImageFormat::Png)?;
	
	Ok(png_data)
}

pub fn read_image(path: String) -> Result<ImageInfo, ()> {
	let data = std::fs::read(&path).map_err(|_| ())?;
	
	// 检查是否为 JXL 文件
	let path_obj = Path::new(&path);
	let extension = path_obj.extension()
		.and_then(|ext| ext.to_str())
		.map(|ext| ext.to_lowercase());
	
	if let Some(ext) = &extension {
		if ext == "jxl" {
			// 对于 JXL 文件，解码为 PNG 格式
			match decode_jxl_to_png(&data) {
				Ok(png_data) => {
					let base64 = BASE64_STANDARD.encode(png_data);
					return Ok(ImageInfo { 
						base64, 
						mime_type: "image/png" 
					});
				}
				Err(e) => {
					eprintln!("Failed to decode JXL: {}", e);
					return Err(());
				}
			}
		}
	}
	
	// 对于其他格式，使用原有逻辑
	let mime_type = if let Some(kind) = infer::get(&data) {
		kind.mime_type()
	} else {
		// 如果 infer 检测不到，回退到基于扩展名的判断
		get_mime_type_from_extension(&path).ok_or(())?
	};
	
	let base64 = BASE64_STANDARD.encode(data);

	Ok(ImageInfo { base64, mime_type })
}
