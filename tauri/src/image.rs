use base64::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageInfo {
	pub base64: String,
	pub mime_type: &'static str,
}

pub fn read_image(path: String) -> Result<ImageInfo, ()> {
	let data = std::fs::read(path).map_err(|_| ())?;
	let mime_type = infer::get(&data).ok_or(())?.mime_type();
	let base64 = BASE64_STANDARD.encode(data);

	Ok(ImageInfo { base64, mime_type })
}
