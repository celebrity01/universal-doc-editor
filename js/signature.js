/**
 * Signature Pad & Type-to-Sign Manager
 * Supports freehand drawing, typed cursive signatures, custom colors, and instant stamping
 */

class SignaturePadModal {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.mode = 'draw'; // 'draw' or 'type'
    this.isDrawing = false;
    this.color = '#1e3a8a'; // default elegant blue ink
    this.lineWidth = 2.5;
    this.typedName = '';
    this.typedFont = 'Dancing Script';
    
    if (this.canvas) {
      this.init();
    }
  }

  init() {
    this.canvas.width = 460;
    this.canvas.height = 180;
    this.clear();

    // Mouse Events
    this.canvas.addEventListener('mousedown', (e) => this.startDraw(e));
    this.canvas.addEventListener('mousemove', (e) => this.draw(e));
    window.addEventListener('mouseup', () => this.stopDraw());

    // Touch Events
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousedown', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    }, { passive: false });

    this.canvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const mouseEvent = new MouseEvent('mousemove', {
        clientX: touch.clientX,
        clientY: touch.clientY
      });
      this.canvas.dispatchEvent(mouseEvent);
    }, { passive: false });

    this.canvas.addEventListener('touchend', () => {
      window.dispatchEvent(new MouseEvent('mouseup', {}));
    });
  }

  getPos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) * (this.canvas.width / rect.width),
      y: (e.clientY - rect.top) * (this.canvas.height / rect.height)
    };
  }

  startDraw(e) {
    if (this.mode !== 'draw') return;
    this.isDrawing = true;
    const pos = this.getPos(e);
    this.ctx.beginPath();
    this.ctx.moveTo(pos.x, pos.y);
  }

  draw(e) {
    if (!this.isDrawing || this.mode !== 'draw') return;
    const pos = this.getPos(e);
    this.ctx.strokeStyle = this.color;
    this.ctx.lineWidth = this.lineWidth;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.lineTo(pos.x, pos.y);
    this.ctx.stroke();
  }

  stopDraw() {
    this.isDrawing = false;
  }

  clear() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  setColor(c) {
    this.color = c;
    if (this.mode === 'type') {
      this.renderTyped();
    }
  }

  setLineWidth(w) {
    this.lineWidth = parseFloat(w);
  }

  setMode(mode) {
    this.mode = mode;
    this.clear();
    if (mode === 'type') {
      this.renderTyped();
    }
  }

  setTypedName(name) {
    this.typedName = name;
    this.renderTyped();
  }

  setTypedFont(font) {
    this.typedFont = font;
    this.renderTyped();
  }

  renderTyped() {
    this.clear();
    const text = this.typedName || 'Sign Here';
    this.ctx.font = `60px "${this.typedFont}", cursive`;
    this.ctx.fillStyle = this.color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText(text, this.canvas.width / 2, this.canvas.height / 2);
  }

  isEmpty() {
    if (this.mode === 'type') {
      return !this.typedName.trim();
    }
    const pixelBuffer = new Uint32Array(
      this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data.buffer
    );
    return !pixelBuffer.some(color => color !== 0);
  }

  toDataURL() {
    return this.canvas.toDataURL('image/png');
  }
}

window.SignaturePadModal = SignaturePadModal;
