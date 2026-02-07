# 🐍 Python Runner Widget

Python Runner is an HTML-based widget designed to run as an iframe widget.

---

This repository already contains a ready-to-use widget:

python-runner.wdgt/
├── index.html # Widget UI
├── info.plist # Widget manifest
├── css/ # Styles
└── js/ # Widget logic

---

## 🧩 How to Use:

Widgets are HTML applications loaded into `<iframe>` elements.

### 1️⃣ Verify Widget Files
Make sure the following files exist (already included in this repo):

- `index.html`
- `info.plist`
- `css/`
- `js/`

---

### 2️⃣ Package the Widget

Navigate to the **parent directory** of `python-runner.wdgt` and archive the widget directory

```bash
zip -r python-runner.v1.0.zip python-runner.wdgt
```