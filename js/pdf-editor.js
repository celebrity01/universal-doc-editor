/**
 * PDF Viewer, Annotator & Text-Layer Direct Click-to-Edit
 *
 * Key features:
 * - PDF.js text layer: every existing word/number becomes clickable
 * - Click any rendered text span → in-place editable field pre-filled with that word
 * - Whiteout box tool (drag to erase), Freehand pen, Signature stamp
 * - 1-Click sample PDF generator
 * - Export merges canvas + text edits into a clean PDF
 */

class PDFEditor {
  constructor() {
    this.pdfDoc       = null;
    this.pageNum      = 1;
    this.totalNum     = 0;
    this.scale        = 1.35;
    this.currentTool  = 'select';
    this.isDrawing    = false;
    this.startX       = 0;
    this.startY       = 0;
    this.annotations  = [];     // canvas-level: whiteout rects, draw strokes, image stamps
    this.textOverlays = [];     // DOM overlays: user-added or text-layer-activated edits
    this.color        = '#000000';
    this.fontSize     = 16;
    this.currentStroke = null;
    this._currentPage  = null;  // cached page object for text-layer rendering

    this.viewportContainer = document.getElementById('pdf-viewport-container');
    this.pageContainer     = document.querySelector('.pdf-page-container');
    this.pageCanvas        = document.getElementById('pdf-base-canvas');
    this.annotCanvas       = document.getElementById('pdf-annot-canvas');
    this.pageCtx  = this.pageCanvas  ? this.pageCanvas.getContext('2d')  : null;
    this.annotCtx = this.annotCanvas ? this.annotCanvas.getContext('2d') : null;

    this.initEvents();
  }

  /* ───────────── EVENT WIRING ───────────── */

