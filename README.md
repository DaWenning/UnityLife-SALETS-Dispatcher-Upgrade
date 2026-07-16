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

---

## Google Chrome

1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click **Load unpacked**.
4. Select the **`chrome/`** folder inside this project.
5. The extension icon will appear in the toolbar. Visit your target site to confirm injection is active.

> To update after editing source files: run `.\build.ps1`, then click the **refresh** icon on the extension card at `chrome://extensions`.

---

## Microsoft Edge

1. Open Edge and navigate to `edge://extensions`.
2. Enable **Developer mode** using the toggle in the lower-left panel.
3. Click **Load unpacked**.
4. Select the **`msedge/`** folder inside this project.
5. The extension icon will appear in the toolbar. Visit your target site to confirm injection is active.

> To update after editing source files: run `.\build.ps1`, then click the **refresh** icon on the extension card at `edge://extensions`.

---

## Mozilla Firefox

Firefox requires a temporary load for unsigned extensions during development.

1. Open Firefox and navigate to `about:debugging`.
2. Click **This Firefox** in the left sidebar.
3. Click **Load Temporary Add-on…**.
4. Navigate to the **`mzfirefox/`** folder and select the **`manifest.json`** file.
5. The extension will be active until Firefox is closed. Visit your target site to confirm injection is active.

> **Note:** Temporarily loaded extensions are removed when Firefox restarts. For persistent installs, the extension must be signed via [addons.mozilla.org](https://addons.mozilla.org/developers/) or through an enterprise policy.

> To update after editing source files: run `.\build.ps1`, then click **Reload** next to the extension in `about:debugging`.

---

## Changing the target site

Open the `manifest.json` inside the relevant browser folder and update the `matches` pattern:

```json
"content_scripts": [
  {
    "matches": ["https://your-target-site.com/*"],
    ...
  }
]
```

Use `"<all_urls>"` to match every site (will prompt for broader permissions).
