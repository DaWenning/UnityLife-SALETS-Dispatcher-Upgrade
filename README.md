# UnityLife SALETS Dispatcher – Browser Extension

Injects custom JavaScript and CSS into a target website across three browsers.

---

## Project structure

```
UnityLife-SALETS-Dispatcher-Upgrade/
├── content/
│   ├── inject.js      ← shared source — edit this
│   └── inject.css     ← shared source — edit this
├── build.ps1          ← copies shared files into every browser folder
├── chrome/            ← Google Chrome extension
├── msedge/            ← Microsoft Edge extension
└── mzfirefox/         ← Mozilla Firefox extension
```

After editing either file in `content/`, run the build script to push changes:

```powershell
.\build.ps1
```

# Installation Guide

---

## Google Chrome

1. Download **`chrome.zip`** from the [latest release page](https://github.com/YourOrg/UnityLife-SALETS-Dispatcher-Upgrade/releases/latest).
2. Extract the zip file to a local folder.
3. Open Chrome and navigate to `chrome://extensions`.
4. Enable **Developer mode** using the toggle in the top-right corner.
5. Click **Load unpacked**.
6. Select the extracted **`chrome/`** folder.
7. The extension icon will appear in the toolbar. Visit your target site to confirm injection is active.

---

## Microsoft Edge

1. Download **`msedge.zip`** from the [latest release page](https://github.com/YourOrg/UnityLife-SALETS-Dispatcher-Upgrade/releases/latest).
2. Extract the zip file to a local folder.
3. Open Edge and navigate to `edge://extensions`.
4. Enable **Developer mode** using the toggle in the lower-left panel.
5. Click **Load unpacked**.
6. Select the extracted **`msedge/`** folder.
7. The extension icon will appear in the toolbar. Visit your target site to confirm injection is active.

---

## Mozilla Firefox

1. Download **`mzfirefox.zip`** from the [latest release page](https://github.com/YourOrg/UnityLife-SALETS-Dispatcher-Upgrade/releases/latest).
2. Extract the zip file to a local folder.
3. Open Firefox and navigate to `about:debugging`.
4. Click **This Firefox** in the left sidebar.
5. Click **Load Temporary Add-on…**.
6. Navigate to the extracted **`mzfirefox/`** folder and select the **`manifest.json`** file.
7. The extension will be active until Firefox is closed. Visit your target site to confirm injection is active.

> **Note:** Temporarily loaded extensions are removed when Firefox restarts. For persistent installs, the extension must be signed via [addons.mozilla.org](https://addons.mozilla.org/developers/) or through an enterprise policy.

---
