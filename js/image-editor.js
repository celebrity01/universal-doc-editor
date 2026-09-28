/**
 * Image & Document Scan Editor
 * Tools: Whiteout / Eraser Box, Text Overlay, Freehand Draw, Signature Stamp, Filters, PDF Export
 */

class ImageEditor {
  constructor() {
    this.canvas = document.getElementById('image-editor-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.baseImage = null;
    this.history = [];
    this.currentTool = 'select'; // 'select', 'whiteout', 'text', 'draw', 'signature'
    this.isDrawing = false;
    this.startX = 0;
    this.startY = 0;
    this.color = '#000000';
    this.fontSize = 20;
    this.rotation = 0;

    this.initEvents();
  }

  initEvents() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
    this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseup', () => this.onMouseUp());

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
    this.canvas.style.cursor = tool === 'select' ? 'default' : 'crosshair';
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
    if (this.history.length > 20) this.history.shift();
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
      const text = prompt('Enter text to stamp on image:');
      if (text) {
        this.ctx.font = `italic ${this.fontSize}px Arial, sans-serif`;
        this.ctx.fillStyle = this.color;
        this.ctx.fillText(text, pos.x, pos.y);
        this.saveState();
      }
      this.isDrawing = false;
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

      if (w > 2 && h > 2) {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(x, y, w, h);
        this.saveState();
      }
    } else if (this.currentTool === 'draw') {
      this.saveState();
    }
  }

  addSignatureStamp(dataUrl) {
    const img = new Image();
    img.onload = () => {
      const w = 180;
      const h = (180 * img.height) / img.width;
      this.ctx.drawImage(img, (this.canvas.width - w) / 2, (this.canvas.height - h) / 2, w, h);
      this.saveState();
    };
    img.src = dataUrl;
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
    const a = document.createElement('a');
    a.download = `edited_image.${format}`;
    a.href = this.canvas.toDataURL(`image/${format}`, 0.95);
    a.click();
  }

  downloadPDF() {
    const imgData = this.canvas.toDataURL('image/jpeg', 0.95);
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
      orientation: this.canvas.width > this.canvas.height ? 'l' : 'p',
      unit: 'pt',
      format: [this.canvas.width, this.canvas.height]
    });
    pdf.addImage(imgData, 'JPEG', 0, 0, this.canvas.width, this.canvas.height);
    pdf.save('edited_document.pdf');
  }
}

window.ImageEditor = ImageEditor;
