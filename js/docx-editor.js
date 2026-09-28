/**
 * Word DOCX Reader & Rich Text Editor
 * Powered by Mammoth.js & HTML5 contentEditable
 */

class DocxEditor {
  constructor() {
    this.editorContainer = document.getElementById('docx-editor-content');
    this.dropZone = document.getElementById('docx-drop-zone');
    this.initEvents();
  }

  initEvents() {
    const fileInput = document.getElementById('docx-upload-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) this.loadFile(file);
      });
    }

    if (this.dropZone) {
      this.dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.dropZone.classList.add('dragover');
      });
      this.dropZone.addEventListener('dragleave', () => this.dropZone.classList.remove('dragover'));
      this.dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        this.dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
          this.loadFile(e.dataTransfer.files[0]);
        }
      });
    }
  }

  async loadFile(file) {
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      alert('Please upload a valid Word document (.docx).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        this.editorContainer.innerHTML = result.value || '<p>Start typing here...</p>';
        this.dropZone.classList.add('hidden');
        document.getElementById('docx-editor-workspace').classList.remove('hidden');
        document.getElementById('docx-filename').textContent = file.name;
      } catch (err) {
        console.error('Mammoth DOCX parse error:', err);
        alert('Could not convert DOCX file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  execCmd(command, value = null) {
    document.execCommand(command, false, value);
    this.editorContainer.focus();
  }

  insertSignature(dataUrl) {
    this.execCmd('insertImage', dataUrl);
  }

  downloadHTML() {
    const content = this.editorContainer.innerHTML;
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Document</title></head><body>${content}</body></html>`;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  printOrSavePDF() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Document</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.6; padding: 25mm; }
          h1, h2, h3 { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          td, th { border: 1px solid #999; padding: 6px 10px; }
          img { max-width: 100%; height: auto; }
        </style>
      </head>
      <body>
        ${this.editorContainer.innerHTML}
        <script>
          window.onload = function() { window.print(); window.close(); }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  }
}

window.DocxEditor = DocxEditor;
