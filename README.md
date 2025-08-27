## CzkawkaTauri

A Tauri-based frontend for [Czkawka](https://github.com/qarmin/czkawka) on macOS and Windows.

![App in light mode](./screenshots/1.png)

![App in dark mode](./screenshots/2.png)

### Installation

- [Download the latest release](https://github.com/shixinhuang99/czkawka-tauri/releases)

- **Homebrew**:

```sh
# Install
brew tap shixinhuang99/brew
brew install --cask czkawka-tauri
# or
brew install --cask czkawka-tauri-ffmpeg

# Update
brew update
brew install --cask czkawka-tauri
# or
brew install --cask czkawka-tauri-ffmpeg

# Uninstall
brew uninstall --cask czkawka-tauri
# or
brew uninstall --cask czkawka-tauri-ffmpeg
```

### Differences from Krokiet

- Uses full file paths
- Uses decimal notation for file sizes
- Default scan directory is the user directory
- Files are moved to the recycle bin by default when deleted

### Troubleshooting

- **macOS Security Warning**: When running the app for the first time, you may see a security warning. This is normal for apps not signed with an Apple Developer certificate. To allow the app to run:
  - **Recommended method**: Go to System Settings → Privacy & Security → Scroll down and click "Allow" next to the app name
  - **Alternative method**: Run this command in Terminal to remove quarantine attributes:
    ```sh
    sudo xattr -rd com.apple.quarantine /Applications/CzkawkaTauri.app
    ```
    ⚠️ Note: This completely bypasses macOS security checks - only use this method if you trust the app source.

- **Directory Access**: Some system-controlled directories are excluded by default due to macOS permissions. If needed, click the Add button to open Finder, select the desired directory, and remove it from the excluded list. This allows the system to remember accessible directories.
  - Known issue: macOS may forget accessible directories after installing a new version. You may need to reset settings and repeat the above steps.

- **FFmpeg Versions**: Releases with the `-ffmpeg` suffix include bundled FFmpeg binaries.

### Development

**Requirements**:

- Rust (stable)
- Node.js 22
- pnpm

**Linux Dependencies** (e.g., Ubuntu 24.04):
See [Tauri Documentation](https://tauri.app/start/prerequisites/#linux) for details.

```sh
sudo apt install libglib2.0-dev \
  libgtk-3-dev \
  libsoup-3.0-dev \
  libjavascriptcoregtk-4.1-dev \
  libwebkit2gtk-4.1-dev \
  libxdo-dev
```

**Run the project**:

```sh
pnpm install
cargo build
node --run run
```

**Format and lint**:

```sh
just fmt
just check
```
