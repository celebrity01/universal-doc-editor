/**
 * PDF Viewer, Annotator, and Direct Click-to-Edit Suite
 * Features:
 * - 1-Click Sample PDF Generator & Loader
 * - Direct Click-to-Type Inline Text Overlays (No browser prompts!)
 * - Whiteout Background toggle for instant text replacement
 * - Draggable text boxes and signature stamps
 * - Canvas Whiteout / Eraser Box
 * - Freehand markup & Drawing
 * - Clean merged PDF Export
 */

class PDFEditor {
  constructor() {
    this.pdfDoc = null;
    this.pageNum = 1;
    this.totalNum = 0;
    this.scale = 1.35;
    this.currentTool = 'select'; // 'select', 'text', 'whiteout', 'draw', 'signature'
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.annotations = []; // canvas annotations: whiteout, draw
    this.textOverlays = []; // interactive DOM text overlays: { id, page, x, y, text, size, color, bold, whiteoutBg }
    this.color = '#000000';
    this.fontSize = 16;

    this.viewportContainer = document.getElementById('pdf-viewport-container');
    this.pageContainer = document.querySelector('.pdf-page-container');
    this.pageCanvas = document.getElementById('pdf-base-canvas');
    this.annotCanvas = document.getElementById('pdf-annot-canvas');
    this.pageCtx = this.pageCanvas ? this.pageCanvas.getContext('2d') : null;
    this.annotCtx = this.annotCanvas ? this.annotCanvas.getContext('2d') : null;

    this.initEvents();
  }

