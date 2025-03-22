## CzkawkaTauri

A Tauri frontend of [Czkawka](https://github.com/qarmin/czkawka) on macOS and Windows.

![app light mode](./screenshots/1.png)

![app dark mode](./screenshots/2.png)

A Tauri frontend of Czkawka, based on `czkawka_core`, targeting only macOS and Windows(It hasn't been tested in practice yet) platforms.

Since Czkawka on my computer started crashing upon opening after just a few uses. The UI/UX is actually referenced from Krokiet, and the functionality is also the same as Krokiet.

### Differences with Krokiet:

- Use full paths for paths.
- Use decimal for file sizes.
- The default scan directory is the user directory.
- When deleting files, they are moved to the recycle bin by default.

### Note

- On macOS, some directories may request permission.
