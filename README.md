# 📄 OmniDoc Studio - Universal Document, PDF & Image Suite

> A modern, client-side web application for viewing, editing, annotating, and digitally signing **Medical & Legal Forms**, **PDFs**, **Word DOCX documents**, and **Image Scans** — featuring **direct click-to-edit** and **1-click instant samples**.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Status: Active](https://img.shields.io/badge/Status-Live-success.svg)
![Build: Pure Client-Side](https://img.shields.io/badge/Architecture-100%25%20Client--Side-emerald.svg)

---

## 🌟 Key Features

### 🩺 1. Direct Click-to-Edit Form & Certificate Studio
- **4+ Professional Built-In Templates**:
  - Medical Certificate (Sick Leave & Clinical Rest Note)
  - Certificate of Medical Fitness & Health Clearance
  - Professional Consulting & Medical Services Invoice
  - Certificate of Achievement & Clinical Excellence
- **100% Direct Click-to-Edit**: Click any text, patient name, diagnosis, clinic header, or table cell to type directly into the document.
- **Sample Data Autofill**: 1-click randomized sample generator to test different patient profiles.
- **Integrated Digital Signatures**: Click signature line to draw or type calligraphy signatures.
- **One-Click Print / Save as PDF** (`Ctrl + P` auto-cleans UI elements).

### 📑 2. PDF Editor & Click-to-Type Annotator
- **1-Click "Load Sample PDF"**: Test the editor immediately with an authentic pre-generated medical consultation PDF without needing your own file!
- **Direct Click & Type Inline Overlays**: Click anywhere on your PDF to place an editable text box directly onto the document (no browser alerts/prompts).
- **Whiteout Background Replacement**: Toggle the "Whiteout" checkbox on any text overlay to instantly cover existing PDF text with your new text.
- **Whiteout / Eraser Box**: Drag a rectangle over any portion of the document to blank it out.
- **Freehand Pen Markup & Signature Stamping**: Add handwritten notes and stamps.
- Multi-page navigation, zoom in/out, and export to crisp merged PDF.

### 📝 3. Word DOCX & Rich Text Editor
- **Pre-loaded Sample Documents**:
  - Independent Consulting Agreement
  - Clinical Specialist Referral Note
  - Official Employment Verification Letter
- **Direct Click & Edit WYSIWYG**: Edit text inline with full formatting:
  - Font styling: **Bold**, *Italic*, <u>Underline</u>, <s>Strikethrough</s>
  - Block formatting: Headings (`H1`, `H2`, `P`)
  - Bulleted & Numbered lists, text alignment (Left, Center, Right)
  - Clean table generation & digital signature insertion
- **Multi-Format Export**: Export to **Microsoft Word (`.doc`)**, clean HTML, or Print / Save to PDF.

### 🖼️ 4. Image & Document Scan Editor
- **1-Click "Load Sample Document Scan"**: Generates a high-resolution laboratory pathology scan (ISO accredited, test tables, medical stamp) to try redaction and editing right away!
- **Direct Click-to-Type Text Stamp**: Click anywhere on the scan to position an inline text box with whiteout backing.
- **Whiteout Redaction Box**: Erase sensitive patient or financial information.
- **B&W High-Contrast Filter**: Clean up scanned shadows and gray backgrounds.
- 90° Clockwise Rotation, full undo history, and export to PNG or PDF.

### ✍️ 5. Dual-Mode Digital Signature Suite
- **Draw Tab**: Smooth freehand stylus/mouse drawing with ink color picker (Navy Blue, Black, Red) and stroke thickness.
- **Type Tab**: Type your name and render instant cursive handwriting signatures in styles like *Dancing Script*, *Caveat*, and *Great Vibes*.
- Direct 1-click stamping onto forms, PDFs, Word docs, and image scans.

---

## 🚀 Live Demo & Running Locally

This application is completely **client-side** and requires **zero build step** or backend server. All document processing happens directly in your browser.

### Run Locally:
Simply open `index.html` in any web browser:
```bash
# On Windows PowerShell:
Start-Process "index.html"

# Or using Python's built-in server:
python -m http.server 8080
```
Then visit `http://localhost:8080`.

### Deploy to GitHub Pages (1-Click):
1. Push this repository to GitHub.
2. In your repository on GitHub, go to **Settings** > **Pages**.
3. Under **Build and deployment**, select:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `root`
4. Click **Save**. Your site will be live at `https://<username>.github.io/<repo-name>/`!

---

## 📁 Project Structure

```text
universal-doc-editor/
├── index.html                  # Main application shell, tabs & signature modal
├── css/
│   └── styles.css              # Custom styling, inline overlays & print media queries
├── js/
│   ├── app.js                  # Main coordinator, tab switcher & drag-and-drop
│   ├── cert-editor.js          # Multi-template certificate & form editor
│   ├── pdf-editor.js           # PDF.js viewer, inline text overlays & whiteout
│   ├── docx-editor.js          # Mammoth.js parser, WYSIWYG editor & samples
│   ├── image-editor.js         # Scan editor, canvas whiteout & B&W filters
│   └── signature.js            # Draw & Type digital signature suite
├── assets/
│   ├── logo.png                # Emblem logo
│   └── signature.png           # Transparent signature asset
├── LICENSE                     # MIT License
└── README.md                   # Documentation
```

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
