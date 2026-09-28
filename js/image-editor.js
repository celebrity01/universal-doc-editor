/**
 * Image & Scanned Document Editor
 * Features:
 * - 1-Click Realistic Scanned Document Generator & Sample Loader
 * - Direct Click-to-Type Inline Text Overlays (No browser prompts!)
 * - Whiteout Background toggle for instant text replacement on scans
 * - Whiteout Redaction Box tool
 * - Freehand Pen Markup
 * - Signature Stamping
 * - Scan Filters (B&W enhancement, High Contrast)
 * - 90° Rotation & Undo/Redo
 * - Export as PNG or PDF
 */

class ImageEditor {
  constructor() {
    this.canvas = document.getElementById('image-editor-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.wrapper = this.canvas ? this.canvas.parentElement : null;
    this.baseImage = null;
    this.history = [];
    this.currentTool = 'select'; // 'select', 'whiteout', 'text', 'draw', 'signature'
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.color = '#000000';
    this.fontSize = 20;
    this.rotation = 0;
    this.textOverlays = []; // DOM inline text overlays

    this.initEvents();
  }

  initEvents() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', (e) => this.onMouseUp(e));

    const fileInput = document.getElementById('image-upload-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.loadFile(file);
      });
    }

    const dropZone = document.getElementById('image-drop-zone');
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
    document.querySelectorAll('.img-tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });

    if (this.canvas) {
      if (tool === 'text') this.canvas.style.cursor = 'text';
      else if (tool === 'whiteout' || tool === 'draw') this.canvas.style.cursor = 'crosshair';
      else this.canvas.style.cursor = 'default';
    }
  }

  loadSampleScan() {
    // Generate a realistic scanned document on a temporary canvas
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 800;
    sampleCanvas.height = 1100;
    const sCtx = sampleCanvas.getContext('2d');

    // Slight off-white scan paper color
    sCtx.fillStyle = '#fcfbf8';
    sCtx.fillRect(0, 0, sampleCanvas.width, sampleCanvas.height);

    // Subtle scanner noise / border shadow
    sCtx.strokeStyle = '#e2e0d8';
    sCtx.lineWidth = 1;
    sCtx.strokeRect(15, 15, sampleCanvas.width - 30, sampleCanvas.height - 30);

    // Blue Hospital Header Bar
    sCtx.fillStyle = '#1e3a8a';
    sCtx.fillRect(40, 40, 720, 8);

    sCtx.fillStyle = '#0f172a';
    sCtx.font = 'bold 22px Arial, sans-serif';
    sCtx.fillText('ST. LUKE CENTRAL PATHOLOGY LABORATORIES', 40, 80);

    sCtx.font = '12px Arial, sans-serif';
    sCtx.fillStyle = '#475569';
    sCtx.fillText('CLINICAL BIOCHEMISTRY & DIAGNOSTIC REPORT', 40, 102);
    sCtx.fillText('Lab Ref: #LAB-2026-98102 | Batch: 44-B | Accredited ISO 15189', 40, 120);

    sCtx.strokeStyle = '#cbd5e1';
    sCtx.beginPath();
    sCtx.moveTo(40, 135);
    sCtx.lineTo(760, 135);
    sCtx.stroke();

    // Patient Information Block
    sCtx.font = 'bold 13px Arial, sans-serif';
    sCtx.fillStyle = '#1e293b';
    sCtx.fillText('Patient Name: Sarah Jenkins', 40, 165);
    sCtx.fillText('Age / Gender: 32 Yrs / Female', 400, 165);

    sCtx.font = 'normal 13px Arial, sans-serif';
    sCtx.fillText('Referring Doctor: Dr. Marcus Vance, M.D.', 40, 190);
    sCtx.fillText('Sample Date: 12/10/2026 09:30 AM', 400, 190);

    sCtx.fillText('Clinical Indication: Routine Wellness & Biochemical Screening', 40, 215);
    sCtx.fillText('Report Status: Final Authorized', 400, 215);

    // Table Header
    sCtx.fillStyle = '#f1f5f9';
    sCtx.fillRect(40, 240, 720, 32);
    sCtx.strokeRect(40, 240, 720, 32);

    sCtx.fillStyle = '#0f172a';
    sCtx.font = 'bold 12px Arial, sans-serif';
    sCtx.fillText('Test Investigation', 50, 260);
    sCtx.fillText('Result', 280, 260);
    sCtx.fillText('Units', 420, 260);
    sCtx.fillText('Reference Range', 550, 260);

    // Table Rows
    const tests = [
      { name: 'Fasting Blood Glucose', res: '92.4', unit: 'mg/dL', ref: '70.0 - 99.0' },
      { name: 'Hemoglobin (Hb)', res: '13.8', unit: 'g/dL', ref: '12.0 - 15.5' },
      { name: 'Total Cholesterol', res: '182.0', unit: 'mg/dL', ref: '< 200.0 (Desirable)' },
      { name: 'Serum Creatinine', res: '0.84', unit: 'mg/dL', ref: '0.50 - 1.10' },
      { name: 'Blood Urea Nitrogen (BUN)', res: '14.2', unit: 'mg/dL', ref: '7.0 - 20.0' },
      { name: 'Thyroid Stimulating Hormone', res: '2.14', unit: 'uIU/mL', ref: '0.40 - 4.20' }
    ];

    let rowY = 272;
    tests.forEach((t, i) => {
      sCtx.fillStyle = i % 2 === 0 ? '#ffffff' : '#f8fafc';
      sCtx.fillRect(40, rowY, 720, 34);
      sCtx.strokeRect(40, rowY, 720, 34);

      sCtx.fillStyle = '#1e293b';
      sCtx.font = 'normal 13px Arial, sans-serif';
      sCtx.fillText(t.name, 50, rowY + 22);

      sCtx.font = 'bold 13px Arial, sans-serif';
      sCtx.fillText(t.res, 280, rowY + 22);

      sCtx.font = 'normal 12px Arial, sans-serif';
      sCtx.fillText(t.unit, 420, rowY + 22);
      sCtx.fillText(t.ref, 550, rowY + 22);

      rowY += 34;
    });

    // Medical Stamp simulation
    sCtx.save();
    sCtx.translate(580, 600);
    sCtx.rotate(-0.12);
    sCtx.strokeStyle = 'rgba(220, 38, 38, 0.7)';
    sCtx.lineWidth = 2.5;
    sCtx.strokeRect(-100, -35, 200, 70);
    sCtx.fillStyle = 'rgba(220, 38, 38, 0.75)';
    sCtx.font = 'bold 13px Arial, sans-serif';
    sCtx.textAlign = 'center';
    sCtx.fillText('LABORATORY VERIFIED', 0, -8);
    sCtx.font = '10px Arial, sans-serif';
    sCtx.fillText('ST. LUKE CENTRAL PATHOLOGY', 0, 10);
    sCtx.fillText('12-OCT-2026', 0, 24);
    sCtx.restore();

    // Notes section
    sCtx.fillStyle = '#0f172a';
    sCtx.font = 'bold 13px Arial, sans-serif';
    sCtx.fillText('Clinical Pathology Remarks:', 40, 520);
    sCtx.font = 'normal 12px Arial, sans-serif';
    sCtx.fillStyle = '#334155';
    sCtx.fillText('All biochemical markers evaluated fall strictly within normal physiological limits.', 40, 545);
    sCtx.fillText('No pathological alterations detected in metabolic screen.', 40, 565);

    // Tips on scan
    sCtx.fillStyle = '#2563eb';
    sCtx.font = 'italic 12px Arial, sans-serif';
    sCtx.fillText('💡 Try OmniDoc: Click "Whiteout Box" to redact any test or name, then use "Text Stamp" to type over it!', 40, 700);

    // Footer signature line
    sCtx.strokeStyle = '#0f172a';
    sCtx.beginPath();
    sCtx.moveTo(40, 850);
    sCtx.lineTo(260, 850);
    sCtx.stroke();
    sCtx.font = 'bold 12px Arial, sans-serif';
    sCtx.fillText('Chief Pathologist: Dr. Henry Sterling', 40, 870);

    const img = new Image();
    img.onload = () => {
      this.baseImage = img;
      this.canvas.width = img.width;
      this.canvas.height = img.height;
      this.ctx.drawImage(img, 0, 0);
      this.saveState();
      document.getElementById('image-drop-zone').classList.add('hidden');
      document.getElementById('image-editor-workspace').classList.remove('hidden');
    };
    img.src = sampleCanvas.toDataURL('image/png');
  }

  loadFile(file) {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        this.baseImage = img;
        this.canvas.width = img.width;
        this.canvas.height = img.height;
        this.ctx.drawImage(img, 0, 0);
        this.saveState();
        document.getElementById('image-drop-zone').classList.add('hidden');
        document.getElementById('image-editor-workspace').classList.remove('hidden');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  saveState() {
    this.history.push(this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height));
    if (this.history.length > 25) this.history.shift();
  }

  undo() {
    if (this.history.length > 1) {
      this.history.pop();
      const previousState = this.history[this.history.length - 1];
      this.ctx.putImageData(previousState, 0, 0);
    }
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  onMouseDown(e) {
    if (!this.baseImage) return;
    const pos = this.getPos(e);
    this.startX = pos.x;
    this.startY = pos.y;
    this.isDrawing = true;

    if (this.currentTool === 'text') {
      // Direct Click-and-Type: Spawn inline text box on scan
      this.createInlineTextOverlay(pos.x, pos.y);
      this.isDrawing = false;
      this.setTool('select');
    } else if (this.currentTool === 'draw') {
      this.ctx.beginPath();
      this.ctx.moveTo(pos.x, pos.y);
    }
  }

  onMouseMove(e) {
    if (!this.isDrawing || !this.baseImage) return;
    const pos = this.getPos(e);

    if (this.currentTool === 'draw') {
      this.ctx.strokeStyle = this.color;
      this.ctx.lineWidth = 3;
      this.ctx.lineCap = 'round';
      this.ctx.lineTo(pos.x, pos.y);
      this.ctx.stroke();
    }
  }

  onMouseUp(e) {
    if (!this.isDrawing || !this.baseImage) return;
    this.isDrawing = false;

    if (this.currentTool === 'whiteout') {
      const pos = this.getPos(e);
      const x = Math.min(this.startX, pos.x);
      const y = Math.min(this.startY, pos.y);
      const w = Math.abs(pos.x - this.startX);
      const h = Math.abs(pos.y - this.startY);

      if (w > 3 && h > 3) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x, y, w, h);
        this.saveState();
      }
      this.setTool('select');
    } else if (this.currentTool === 'draw') {
      this.saveState();
    }
  }

  /**
   * Direct Click-to-Edit Text Overlay for Scans
   */
  createInlineTextOverlay(canvasX, canvasY, initialText = 'Type text here...') {
    const parent = this.canvas.parentElement;
    if (!parent) return;

    // Ensure parent has relative positioning
    parent.style.position = 'relative';

    const overlayId = 'img_txt_' + Date.now();
    const item = {
      id: overlayId,
      x: canvasX,
      y: canvasY,
      text: initialText,
      size: 16,
      color: '#000000',
      bold: false,
      whiteoutBg: true
    };
    this.textOverlays.push(item);

    const scaleX = this.canvas.clientWidth / this.canvas.width;
    const scaleY = this.canvas.clientHeight / this.canvas.height;

    const el = document.createElement('div');
    el.id = item.id;
    el.className = 'inline-text-overlay whiteout-bg';
    el.style.left = `${this.canvas.offsetLeft + canvasX * scaleX}px`;
    el.style.top = `${this.canvas.offsetTop + canvasY * scaleY}px`;

    el.innerHTML = `
      <div class="inline-text-toolbar no-print">
        <select class="txt-size-select">
          <option value="12">12px</option>
          <option value="14">14px</option>
          <option value="16" selected>16px</option>
          <option value="20">20px</option>
          <option value="26">26px</option>
        </select>
        <button type="button" class="txt-bold-btn" title="Bold"><b>B</b></button>
        <label class="flex items-center gap-1 cursor-pointer" title="Solid white background to cover existing scan text">
          <input type="checkbox" class="txt-whiteout-chk" checked> Whiteout
        </label>
        <select class="txt-color-select">
          <option value="#000000">Black</option>
          <option value="#1e40af">Blue</option>
          <option value="#b91c1c">Red</option>
        </select>
        <button type="button" class="txt-del-btn text-red-300 hover:text-red-100"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="inline-text-input" contenteditable="true" style="font-size: 16px; color: #000000;">
        ${item.text}
      </div>
    `;

    parent.appendChild(el);

    const inputDiv = el.querySelector('.inline-text-input');
    const sizeSelect = el.querySelector('.txt-size-select');
    const boldBtn = el.querySelector('.txt-bold-btn');
    const whiteoutChk = el.querySelector('.txt-whiteout-chk');
    const colorSelect = el.querySelector('.txt-color-select');
    const delBtn = el.querySelector('.txt-del-btn');

    inputDiv.addEventListener('input', () => { item.text = inputDiv.innerText; });
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

    // Auto-focus & select
    inputDiv.focus();
    const range = document.createRange();
    range.selectNodeContents(inputDiv);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  addSignatureStamp(dataUrl) {
    if (!this.baseImage) return;
    const img = new Image();
    img.onload = () => {
      const w = 180;
      const h = (180 * img.height) / img.width;
      this.ctx.drawImage(img, (this.canvas.width - w) / 2, this.canvas.height - h - 100, w, h);
      this.saveState();
    };
    img.src = dataUrl;
  }

  applyBWFilter() {
    if (!this.baseImage) return;
    const imgData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const gray = 0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2];
      // High contrast scan clean threshold
      const val = gray > 175 ? 255 : (gray < 85 ? 0 : gray);
      d[i] = val;
      d[i + 1] = val;
      d[i + 2] = val;
    }
    this.ctx.putImageData(imgData, 0, 0);
    this.saveState();
  }

  rotate90() {
    if (!this.baseImage) return;
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = this.canvas.height;
    tempCanvas.height = this.canvas.width;
    const tCtx = tempCanvas.getContext('2d');

    tCtx.translate(tempCanvas.width / 2, tempCanvas.height / 2);
    tCtx.rotate(Math.PI / 2);
    tCtx.drawImage(this.canvas, -this.canvas.width / 2, -this.canvas.height / 2);

    this.canvas.width = tempCanvas.width;
    this.canvas.height = tempCanvas.height;
    this.ctx.drawImage(tempCanvas, 0, 0);
    this.saveState();
  }

  downloadImage(format = 'png') {
    this.renderTextOverlaysToCanvas();
    const a = document.createElement('a');
    a.download = `edited_scan.${format}`;
    a.href = this.canvas.toDataURL(`image/${format}`, 0.95);
    a.click();
  }

  downloadPDF() {
    this.renderTextOverlaysToCanvas();
    const imgData = this.canvas.toDataURL('image/jpeg', 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: this.canvas.width > this.canvas.height ? 'l' : 'p',
      unit: 'pt',
      format: [this.canvas.width, this.canvas.height]
    });
    pdf.addImage(imgData, 'JPEG', 0, 0, this.canvas.width, this.canvas.height);
    pdf.save('edited_document_scan.pdf');
  }

  renderTextOverlaysToCanvas() {
    for (const item of this.textOverlays) {
      this.ctx.save();
      this.ctx.font = `${item.bold ? 'bold ' : ''}${item.size}px Arial, sans-serif`;

      if (item.whiteoutBg) {
        const metrics = this.ctx.measureText(item.text);
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(item.x, item.y, metrics.width + 12, item.size + 8);
      }

      this.ctx.fillStyle = item.color;
      this.ctx.textBaseline = 'top';
      this.ctx.fillText(item.text, item.x + 6, item.y + 4);
      this.ctx.restore();
    }
    // Clean up DOM overlays after baking
    document.querySelectorAll('.inline-text-overlay').forEach(el => el.remove());
    this.textOverlays = [];
  }
}

window.ImageEditor = ImageEditor;
