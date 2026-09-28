/**
 * Certificate & Form Template Editor
 */

class CertificateEditor {
  constructor() {
    this.container = document.getElementById('cert-sheet');
    this.init();
  }

  init() {
    // Add enter-key suppression and auto-select on focus for editable fields
    this.bindEditableEvents();
  }

  bindEditableEvents() {
    const fields = document.querySelectorAll('#cert-tab [contenteditable="true"]');
    fields.forEach(el => {
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          el.blur();
        }
      });
      el.addEventListener('focus', () => {
        const range = document.createRange();
        range.selectNodeContents(el);
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
    });
  }

  reset() {
    if (!confirm('Reset all certificate fields to default values?')) return;
    const fields = document.querySelectorAll('#cert-tab [contenteditable="true"]');
    fields.forEach(el => {
      el.textContent = el.dataset.default || '';
    });
  }

  updateSignature(dataUrl) {
    const sigImg = document.getElementById('cert-sig-img');
    if (sigImg) {
      sigImg.src = dataUrl;
    }
  }

  printOrSavePDF() {
    window.print();
  }
}

window.CertificateEditor = CertificateEditor;
