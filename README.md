# 📄 OmniDoc Studio - Universal Document, PDF & Image Editor

> A lightweight, client-side web application for viewing, editing, annotating, and digitally signing **PDFs**, **Word DOCX documents**, **Image scans**, and **Medical/Legal certificates**.

![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Status: Active](https://img.shields.io/badge/Status-Live-success.svg)

---

## 🌟 Key Features

### 🩺 1. Medical Certificate & Form Editor
- Pre-loaded interactive template for the **Reliance Family Clinics Sick Leave Certificate**.
- Click/tap any underlined field to edit (Patient Name, Age, Clinic Consultation Dates, Leave Period, Doctor Name).
- Integrated handwritten script typography (`Dancing Script` / `Caveat`) to seamlessly match authentic signatures.
- Clean vector clinic cross logo and doctor's pen signature pre-configured.
- One-click **Print / Save as PDF** (`Ctrl + P` auto-cleans UI elements).

### 📑 2. PDF Editor & Annotator
- Drag-and-drop any PDF file directly into the browser.
- Multi-page navigation and zoom in/out powered by **Mozilla PDF.js**.
- **Whiteout Box Tool**: Draw opaque white rectangles over existing text to redact or prepare for replacement.
- **Text Overlay Tool**: Add custom text annotations with precise placement.
- **Pen & Drawing Tool**: Freehand markup and line drawings.
- **Digital Signature Stamp**: Apply drawn signatures directly onto any PDF page.
- Export as high-resolution annotated PDF.

### 📝 3. Word DOCX Editor
- Drag-and-drop Microsoft Word (`.docx`, `.doc`) files.
- High-fidelity conversion to HTML via **Mammoth.js**.
- Rich text toolbar:
  - Font styling: **Bold**, *Italic*, <u>Underline</u>, <s>Strikethrough</s>
  - Block formatting: Headings (`H1`, `H2`), Paragraphs (`P`)
  - Lists & Alignment: Unordered, Numbered, Left, Center, Right
  - Digital signature insertion
- Export as clean HTML or Print directly to PDF.

### 🖼️ 4. Image & Scan Editor
- Upload document photos or scans (`PNG`, `JPG`, `JPEG`, `WebP`).
- **Whiteout / Eraser Box**: Redact or blank out sections of scanned documents.
- **Text Stamp**: Place typed text over images.
- **Pen & Draw Tool**: Annotate or highlight areas.
- **90° Rotation & History Undo**: Easily adjust orientation and revert mistakes.
- Export as PNG or convert image directly to PDF.

### 🖋️ 5. Digital Signature Pad
- Built-in signature modal with smooth touch and stylus support.
- Draw signatures on mobile, tablet, or desktop.
- Apply signatures seamlessly to Certificates, PDFs, Word documents, or Images.

---

## 🚀 Live Demo & Deployment

This application is completely **client-side** and requires **zero build step** or backend server. All document processing happens directly in your browser.

### Run Locally:
Simply open `index.html` in any modern web browser:
```bash
# On Windows PowerShell
Start-Process "index.html"

# Or using a local HTTP server:
python -m http.server 8080
# or
npx serve
```

### Deploy to GitHub Pages (1-Click):
1. Push this repository to GitHub.
2. Go to **Settings** > **Pages**.
3. Under **Build and deployment**, select:
   - **Source:** Deploy from a branch
   - **Branch:** `main` / `root`
4. Click **Save**. Your site will be live at `https://<username>.github.io/<repo-name>/`!

---

## 📁 Project Structure

```text
universal-doc-editor/
├── index.html                  # Main application shell & UI
├── css/
│   └── styles.css              # Custom styling, animations & print media queries
├── js/
│   ├── app.js                  # Main coordinator & tab router
│   ├── cert-editor.js          # Certificate template & form logic
│   ├── pdf-editor.js           # PDF.js viewer & canvas annotation layer
│   ├── docx-editor.js          # Mammoth.js DOCX parser & WYSIWYG editor
│   ├── image-editor.js         # Image canvas editor & whiteout tool
│   └── signature.js            # Digital signature pad modal
├── assets/
│   ├── logo.png                # Clinic emblem logo
│   └── signature.png           # Transparent signature asset
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions auto-deployment to Pages
├── LICENSE                     # MIT License
└── README.md                   # Documentation
```

---

## 🛡️ License

This project is licensed under the [MIT License](LICENSE).
