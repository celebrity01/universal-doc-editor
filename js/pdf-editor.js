/**
 * PDF Viewer, Annotator, and Editor
 * Powered by Mozilla PDF.js & Canvas Layering
 */

class PDFEditor {
  constructor() {
    this.pdfDoc = null;
    this.pageNum = 1;
    this.totalNum = 0;
    this.scale = 1.3;
    this.currentTool = 'select'; // 'select', 'text', 'whiteout', 'draw', 'signature'
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.annotations = []; // list of items on current page
    this.color = '#000000';
    this.fontSize = 16;

    this.viewportContainer = document.getElementById('pdf-viewport-container');
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
    window.addEventListener('mouseup', () => this.onMouseUp());

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
      this.annotCanvas.style.cursor = tool === 'select' ? 'default' : 'crosshair';
    }
  }

  async loadFile(file) {
    if (file.type !== 'application/pdf') {
      alert('Please upload a valid PDF file.');
      return;
    }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const typedArray = new Uint8Array(e.target.result);
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
    };
    reader.readAsArrayBuffer(file);
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
    this.scale += 0.2;
    this.renderPage(this.pageNum);
  }

  zoomOut() {
    if (this.scale <= 0.6) return;
    this.scale -= 0.2;
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
      const text = prompt('Enter text to place:');
      if (text) {
        this.annotations.push({
          type: 'text',
          page: this.pageNum,
          x: pos.x,
          y: pos.y,
          text: text,
          color: this.color,
          fontSize: this.fontSize
        });
        this.redrawAnnotations();
      }
      this.isDrawing = false;
    } else if (this.currentTool === 'draw') {
      this.currentStroke = [{ x: pos.x, y: pos.y }];
    }
  }

  onMouseMove(e) {
    if (!this.isDrawing) return;
    const pos = this.getCanvasPos(e);

    if (this.currentTool === 'whiteout') {
      this.redrawAnnotations();
      this.annotCtx.fillStyle = 'white';
      this.annotCtx.strokeStyle = '#94a3b8';
      this.annotCtx.lineWidth = 1;
      const w = pos.x - this.startX;
      const h = pos.y - this.startY;
      this.annotCtx.fillRect(this.startX, this.startY, w, h);
      this.annotCtx.strokeRect(this.startX, this.startY, w, h);
    } else if (this.currentTool === 'draw') {
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
      const endX = event.clientX ? this.getCanvasPos(event).x : this.startX + 50;
      const endY = event.clientY ? this.getCanvasPos(event).y : this.startY + 20;
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

  addSignatureStamp(dataUrl) {
    const img = new Image();
    img.onload = () => {
      this.annotations.push({
        type: 'image',
        page: this.pageNum,
        img: img,
        x: 100,
        y: 100,
        w: 160,
        h: (160 * img.height) / img.width
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
      } else if (a.type === 'text') {
        this.annotCtx.font = `${a.fontSize}px Arial, sans-serif`;
        this.annotCtx.fillStyle = a.color;
        this.annotCtx.fillText(a.text, a.x, a.y);
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
    if (!confirm('Clear all annotations on this page?')) return;
    this.annotations = this.annotations.filter(a => a.page !== this.pageNum);
    this.redrawAnnotations();
  }

  downloadEditedPDF() {
    // Merge base canvas and annotation canvas
    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = this.pageCanvas.width;
    mergedCanvas.height = this.pageCanvas.height;
    const mCtx = mergedCanvas.getContext('2d');

    mCtx.drawImage(this.pageCanvas, 0, 0);
    mCtx.drawImage(this.annotCanvas, 0, 0);

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