  initEvents() {
    if (!this.annotCanvas) return;

    this.annotCanvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.annotCanvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup',             (e) => this.onMouseUp(e));

    const fileInput = document.getElementById('pdf-upload-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) this.loadFile(e.target.files[0]);
      });
    }

    const dropZone = document.getElementById('pdf-drop-zone');
    if (dropZone) {
      dropZone.addEventListener('dragover',  (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
      dropZone.addEventListener('dragleave', ()  => dropZone.classList.remove('dragover'));
      dropZone.addEventListener('drop',      (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) this.loadFile(e.dataTransfer.files[0]);
      });
    }
  }

  /* ───────────── TOOL SELECTION ───────────── */

  setTool(tool) {
    this.currentTool = tool;
    document.querySelectorAll('.pdf-tool-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tool === tool);
    });

    // When activating the text layer tool, show pointer on the text spans
    const textLayer = document.getElementById('pdf-text-layer');
    if (textLayer) {
      textLayer.style.pointerEvents = (tool === 'text-layer' || tool === 'select') ? 'auto' : 'none';
    }

    if (this.annotCanvas) {
      if (tool === 'text')    this.annotCanvas.style.cursor = 'text';
      else if (tool === 'whiteout' || tool === 'draw') this.annotCanvas.style.cursor = 'crosshair';
      else                    this.annotCanvas.style.cursor = 'default';
    }
  }

  /* ───────────── SAMPLE PDF GENERATION ───────────── */

  async loadSamplePDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });

    doc.setFillColor(37, 99, 235);
    doc.rect(40, 40, 515, 6, 'F');

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(15, 23, 42);
    doc.text('HARBOR CLINICAL HEALTH CENTER', 40, 80);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text('104 Healthcare Boulevard, Suite 500  |  Tel: (800) 555-0192', 40, 96);
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

    doc.text('Patient Name: Sarah Jenkins',             40,  185);
    doc.text('Age / Gender: 32 / Female',              300,  185);
    doc.text('Date of Examination: October 14, 2026',   40,  205);
    doc.text('Physician: Dr. Marcus Vance, M.D.',      300,  205);

    doc.text('Clinical Assessment & Diagnosis:',        40,  235);
    doc.setFont('Helvetica', 'italic');
    doc.text('Patient presented with acute throat irritation, fatigue, and fever.',              50, 255);
    doc.text('Physical examination reveals pharyngeal inflammation and mild congestion.',        50, 272);
    doc.text('Vital signs: BP 120/78 mmHg, Temp 38.2 C, Pulse 76 bpm.',                       50, 289);

    doc.setFont('Helvetica', 'bold');
    doc.text('Medical Recommendations & Leave Recommendation:', 40, 320);
    doc.setFont('Helvetica', 'normal');
    doc.text('1. Complete medical rest from 14/10/2026 to 21/10/2026 (inclusive).', 50, 340);
    doc.text('2. Prescribed medication regimen: Amoxicillin 500mg, Paracetamol 1g.',  50, 357);
    doc.text('3. Avoid strenuous physical duty until authorized follow-up consultation.', 50, 374);

    doc.setDrawColor(203, 213, 225);
    doc.rect(40, 395, 515, 90);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('TIP: Click directly on any name, date, or word above to edit it!', 50, 416);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('The "Click Word" tool highlights every existing text span — click to replace any value.', 50, 434);
    doc.text('Use "Whiteout Box" to drag-erase areas, or "Click & Type" to place new text anywhere.', 50, 450);
    doc.text('Export bakes all edits (whiteouts + overlays) into a single clean PDF file.', 50, 466);

    doc.setTextColor(30, 41, 59);
    doc.line(40, 535, 220, 535);
    doc.setFontSize(10);
    doc.text("Doctor's Signature & Stamp", 40, 550);

    doc.line(360, 535, 540, 535);
    doc.text('Date of Authorization', 360, 550);

    const pdfBlob = doc.output('blob');
    await this.loadBlob(pdfBlob);
  }

  async loadBlob(blob) {
    const arrayBuffer = await blob.arrayBuffer();
    this.initPdfFromArray(new Uint8Array(arrayBuffer));
  }

  /* ───────────── FILE LOADING ───────────── */

  async loadFile(file) {
    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => this.initPdfFromArray(new Uint8Array(e.target.result));
    reader.readAsArrayBuffer(file);
  }

  async initPdfFromArray(typedArray) {
    try {
      pdfjsLib.GlobalWorkerOptions.workerSrc =
        'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
      this.pdfDoc    = await pdfjsLib.getDocument(typedArray).promise;
      this.totalNum  = this.pdfDoc.numPages;
      this.pageNum   = 1;
      this.annotations  = [];
      this.textOverlays = [];
      document.getElementById('pdf-page-count').textContent = this.totalNum;
      document.getElementById('pdf-drop-zone').classList.add('hidden');
      document.getElementById('pdf-editor-workspace').classList.remove('hidden');
      await this.renderPage(this.pageNum);
    } catch (err) {
      console.error('PDF load error:', err);
      alert('Could not render PDF. ' + err.message);
    }
  }

  /* ───────────── PAGE RENDERING ───────────── */

  async renderPage(num) {
    if (!this.pdfDoc) return;

    const page     = await this.pdfDoc.getPage(num);
    this._currentPage = page;
    const viewport = page.getViewport({ scale: this.scale });

    // Resize canvases
    this.pageCanvas.width  = viewport.width;
    this.pageCanvas.height = viewport.height;
    this.annotCanvas.width  = viewport.width;
    this.annotCanvas.height = viewport.height;

    // Render PDF page pixels
    await page.render({ canvasContext: this.pageCtx, viewport }).promise;

    document.getElementById('pdf-current-page').textContent = num;
    this.redrawAnnotations();
    this.refreshTextOverlays();

    // Build the interactive text layer
    await this.buildTextLayer(page, viewport);
  }

  /* ───────────── PDF.JS TEXT LAYER (CLICK ANY WORD) ───────────── */

  /**
   * Extracts all text items from PDF.js and renders them as
   * transparent, clickable <span> elements absolutely positioned
   * over the canvas. Clicking any span activates an in-place editor
   * pre-filled with that word/phrase.
   */
  async buildTextLayer(page, viewport) {
    const container = document.querySelector('.pdf-page-container');
    if (!container) return;

    // Remove any previous text layer
    const old = document.getElementById('pdf-text-layer');
    if (old) old.remove();

    const textContent = await page.getTextContent();

    // Create the layer div
    const layer = document.createElement('div');
    layer.id = 'pdf-text-layer';
    layer.style.cssText = `
      position: absolute;
      top: 0; left: 0;
      width: ${viewport.width}px;
      height: ${viewport.height}px;
      pointer-events: auto;
      overflow: hidden;
      z-index: 10;
    `;

    // Use PDF.js TextLayer renderer for exact span positioning
    const textLayerFrag = document.createDocumentFragment();

    for (const item of textContent.items) {
      if (!item.str.trim()) continue;

      // Transform PDF coordinates → CSS position
      const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
      // tx = [a, b, c, d, e, f] — affine transform
      const angle = Math.atan2(tx[1], tx[0]);
      const scaleX = Math.sqrt(tx[0] * tx[0] + tx[1] * tx[1]);
      const scaleY = Math.sqrt(tx[2] * tx[2] + tx[3] * tx[3]);
      const fontHeight = scaleY;
      const fontWidth  = item.width * (viewport.scale);

      const span = document.createElement('span');
      span.textContent = item.str;
      span.dataset.originalText = item.str;
      span.style.cssText = `
        position: absolute;
        left:   ${tx[4]}px;
        top:    ${tx[5] - fontHeight}px;
        font-size: ${fontHeight}px;
        font-family: sans-serif;
        width: ${fontWidth}px;
        height: ${fontHeight * 1.1}px;
        line-height: ${fontHeight}px;
        transform-origin: 0% 0%;
        transform: rotate(${angle}rad);
        color: transparent;
        cursor: text;
        white-space: pre;
        z-index: 10;
        border-radius: 2px;
        transition: background 0.1s;
        box-sizing: border-box;
        padding: 0;
      `;

      // Hover: reveal highlight
      span.addEventListener('mouseenter', () => {
        if (!span.classList.contains('pdf-span-editing')) {
          span.style.background = 'rgba(59,130,246,0.18)';
          span.style.boxShadow  = '0 0 0 1.5px rgba(59,130,246,0.5)';
          span.title = `Click to edit: "${item.str}"`;
        }
      });
      span.addEventListener('mouseleave', () => {
        if (!span.classList.contains('pdf-span-editing')) {
          span.style.background = '';
          span.style.boxShadow  = '';
        }
      });

      // Click: activate in-place editor at this exact position
      span.addEventListener('click', (e) => {
        e.stopPropagation();
        this.activateSpanEdit(span, tx[4], tx[5] - fontHeight, fontHeight, fontWidth, item.str);
      });

      textLayerFrag.appendChild(span);
    }

    layer.appendChild(textLayerFrag);
    container.appendChild(layer);
  }

  /**
   * Activates an in-place editable field directly over a clicked text span.
   * The span becomes invisible while the input is open; on blur the edit is
   * stored and a whiteout + text annotation is committed to the canvas layer.
   */
  activateSpanEdit(span, x, y, fontHeight, fontWidth, originalText) {
    if (span.classList.contains('pdf-span-editing')) return;
    span.classList.add('pdf-span-editing');
    span.style.background = '';
    span.style.boxShadow  = '';

    // Build an inline input box at exactly the same position/size
    const input = document.createElement('input');
    input.type  = 'text';
    input.value = originalText;
    input.style.cssText = `
      position: absolute;
      left:   ${x}px;
      top:    ${y}px;
      width:  ${Math.max(fontWidth + 40, 120)}px;
      height: ${fontHeight * 1.3}px;
      font-size: ${fontHeight}px;
      font-family: sans-serif;
      line-height: ${fontHeight}px;
      padding: 0 4px;
      border: 2px solid #2563eb;
      border-radius: 4px;
      background: #ffffff;
      color: #0f172a;
      outline: none;
      z-index: 20;
      box-shadow: 0 0 0 3px rgba(37,99,235,0.25);
      box-sizing: border-box;
    `;

    const container = document.querySelector('.pdf-page-container');
    container.appendChild(input);
    input.focus();
    input.select();

    const commit = () => {
      const newText = input.value;
      input.remove();
      span.classList.remove('pdf-span-editing');

      if (newText === originalText) return; // nothing changed

      // Record as a text overlay (will be baked on export)
      this.textOverlays.push({
        id:         'span_' + Date.now(),
        page:       this.pageNum,
        x:          x,
        y:          y,
        text:       newText,
        size:       fontHeight,
        color:      '#000000',
        bold:       false,
        whiteoutBg: true,
        whiteoutW:  fontWidth + 20,
        whiteoutH:  fontHeight * 1.2,
        fromSpan:   true   // flag: don't render DOM overlay, bake directly
      });

      // Immediately whiteout the original on annotation canvas + draw new text
      this.annotCtx.fillStyle = '#ffffff';
      this.annotCtx.fillRect(x, y, fontWidth + 20, fontHeight * 1.3);
      this.annotCtx.font      = `${fontHeight}px sans-serif`;
      this.annotCtx.fillStyle = '#000000';
      this.annotCtx.textBaseline = 'top';
      this.annotCtx.fillText(newText, x + 2, y + 2);

      // Hide the span since it's been replaced visually
      span.style.display = 'none';
    };

    input.addEventListener('blur',    commit);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); input.blur(); }
      if (e.key === 'Escape') {
        input.removeEventListener('blur', commit);
        input.remove();
        span.classList.remove('pdf-span-editing');
      }
    });
  }

  /* ───────────── NAVIGATION & ZOOM ───────────── */

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

  /* ───────────── MOUSE EVENTS (whiteout / draw / click-type tools) ───────────── */

  getCanvasPos(e) {
    const rect = this.annotCanvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.annotCanvas.width / rect.width),
      y: (e.clientY - rect.top)  * (this.annotCanvas.height / rect.height)
    };
  }

  onMouseDown(e) {
    const pos = this.getCanvasPos(e);
    this.startX    = pos.x;
    this.startY    = pos.y;
    this.isDrawing = true;

    if (this.currentTool === 'text') {
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
      this.annotCtx.fillStyle   = 'rgba(255,255,255,0.95)';
      this.annotCtx.strokeStyle = '#3b82f6';
      this.annotCtx.lineWidth   = 1.5;
      const w = pos.x - this.startX;
      const h = pos.y - this.startY;
      this.annotCtx.fillRect  (this.startX, this.startY, w, h);
      this.annotCtx.strokeRect(this.startX, this.startY, w, h);
    } else if (this.currentTool === 'draw' && this.currentStroke) {
      this.currentStroke.push({ x: pos.x, y: pos.y });
      this.annotCtx.strokeStyle = this.color;
      this.annotCtx.lineWidth   = 2.5;
      this.annotCtx.lineCap     = 'round';
      this.annotCtx.beginPath();
      const prev = this.currentStroke[this.currentStroke.length - 2];
      this.annotCtx.moveTo(prev.x, prev.y);
      this.annotCtx.lineTo(pos.x,  pos.y);
      this.annotCtx.stroke();
    }
  }

  onMouseUp(e) {
    if (!this.isDrawing) return;
    this.isDrawing = false;

    if (this.currentTool === 'whiteout') {
      const end = this.getCanvasPos(e);
      const x = Math.min(this.startX, end.x);
      const y = Math.min(this.startY, end.y);
      const w = Math.abs(end.x - this.startX);
      const h = Math.abs(end.y - this.startY);
      if (w > 5 && h > 5) {
        this.annotations.push({ type: 'whiteout', page: this.pageNum, x, y, w, h });
      }
      this.redrawAnnotations();
      this.setTool('select');
    } else if (this.currentTool === 'draw' && this.currentStroke) {
      this.annotations.push({ type: 'draw', page: this.pageNum, points: this.currentStroke, color: this.color });
      this.currentStroke = null;
    }
  }

  /* ───────────── INLINE TEXT OVERLAYS (click-and-type anywhere) ───────────── */

  createInlineTextOverlay(canvasX, canvasY, initialText = 'Type here...') {
    const id   = 'txt_' + Date.now();
    const item = {
      id, page: this.pageNum, x: canvasX, y: canvasY,
      text: initialText, size: 16, color: '#000000',
      bold: false, whiteoutBg: true, fromSpan: false
    };
    this.textOverlays.push(item);
    this.renderTextOverlayElement(item, true);
  }

  renderTextOverlayElement(item, autoFocus = false) {
    if (item.fromSpan) return; // span edits are already baked to canvas
    const container = document.querySelector('.pdf-page-container');
    if (!container) return;

    const scaleX = container.clientWidth  / this.pageCanvas.width;
    const scaleY = container.clientHeight / this.pageCanvas.height;

    const el = document.createElement('div');
    el.id          = item.id;
    el.className   = `inline-text-overlay${item.whiteoutBg ? ' whiteout-bg' : ''}`;
    el.style.left  = `${item.x * scaleX}px`;
    el.style.top   = `${item.y * scaleY}px`;
    el.style.zIndex = '25';

    el.innerHTML = `
      <div class="inline-text-toolbar no-print">
        <select class="txt-size-select">
          ${[12,14,16,18,22,28].map(s =>
            `<option value="${s}"${item.size===s?' selected':''}>${s}px</option>`).join('')}
        </select>
        <button type="button" class="txt-bold-btn${item.bold?' font-bold':''}"><b>B</b></button>
        <label style="font-size:10px;cursor:pointer;" title="White background covers existing text">
          <input type="checkbox" class="txt-whiteout-chk"${item.whiteoutBg?' checked':''}> White BG
        </label>
        <select class="txt-color-select">
          <option value="#000000"${item.color==='#000000'?' selected':''}>Black</option>
          <option value="#1e40af"${item.color==='#1e40af'?' selected':''}>Blue</option>
          <option value="#b91c1c"${item.color==='#b91c1c'?' selected':''}>Red</option>
          <option value="#047857"${item.color==='#047857'?' selected':''}>Green</option>
        </select>
        <button type="button" class="txt-del-btn" title="Delete"><i class="fa-solid fa-trash"></i></button>
      </div>
      <div class="inline-text-input" contenteditable="true"
           style="font-size:${item.size}px;color:${item.color};font-weight:${item.bold?'bold':'normal'}">
        ${item.text}
      </div>`;

    container.appendChild(el);

    const inputDiv    = el.querySelector('.inline-text-input');
    const sizeSelect  = el.querySelector('.txt-size-select');
    const boldBtn     = el.querySelector('.txt-bold-btn');
    const whiteoutChk = el.querySelector('.txt-whiteout-chk');
    const colorSelect = el.querySelector('.txt-color-select');
    const delBtn      = el.querySelector('.txt-del-btn');

    inputDiv.addEventListener('input',  () => { item.text = inputDiv.innerText; });
    sizeSelect.addEventListener ('change', (e) => { item.size = parseInt(e.target.value); inputDiv.style.fontSize = item.size + 'px'; });
    boldBtn.addEventListener    ('click',  () => { item.bold = !item.bold; inputDiv.style.fontWeight = item.bold ? 'bold' : 'normal'; });
    whiteoutChk.addEventListener('change', (e) => { item.whiteoutBg = e.target.checked; el.classList.toggle('whiteout-bg', item.whiteoutBg); });
    colorSelect.addEventListener('change', (e) => { item.color = e.target.value; inputDiv.style.color = item.color; });
    delBtn.addEventListener     ('click',  () => { this.textOverlays = this.textOverlays.filter(o => o.id !== item.id); el.remove(); });

    this.makeDraggable(el, item);

    if (autoFocus) {
      setTimeout(() => {
        inputDiv.focus();
        const range = document.createRange();
        range.selectNodeContents(inputDiv);
        const sel = window.getSelection();
        if (sel) { sel.removeAllRanges(); sel.addRange(range); }
      }, 0);
    }
  }

  makeDraggable(el, item) {
    let isDragging = false, sX = 0, sY = 0, eX = 0, eY = 0;
    el.addEventListener('mousedown', (e) => {
      if (e.target.closest('.inline-text-input') || e.target.closest('.inline-text-toolbar')) return;
      isDragging = true;
      sX = e.clientX; sY = e.clientY;
      eX = parseFloat(el.style.left) || 0;
      eY = parseFloat(el.style.top)  || 0;
      el.classList.add('selected');
      e.stopPropagation();
    });
    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      el.style.left = `${eX + e.clientX - sX}px`;
      el.style.top  = `${eY + e.clientY - sY}px`;
    });
    window.addEventListener('mouseup', () => {
      if (!isDragging) return;
      isDragging = false;
      const container = document.querySelector('.pdf-page-container');
      const sx = container.clientWidth  / this.pageCanvas.width;
      const sy = container.clientHeight / this.pageCanvas.height;
      item.x = parseFloat(el.style.left)  / sx;
      item.y = parseFloat(el.style.top)   / sy;
    });
  }

  refreshTextOverlays() {
    document.querySelectorAll('.inline-text-overlay').forEach(el => el.remove());
    this.textOverlays
      .filter(o => o.page === this.pageNum && !o.fromSpan)
      .forEach(item => this.renderTextOverlayElement(item, false));
  }

  /* ───────────── SIGNATURE STAMP ───────────── */

  addSignatureStamp(dataUrl) {
    const img = new Image();
    img.onload = () => {
      this.annotations.push({
        type: 'image', page: this.pageNum,
        img,
        x: (this.pageCanvas.width - 200) / 2,
        y: this.pageCanvas.height - 200,
        w: 180,
        h: (180 * img.height) / img.width
      });
      this.redrawAnnotations();
    };
    img.src = dataUrl;
  }

  /* ───────────── CANVAS ANNOTATION DRAW ───────────── */

  redrawAnnotations() {
    this.annotCtx.clearRect(0, 0, this.annotCanvas.width, this.annotCanvas.height);
    const items = this.annotations.filter(a => a.page === this.pageNum);

    for (const a of items) {
      if (a.type === 'whiteout') {
        this.annotCtx.fillStyle = '#ffffff';
        this.annotCtx.fillRect(a.x, a.y, a.w, a.h);
      } else if (a.type === 'image') {
        this.annotCtx.drawImage(a.img, a.x, a.y, a.w, a.h);
      } else if (a.type === 'draw') {
        this.annotCtx.strokeStyle = a.color;
        this.annotCtx.lineWidth   = 2.5;
        this.annotCtx.lineCap     = 'round';
        this.annotCtx.beginPath();
        a.points.forEach((pt, i) => {
          if (i === 0) this.annotCtx.moveTo(pt.x, pt.y);
          else         this.annotCtx.lineTo(pt.x, pt.y);
        });
        this.annotCtx.stroke();
      }
    }
  }

  clearAnnotations() {
    if (!confirm('Clear all annotations & text overlays on this page?')) return;
    this.annotations  = this.annotations .filter(a => a.page !== this.pageNum);
    this.textOverlays = this.textOverlays.filter(a => a.page !== this.pageNum);
    this.redrawAnnotations();
    this.refreshTextOverlays();
    // Re-show hidden text-layer spans
    const layer = document.getElementById('pdf-text-layer');
    if (layer) layer.querySelectorAll('span').forEach(s => s.style.display = '');
  }

  /* ───────────── EXPORT ───────────── */

  downloadEditedPDF() {
    // Merge: page canvas + annotation canvas + DOM text overlays
    const merged = document.createElement('canvas');
    merged.width  = this.pageCanvas.width;
    merged.height = this.pageCanvas.height;
    const mCtx = merged.getContext('2d');

    mCtx.drawImage(this.pageCanvas,  0, 0);
    mCtx.drawImage(this.annotCanvas, 0, 0);

    // Bake DOM text overlays (user-added, not span-edits which are already on annotCanvas)
    const pageItems = this.textOverlays.filter(o => o.page === this.pageNum && !o.fromSpan);
    for (const item of pageItems) {
      mCtx.save();
      mCtx.font = `${item.bold ? 'bold ' : ''}${item.size}px Arial, sans-serif`;
      if (item.whiteoutBg) {
        const meas = mCtx.measureText(item.text);
        mCtx.fillStyle = '#ffffff';
        mCtx.fillRect(item.x, item.y, meas.width + 12, item.size + 8);
      }
      mCtx.fillStyle     = item.color;
      mCtx.textBaseline  = 'top';
      mCtx.fillText(item.text, item.x + 4, item.y + 4);
      mCtx.restore();
    }

    const imgData   = merged.toDataURL('image/jpeg', 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: merged.width > merged.height ? 'l' : 'p',
      unit:   'pt',
      format: [merged.width, merged.height]
    });
    pdf.addImage(imgData, 'JPEG', 0, 0, merged.width, merged.height);
    pdf.save('edited_document.pdf');
  }
}

window.PDFEditor = PDFEditor;
