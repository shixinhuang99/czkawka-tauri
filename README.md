## CzkawkaTauri

A Tauri frontend of [Czkawka](https://github.com/qarmin/czkawka) on macOS and Windows.

![app light mode](./screenshots/1.png)

![app dark mode](./screenshots/2.png)

A Tauri frontend of Czkawka, based on `czkawka_core`, targeting only macOS and Windows platforms.

Since Czkawka on my computer started crashing upon opening after just a few uses. The UI/UX is actually referenced from Krokiet, and the functionality is also the same as Krokiet.

### Installation

[Downlaod latest release](https://github.com/shixinhuang99/czkawka-tauri/releases)

### Differences with Krokiet:

- Use full paths for paths.
- Use decimal for file sizes.
- The default scan directory is the user directory.
- When deleting files, they are moved to the recycle bin by default.

### Note

- On macOS, Some directories controlled by system permissions are excluded by default. If necessary, please click the Add button to open Finder, select the desired directory, and remove it from the excluded directories. This should allow the system to remember the accessible directories(known issue: macOS may forget about accessible directories after installing a new version, you need to reset the settings and repeat the above actions).
- Versions with the ffmpeg suffix in the release are bundled with the ffmpeg binary.
