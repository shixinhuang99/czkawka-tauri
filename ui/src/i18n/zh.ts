import type { TranslationKeys } from './en';

export const zh: Record<TranslationKeys, string> = {
  Settings: '设置',
  'Application settings': '应用设置',
  'Current preset': '当前预设',
  'New preset name': '新预设名',
  'Add preset': '增加预设',
  'Edit name': '编辑预设名',
  'Remove preset': '移除预设',
  'Reset settings': '重置设置',
  'Name already exists': '`{{name}}` 已存在',

  'Failed to open cache folder': '打开缓存文件夹失败',
  'General settings': '通用设置',
  'Excluded items': '排除的项目',
  'Allowed extensions': '允许的拓展名',
  'Excluded extensions': '排除的拓展名',
  'File size': '文件大小',
  'Use cache': '使用缓存',
  'Recursive search': '递归搜索',
  'Also save cache as JSON file': '同时保存缓存为JSON文件',
  'Move deleted files to trash': '删除的文件移动到回收站',
  'Thread number': '线程数',
  'Thread number tip': '修改线程数需要重启才能生效',
  'Minimal size of cached files': '最小缓存文件大小',
  Hash: '哈希',
  Prehash: '预哈希',
  'Image preview': '图片预览',
  'Hide hard links': '隐藏硬链接',
  'Use prehash': '使用预哈希',
  'Delete automatically outdated entries': '自动删除过时的条目',
  'Open cache folder': '打开缓存文件夹',
  Other: '其它',

  'Toggle theme': '切换主题',
  'View source code': '查看源代码',

  'Duplicate Files': '重复文件',
  'Empty Folders': '空文件夹',
  'Big Files': '大文件',
  'Empty Files': '空文件',
  'Temporary Files': '临时文件',
  'Similar Images': '相似图片',
  'Similar Videos': '相似视频',
  'Music Duplicates': '重复音频',
  'Invalid Symlinks': '无效符号链接',
  'Broken Files': '损坏文件',
  'Bad Extensions': '不正确扩展名',

  Size: '大小',
  'File name': '名称',
  Path: '路径',
  'Modified date': '修改日期',
  'Folder name': '名称',
  Similarity: '相似度',
  Dimensions: '分辨率',
  Title: '标题',
  Artist: '艺术家',
  Year: '日期',
  Bitrate: '比特率',
  Length: '时长',
  'Symlink name': '名称',
  'Symlink path': '路径',
  'Destination path': '目标路径',
  'Type of error': '错误类型',
  'Current extension': '当前拓展名',
  'Proper extension': '预期拓展名',

  'Reveal in dir': '在{{name}}中显示',
  Finder: '访达',
  'File Explorer': '文件资源管理器',
  'Opreation failed': '操作失败',
  'Failed to read image': '读取图片失败',
  'No data': '无数据',

  Scan: '扫描',
  Stop: '停止',
  'Stopping scan': '停止中, 请等待...',
  'Current stage': '当前阶段进度',
  'All stages': '全部阶段进度',

  'Tool settings': '工具设置',
  'Duplicate files settings': '重复文件设置',
  'Big files settings': '大文件设置',
  'Similar images settings': '相似图片设置',
  'Similar videos settings': '相似视频设置',
  'Music duplicates settings': '重复音频设置',
  'Broken files settings': '损坏文件设置',
  'Check method': '检查方式',
  Name: '名称',
  'Size and name': '大小和名称',
  'Hash type': '哈希类型',
  'Case sensitive': '大小写敏感(仅名称模式)',
  'Checked files': '检查的文件',
  Biggest: '最大的',
  Smallest: '最小的',
  'Number of lines': '行数(前多少个)',
  'Hash size': '哈希大小',
  'Resize algorithm': '大小调整算法',
  'Ignore same size': '忽略相同大小',
  'Max difference': '最大差异度',
  'Audio check type': '音频检查方式',
  Tags: '标签',
  Fingerprint: '指纹',
  'Approximate tag comparison': '近似标签比较',
  'Compared tags': '要比较的标签',
  Genre: '流派',
  'Minimal fragment duration': '最小片段时长',
  'Compare only with similar titles': '仅比较相似标题',
  'Type of files to check': '要检查的文件类型',
  Audio: '音频',
  Pdf: 'Pdf',
  Archive: '压缩包',
  Image: '图片',

  Ok: '确定',
  Cancel: '取消',

  Select: '选择',
  'Select the highest resolution': '选择分辨率最高的',
  'Select the lowest resolution': '选择分辨率最低的',
  'Select the biggest size': '选择最大的',
  'Select the smallest size': '选择最小的',
  'Select the newest': '选择最新的',
  'Select the oldest': '选择最旧的',
  'Invert selection': '反向选择',

  Move: '移动',
  'Moving files': '移动文件',
  'Move confirm':
    '移动 <1>{{length}}</1> 个项目到 <3>{{destination}}</3>. 确认继续?',
  'Copy files instead of moving': '复制文件而不是移动',
  'Preserve folder structure': '保留文件夹结构',
  'Override files': '覆盖文件',

  Delete: '删除',
  'Delete items': '删除项目',
  'Delete comfirm': '你确认想要删除选择的 <1>{{length}}</1> 个项目吗?',

  Save: '保存',
  'Saving results': '保存结果',
  'Save confirm': '这将把结果保存到3个不同的文件中。您是否要继续?',

  Rename: '重命名',
  'Renaming files': '重命名拓展名',
  'Rename confirm':
    '这将把所选的 <1>{{length}}</1> 个文件的扩展名更改为预计更合适的扩展名。您是否要继续?',

  Expand: '展开',
  Collapse: '收起',
  'Include Directories': '包含的文件夹',
  'Exclude Directories': '排除的文件夹',
  'Please add path': '请添加路径',
  Add: '添加',
  'Manual add': '手动添加',
  'Manually add paths desc': '手动填写路径(一行一个)',
  'Remove selected': '移除已选择的',
};
