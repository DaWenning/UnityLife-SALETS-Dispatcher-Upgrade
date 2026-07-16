# UnityLife SALETS – Edge Extension

A Manifest V3 browser extension for **Microsoft Edge** that injects custom JavaScript and CSS into a target website.

## File layout

```
msedge/
├── manifest.json          ← Extension manifest (MV3)
├── content/
│   ├── inject.js          ← JavaScript injected into the page
│   └── inject.css         ← CSS injected into the page
└── icons/
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## Quick start

1. **Set your target URL** – open `manifest.json` and change the `matches` pattern inside `content_scripts`:
   ```json
   "matches": ["https://your-target-site.com/*"]
   ```
2. **Add your logic** – edit `content/inject.js` and `content/inject.css`.
3. **Add icons** – drop 16×16, 48×48, and 128×128 PNG files into `icons/`.
4. **Load in Edge**:
   - Navigate to `edge://extensions`
   - Enable **Developer mode** (toggle, top-right)
   - Click **Load unpacked** → select the `msedge/` folder
5. Visit your target site – the script and styles will be injected automatically.

## Notes

- The `manifest_version` is **3** (current standard for Edge / Chrome).
- `run_at: "document_idle"` means the script runs after the DOM is ready.
- To match *all* sites use `"matches": ["<all_urls>"]` (requires user consent).
