// 测试图像格式支持
function isImage(fileName) {
  const imageExtensions = [
    'avif',
    'bmp',
    'gif',
    'icns',
    'ico',
    'jpeg',
    'jpg',
    'jxl',
    'png',
    'svg',
    'webp',
  ];
  const ext = fileName.slice(fileName.lastIndexOf('.') + 1).toLowerCase();
  return imageExtensions.includes(ext);
}

// 测试新添加的格式
console.log('测试 JXL 格式:');
console.log('test.jxl ->', isImage('test.jxl'));
console.log('test.JXL ->', isImage('test.JXL'));

console.log('\n测试 AVIF 格式:');
console.log('test.avif ->', isImage('test.avif'));
console.log('test.AVIF ->', isImage('test.AVIF'));

console.log('\n测试其他现有格式:');
console.log('test.png ->', isImage('test.png'));
console.log('test.jpg ->', isImage('test.jpg'));
console.log('test.webp ->', isImage('test.webp'));

console.log('\n测试非图像格式:');
console.log('test.txt ->', isImage('test.txt'));
console.log('test.pdf ->', isImage('test.pdf'));

console.log('\n所有支持的图像格式:');
console.log([
  'avif',
  'bmp',
  'gif',
  'icns',
  'ico',
  'jpeg',
  'jpg',
  'jxl',
  'png',
  'svg',
  'webp',
]);
