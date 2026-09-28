/**
 * Main Application Orchestrator
 * Tab Switching, Global Drag-and-Drop, Signature Modal (Draw/Type), and Sample Loaders
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Sub-Modules
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
      t.classList.toggle('active', isActive);
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
  const drawTabBtn = document.getElementById('sig-tab-draw');
  const typeTabBtn = document.getElementById('sig-tab-type');
  const drawPanel = document.getElementById('sig-panel-draw');
  const typePanel = document.getElementById('sig-panel-type');
  const typeInput = document.getElementById('sig-type-input');
  const typeFontSelect = document.getElementById('sig-font-select');

  window.openSignatureModal = function(target = 'cert') {
    signatureTarget = target;
    sigPad.clear();
    if (typeInput) typeInput.value = '';
    sigModal.classList.remove('hidden');
    setSigMode('draw');
  };

  window.closeSignatureModal = function() {
    sigModal.classList.add('hidden');
  };

  function setSigMode(mode) {
    sigPad.setMode(mode);
    if (drawTabBtn && typeTabBtn) {
      drawTabBtn.classList.toggle('active', mode === 'draw');
      typeTabBtn.classList.toggle('active', mode === 'type');
    }
    if (drawPanel && typePanel) {
      drawPanel.classList.toggle('hidden', mode !== 'draw');
      typePanel.classList.toggle('hidden', mode !== 'type');
    }
  }

  if (drawTabBtn) drawTabBtn.addEventListener('click', () => setSigMode('draw'));
  if (typeTabBtn) typeTabBtn.addEventListener('click', () => {
    setSigMode('type');
    if (typeInput) {
      typeInput.focus();
      if (!typeInput.value) {
        typeInput.value = 'Dr. Aisha Bello';
        sigPad.setTypedName(typeInput.value);
      }
    }
  });

  if (typeInput) {
    typeInput.addEventListener('input', (e) => {
      sigPad.setTypedName(e.target.value);
    });
  }

  if (typeFontSelect) {
    typeFontSelect.addEventListener('change', (e) => {
      sigPad.setTypedFont(e.target.value);
    });
  }

  // Color selection in signature modal
  document.querySelectorAll('.sig-color-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const color = btn.dataset.color;
      sigPad.setColor(color);
      document.querySelectorAll('.sig-color-btn').forEach(b => b.classList.remove('ring-2', 'ring-blue-500'));
      btn.classList.add('ring-2', 'ring-blue-500');
    });
  });

  window.applySignature = function() {
    if (sigPad.isEmpty()) {
      alert('Please draw or type your signature before applying.');
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

  // Expose global handles
  window.app = {
    certEditor,
    pdfEditor,
    docxEditor,
    imageEditor,
    sigPad,
    switchTab
  };
});