  initEvents() {
    if (!this.annotCanvas) return;

    this.annotCanvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.annotCanvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', (e) => this.onMouseUp(e));

    // File input handler
    const fileInput = document.getElementById('pdf-upload-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.loadFile(file);
      });
    }

    // Drag and Drop
    const dropZone = document.getElementById('pdf-drop-zone');
    if (dropZone) {
      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });
      dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
          this.loadFile(e.dataTransfer.files[0]);
        }
      });
    }
  }

  setTool(tool) {
    this.currentTool = tool;
    document.querySelectorAll('.pdf-tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });

    if (this.annotCanvas) {
      if (tool === 'text') {
        this.annotCanvas.style.cursor = 'text';
      } else if (tool === 'whiteout' || tool === 'draw') {
        this.annotCanvas.style.cursor = 'crosshair';
      } else {
        this.annotCanvas.style.cursor = 'default';
      }
    }
  }

  async loadSamplePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    // Build a realistic Sample Medical & Legal Document
    doc.setFillColor(37, 99, 235);
    doc.rect(40, 40, 515, 6, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text('HARBOR CLINICAL HEALTH CENTER', 40, 80);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('104 Healthcare Boulevard, Suite 500 | Tel: (800) 555-0192', 40, 96);
    doc.text('Official Examination & Clinical Clearance Record', 40, 110);

    doc.setDrawColor(226, 232, 240);
    doc.line(40, 125, 555, 125);

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(29, 78, 216);
    doc.text('PATIENT CONSULTATION & DIAGNOSIS SUMMARY', 40, 155);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);

    doc.text('Patient Name: Sarah Jenkins', 40, 185);
    doc.text('Age / Gender: 32 / Female', 300, 185);
    doc.text('Date of Examination: October 14, 2026', 40, 205);
    doc.text('Physician: Dr. Marcus Vance, M.D.', 300, 205);

    doc.text('Clinical Assessment & Diagnosis:', 40, 235);
    doc.setFont('Helvetica', 'italic');
    doc.text('Patient presented with acute throat irritation, fatigue, and fever.', 50, 255);
    doc.text('Physical examination reveals pharyngeal inflammation and mild congestion.', 50, 272);
    doc.text('Vital signs: BP 120/78 mmHg, Temp 38.2°C, Pulse 76 bpm.', 50, 289);

    doc.setFont('Helvetica', 'bold');
    doc.text('Medical Recommendations & Leave Recommendation:', 40, 320);
    doc.setFont('Helvetica', 'normal');
    doc.text('1. Complete medical rest from 14/10/2026 to 21/10/2026 (inclusive).', 50, 340);
    doc.text('2. Prescribed medication regimen: Amoxicillin 500mg, Paracetamol 1g.', 50, 357);
    doc.text('3. Avoid strenuous physical duty until authorized follow-up consultation.', 50, 374);

    doc.setDrawColor(203, 213, 225);
    doc.rect(40, 410, 515, 100);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('DOCTOR CERTIFICATION NOTICE', 50, 428);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('This document serves as an authentic medical report issued for administrative and workplace leave.', 50, 446);
    doc.text('Click anywhere on this document using the "Text" tool to edit or replace text directly!', 50, 462);
    doc.text('Use the "Whiteout" tool to redact or blank out sections before typing over them.', 50, 478);

    doc.line(40, 560, 220, 560);
    doc.setFontSize(10);
    doc.text("Doctor's Signature & Stamp", 40, 575);

    doc.line(360, 560, 540, 560);
    doc.text('Date of Authorization', 360, 575);

    const pdfBlob = doc.output('blob');
    await this.loadBlob(pdfBlob);
  }

  async loadBlob(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    const typedArray = new Uint8Array(arrayBuffer);
    this.initPdfFromArray(typedArray);
  }

  async loadFile(file) {
    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedArray = new Uint8Array(e.target.result);
      this.initPdfFromArray(typedArray);
    };
    reader.readAsArrayBuffer(file);
  }

  async initPdfFromArray(typedArray) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      this.pdfDoc = await pdfjsLib.getDocument(typedArray).promise;
      this.totalNum = this.pdfDoc.numPages;
      this.pageNum = 1;
      document.getElementById('pdf-page-count').textContent = this.totalNum;
      document.getElementById('pdf-drop-zone').classList.add('hidden');
      document.getElementById('pdf-editor-workspace').classList.remove('hidden');
      this.renderPage(this.pageNum);
    } catch (err) {
      console.error('Error loading PDF:', err);
      alert('Could not render PDF. ' + err.message);
    }
  }

  async renderPage(num) {
    if (!this.pdfDoc) return;
    const page = await this.pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: this.scale });

    this.pageCanvas.width = viewport.width;
    this.pageCanvas.height = viewport.height;
    this.annotCanvas.width = viewport.width;
    this.annotCanvas.height = viewport.height;

    const renderContext = {
      canvasContext: this.pageCtx,
      viewport: viewport
    };

    await page.render(renderContext).promise;
    document.getElementById('pdf-current-page').textContent = num;
    this.redrawAnnotations();
    this.refreshTextOverlays();
  }

  prevPage() {
    if (this.pageNum <= 1) return;
    this.pageNum--;
    this.renderPage(this.pageNum);
  }

  nextPage() {
    if (this.pageNum >= this.totalNum) return;
    this.pageNum++;
    this.renderPage(this.pageNum);
  }

  zoomIn() {
    this.scale = Math.min(this.scale + 0.2, 2.5);
    this.renderPage(this.pageNum);
  }

  zoomOut() {
    if (this.scale <= 0.6) return;
    this.scale = Math.max(this.scale - 0.2, 0.6);
    this.renderPage(this.pageNum);
  }

  getCanvasPos(e) {
    const rect = this.annotCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.annotCanvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.annotCanvas.height / rect.height)
    };
  }

  onMouseDown(e) {
    const pos = this.getCanvasPos(e);
    this.startX = pos.x;
    this.startY = pos.y;
    this.isDrawing = true;

    if (this.currentTool === 'text') {
      // Direct Click-and-Type: Spawn inline text overlay directly at click position
      this.createInlineTextOverlay(pos.x, pos.y);
      this.isDrawing = false;
      this.setTool('select');
    } else if (this.currentTool === 'draw') {
      this.currentStroke = [{ x: pos.x, y: pos.y }];
    }
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;
    const pos = this.getCanvasPos(e);

    if (this.currentTool === 'whiteout') {
      this.redrawAnnotations();
      this.annotCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      this.annotCtx.strokeStyle = '#3b82f6';
      this.annotCtx.lineWidth = 1.5;
      const w = pos.x - this.startX;
      const h = pos.y - this.startY;
      this.annotCtx.fillRect(this.startX, this.startY, w, h);
      this.annotCtx.strokeRect(this.startX, this.startY, w, h);
    } else if (this.currentTool === 'draw' && this.currentStroke) {
      this.currentStroke.push({ x: pos.x, y: pos.y });
      this.annotCtx.strokeStyle = this.color;
      this.annotCtx.lineWidth = 2.5;
      this.annotCtx.lineCap = 'round';
      this.annotCtx.beginPath();
      const prev = this.currentStroke[this.currentStroke.length - 2];
      this.annotCtx.moveTo(prev.x, prev.y);
      this.annotCtx.lineTo(pos.x, pos.y);
      this.annotCtx.stroke();
    }
  }

  onMouseUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.currentTool === 'whiteout') {
      const endX = this.getCanvasPos(e).x;
      const endY = this.getCanvasPos(e).y;
      const x = Math.min(this.startX, endX);
      const y = Math.min(this.startY, endY);
      const w = Math.abs(endX - this.startX);
      const h = Math.abs(endY - this.startY);

      if (w > 5 && h > 5) {
        this.annotations.push({
          type: 'whiteout',
          page: this.pageNum,
          x, y, w, h
        });
      }
      this.redrawAnnotations();
      this.setTool('select');
    } else if (this.currentTool === 'draw' && this.currentStroke) {
      this.annotations.push({
        type: 'draw',
        page: this.pageNum,
        points: this.currentStroke,
        color: this.color
      });
      this.currentStroke = null;
    }
  }

  /**
   * Direct Click-to-Edit: Creates an interactive editable box positioned over the document
   */
  createInlineTextOverlay(canvasX, canvasY, initialText = 'Type text here...') {
    const overlayId = 'txt_' + Date.now();
    const item = {
      id: overlayId,
      page: this.pageNum,
      x: canvasX,
      y: canvasY,
      text: initialText,
      size: 16,
      color: '#000000',
      bold: false,
      whiteoutBg: true // Default to true so user can easily cover & replace existing text!
    };
    this.textOverlays.push(item);
    this.renderTextOverlayElement(item, true);
  }

  renderTextOverlayElement(item, autoFocus = false) {
    const container = document.querySelector('.pdf-page-container');
    if (!container) return;

    // Convert canvas coordinates to percentage or px
    const scaleX = container.clientWidth / this.pageCanvas.width;
    const scaleY = container.clientHeight / this.pageCanvas.height;

    const el = document.createElement('div');
    el.id = item.id;
    el.className = `inline-text-overlay ${item.whiteoutBg ? 'whiteout-bg' : ''}`;
    el.style.left = `${item.x * scaleX}px`;
    el.style.top = `${item.y * scaleY}px`;

    el.innerHTML = `
      <div class="inline-text-toolbar no-print">
        <select class="txt-size-select">
          <option value="12" ${item.size === 12 ? 'selected' : ''}>12px</option>
          <option value="14" ${item.size === 14 ? 'selected' : ''}>14px</option>
          <option value="16" ${item.size === 16 ? 'selected' : ''}>16px</option>
          <option value="18" ${item.size === 18 ? 'selected' : ''}>18px</option>
          <option value="22" ${item.size === 22 ? 'selected' : ''}>22px</option>
          <option value="28" ${item.size === 28 ? 'selected' : ''}>28px</option>
        </select>
        <button type="button" class="txt-bold-btn ${item.bold ? 'font-bold' : ''}" title="Bold"><b>B</b></button>
        <label class="flex items-center gap-1 cursor-pointer" title="White background to cover underlying text">
          <input type="checkbox" class="txt-whiteout-chk" ${item.whiteoutBg ? 'checked' : ''}> Whiteout
        </label>
        <select class="txt-color-select">
          <option value="#000000" ${item.color === '#000000' ? 'selected' : ''}>Black</option>
          <option value="#1e40af" ${item.color === '#1e40af' ? 'selected' : ''}>Blue</option>
          <option value="#b91c1c" ${item.color === '#b91c1c' ? 'selected' : ''}>Red</option>
          <option value="#047857" ${item.color === '#047857' ? 'selected' : ''}>Green</option>
        </select>
        <button type="button" class="txt-del-btn text-red-300 hover:text-red-100" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="inline-text-input" contenteditable="true" style="font-size: ${item.size}px; color: ${item.color}; font-weight: ${item.bold ? 'bold' : 'normal'};">
        ${item.text}
      </div>
    `;

    container.appendChild(el);

    const inputDiv = el.querySelector('.inline-text-input');
    const sizeSelect = el.querySelector('.txt-size-select');
    const boldBtn = el.querySelector('.txt-bold-btn');
    const whiteoutChk = el.querySelector('.txt-whiteout-chk');
    const colorSelect = el.querySelector('.txt-color-select');
    const delBtn = el.querySelector('.txt-del-btn');

    // Input changes
    inputDiv.addEventListener('input', () => {
      item.text = inputDiv.innerText;
    });

    sizeSelect.addEventListener('change', (e) => {
      item.size = parseInt(e.target.value);
      inputDiv.style.fontSize = `${item.size}px`;
    });

    boldBtn.addEventListener('click', () => {
      item.bold = !item.bold;
      inputDiv.style.fontWeight = item.bold ? 'bold' : 'normal';
    });

    whiteoutChk.addEventListener('change', (e) => {
      item.whiteoutBg = e.target.checked;
      el.classList.toggle('whiteout-bg', item.whiteoutBg);
    });

    colorSelect.addEventListener('change', (e) => {
      item.color = e.target.value;
      inputDiv.style.color = item.color;
    });

    delBtn.addEventListener('click', () => {
      this.textOverlays = this.textOverlays.filter(o => o.id !== item.id);
      el.remove();
    });

    // Drag to reposition
    this.makeDraggable(el, item);

    if (autoFocus) {
      inputDiv.focus();
      const range = document.createRange();
      range.selectNodeContents(inputDiv);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  makeDraggable(el, item) {
    let isDragging = false;
    let startMouseX = 0;
    let startMouseY = 0;
    let startElX = 0;
    let startElY = 0;

    el.addEventListener('mousedown', (e) => {
      if (e.target.closest('.inline-text-input') || e.target.closest('.inline-text-toolbar')) {
        return; // Don't drag when interacting with controls or typing
      }
      isDragging = true;
      startMouseX = e.clientX;
      startMouseY = e.clientY;
      startElX = parseFloat(el.style.left) || 0;
      startElY = parseFloat(el.style.top) || 0;
      el.classList.add('selected');
      e.stopPropagation();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startMouseX;
      const dy = e.clientY - startMouseY;
      el.style.left = `${startElX + dx}px`;
      el.style.top = `${startElY + dy}px`;
    });

    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      const container = document.querySelector('.pdf-page-container');
      const scaleX = container.clientWidth / this.pageCanvas.width;
      const scaleY = container.clientHeight / this.pageCanvas.height;
      item.x = parseFloat(el.style.left) / scaleX;
      item.y = parseFloat(el.style.top) / scaleY;
    });
  }

  refreshTextOverlays() {
    // Remove existing DOM overlays
    document.querySelectorAll('.inline-text-overlay').forEach(el => el.remove());
    // Render overlays for current page
    const pageItems = this.textOverlays.filter(o => o.page === this.pageNum);
    pageItems.forEach(item => this.renderTextOverlayElement(item, false));
  }

  addSignatureStamp(dataUrl) {
    const img = new Image();
    img.onload = () => {
      this.annotations.push({
        type: 'image',
        page: this.pageNum,
        img: img,
        x: (this.pageCanvas.width - 200) / 2,
        y: this.pageCanvas.height - 200,
        w: 180,
        h: (180 * img.height) / img.width
      });
      this.redrawAnnotations();
    };
    img.src = dataUrl;
  }

  redrawAnnotations() {
    this.annotCtx.clearRect(0, 0, this.annotCanvas.width, this.annotCanvas.height);
    const pageAnnots = this.annotations.filter(a => a.page === this.pageNum);

    for (const a of pageAnnots) {
      if (a.type === 'whiteout') {
        this.annotCtx.fillStyle = '#ffffff';
        this.annotCtx.fillRect(a.x, a.y, a.w, a.h);
      } else if (a.type === 'image') {
        this.annotCtx.drawImage(a.img, a.x, a.y, a.w, a.h);
      } else if (a.type === 'draw') {
        this.annotCtx.strokeStyle = a.color;
        this.annotCtx.lineWidth = 2.5;
        this.annotCtx.lineCap = 'round';
        this.annotCtx.beginPath();
        for (let i = 0; i < a.points.length; i++) {
          const pt = a.points[i];
          if (i === 0) this.annotCtx.moveTo(pt.x, pt.y);
          else this.annotCtx.lineTo(pt.x, pt.y);
        }
        this.annotCtx.stroke();
      }
    }
  }

  clearAnnotations() {
    if (!confirm('Clear all annotations & text overlays on this page?')) return;
    this.annotations = this.annotations.filter(a => a.page !== this.pageNum);
    this.textOverlays = this.textOverlays.filter(a => a.page !== this.pageNum);
    this.redrawAnnotations();
    this.refreshTextOverlays();
  }

  downloadEditedPDF() {
    // Merge base canvas, annotation canvas, and text overlays
    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = this.pageCanvas.width;
    mergedCanvas.height = this.pageCanvas.height;
    const mCtx = mergedCanvas.getContext('2d');

    // Draw base PDF and annotations
    mCtx.drawImage(this.pageCanvas, 0, 0);
    mCtx.drawImage(this.annotCanvas, 0, 0);

    // Draw text overlays onto canvas
    const pageItems = this.textOverlays.filter(o => o.page === this.pageNum);
    for (const item of pageItems) {
      mCtx.save();
      mCtx.font = `${item.bold ? 'bold ' : ''}${item.size}px Arial, sans-serif`;

      if (item.whiteoutBg) {
        // Measure text width and height
        const metrics = mCtx.measureText(item.text);
        const padX = 6;
        const padY = 4;
        const w = metrics.width + padX * 2;
        const h = item.size + padY * 2;
        mCtx.fillStyle = '#ffffff';
        mCtx.fillRect(item.x, item.y, w, h);
      }

      mCtx.fillStyle = item.color;
      mCtx.textBaseline = 'top';
      mCtx.fillText(item.text, item.x + 4, item.y + 4);
      mCtx.restore();
    }

    const imgData = mergedCanvas.toDataURL('image/jpeg', 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: mergedCanvas.width > mergedCanvas.height ? 'l' : 'p',
      unit: 'pt',
      format: [mergedCanvas.width, mergedCanvas.height]
    });

    pdf.addImage(imgData, 'JPEG', 0, 0, mergedCanvas.width, mergedCanvas.height);
    pdf.save('edited_document.pdf');
  }
}

window.PDFEditor = PDFEditor;
