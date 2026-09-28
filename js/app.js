/**
 * Main Application Orchestrator
 * Tab Switching, Global Drag-and-Drop, Signature Modal
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Modules
  const certEditor = new CertificateEditor();
  const pdfEditor = new PDFEditor();
  const docxEditor = new DocxEditor();
  const imageEditor = new ImageEditor();
  const sigPad = new SignaturePadModal('signature-canvas');

  // Tab Switching
  const tabs = document.querySelectorAll('.nav-tab');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function switchTab(targetTab) {
    tabs.forEach(t => {
      const isActive = t.dataset.tab === targetTab;
      t.classList.toggle('text-blue-600', isActive);
      t.classList.toggle('border-blue-600', isActive);
      t.classList.toggle('border-transparent', !isActive);
      t.classList.toggle('text-slate-500', !isActive);
    });

    tabPanels.forEach(p => {
      p.classList.toggle('hidden', p.id !== `${targetTab}-tab`);
    });
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Global File Drag & Drop Router
  window.addEventListener('dragover', (e) => e.preventDefault());
  window.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!e.dataTransfer.files.length) return;
    const file = e.dataTransfer.files[0];
    const name = file.name.toLowerCase();

    if (name.endsWith('.pdf')) {
      switchTab('pdf');
      pdfEditor.loadFile(file);
    } else if (name.endsWith('.docx') || name.endsWith('.doc')) {
      switchTab('docx');
      docxEditor.loadFile(file);
    } else if (file.type.startsWith('image/')) {
      switchTab('image');
      imageEditor.loadFile(file);
    }
  });

  // Signature Modal Controller
  let signatureTarget = 'cert'; // 'cert', 'pdf', 'docx', 'image'
  const sigModal = document.getElementById('signature-modal');

  window.openSignatureModal = function(target = 'cert') {
    signatureTarget = target;
    sigPad.clear();
    sigModal.classList.remove('hidden');
  };

  window.closeSignatureModal = function() {
    sigModal.classList.add('hidden');
  };

  window.applySignature = function() {
    if (sigPad.isEmpty()) {
      alert('Please draw a signature first.');
      return;
    }
    const dataUrl = sigPad.toDataURL();
    if (signatureTarget === 'cert') {
      certEditor.updateSignature(dataUrl);
    } else if (signatureTarget === 'pdf') {
      pdfEditor.addSignatureStamp(dataUrl);
    } else if (signatureTarget === 'docx') {
      docxEditor.insertSignature(dataUrl);
    } else if (signatureTarget === 'image') {
      imageEditor.addSignatureStamp(dataUrl);
    }
    closeSignatureModal();
  };

  // Expose global module handles
  window.app = {
    certEditor,
    pdfEditor,
    docxEditor,
    imageEditor,
    sigPad,
    switchTab
  };
});
