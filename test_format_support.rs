use std::fs;

fn main() {
    println!("Testing infer crate support for image formats:");
    
    // 测试是否支持各种图片格式
    let test_formats = vec![
        ("PNG", &[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A][..]),
        ("JPEG", &[0xFF, 0xD8, 0xFF][..]),
        ("WebP", &[0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50][..]),
        ("GIF", &[0x47, 0x49, 0x46, 0x38, 0x39, 0x61][..]),
        ("BMP", &[0x42, 0x4D][..]),
        ("TIFF", &[0x49, 0x49, 0x2A, 0x00][..]),
        ("JXL", &[0xFF, 0x0A][..]), // JXL codestream format
        ("AVIF", &[0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66][..]), // AVIF header
    ];
    
    for (format_name, magic_bytes) in test_formats {
        match infer::get(magic_bytes) {
            Some(kind) => {
                println!("✓ {}: {} ({})", format_name, kind.mime_type(), kind.extension());
            }
            None => {
                println!("✗ {}: Not supported by infer", format_name);
            }
        }
    }
    
    // 创建一些测试文件以检查识别
    println!("\nTesting file creation and detection:");
    
    // 创建一个简单的 PNG 文件头测试
    let png_header = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
    if let Err(e) = fs::write("test_png_header.png", &png_header) {
        println!("Failed to create test PNG file: {}", e);
    } else {
        match fs::read("test_png_header.png") {
            Ok(data) => match infer::get(&data) {
                Some(kind) => println!("✓ PNG test file: {} ({})", kind.mime_type(), kind.extension()),
                None => println!("✗ PNG test file: Not recognized"),
            }
            Err(e) => println!("Failed to read PNG test file: {}", e),
        }
    }
    
    // 测试 JXL
    let jxl_header = [0xFF, 0x0A]; // 简单的 JXL codestream header
    if let Err(e) = fs::write("test_jxl_header.jxl", &jxl_header) {
        println!("Failed to create test JXL file: {}", e);
    } else {
        match fs::read("test_jxl_header.jxl") {
            Ok(data) => match infer::get(&data) {
                Some(kind) => println!("✓ JXL test file: {} ({})", kind.mime_type(), kind.extension()),
                None => println!("✗ JXL test file: Not recognized"),
            }
            Err(e) => println!("Failed to read JXL test file: {}", e),
        }
    }
    
    // 测试 AVIF
    let avif_header = [0x00, 0x00, 0x00, 0x20, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66];
    if let Err(e) = fs::write("test_avif_header.avif", &avif_header) {
        println!("Failed to create test AVIF file: {}", e);
    } else {
        match fs::read("test_avif_header.avif") {
            Ok(data) => match infer::get(&data) {
                Some(kind) => println!("✓ AVIF test file: {} ({})", kind.mime_type(), kind.extension()),
                None => println!("✗ AVIF test file: Not recognized"),
            }
            Err(e) => println!("Failed to read AVIF test file: {}", e),
        }
    }
    
    println!("\nDone!");
}
