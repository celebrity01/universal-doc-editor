/**
 * Word DOCX & Rich Text Document Editor
 * Features:
 * - 1-Click Sample Document Loaders (Contract, Medical Report, Letter)
 * - Direct Click-to-Edit WYSIWYG with full formatting toolbar
 * - Insert Tables, Dividers, Images & Signatures
 * - Export to PDF, clean HTML, and Microsoft Word (.doc)
 */

class DocxEditor {
  constructor() {
    this.editorContainer = document.getElementById('docx-editor-content');
    this.dropZone = document.getElementById('docx-drop-zone');
    this.workspace = document.getElementById('docx-editor-workspace');
    this.floatingToolbar = document.getElementById('docx-floating-toolbar');
    this.initEvents();
    this.initFloatingToolbar();
    this.bindTableEvents();
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

    if (this.editorContainer) {
      // Table navigation and keyboard handling
      this.editorContainer.addEventListener('keydown', (e) => this.handleTableKeydown(e));

      // Cursor and selection monitoring on editor
      this.editorContainer.addEventListener('keyup', () => this.updateSelectionAndFloatingToolbar());
      this.editorContainer.addEventListener('mouseup', () => this.updateSelectionAndFloatingToolbar());
      this.editorContainer.addEventListener('input', () => this.updateSelectionAndFloatingToolbar());
      this.editorContainer.addEventListener('focus', () => this.updateSelectionAndFloatingToolbar());
    }

    // Active toolbar state synchronization on selectionchange (F14 & F15)
    document.addEventListener('selectionchange', () => this.updateSelectionAndFloatingToolbar());
  }

  async loadFile(file) {
    if (!file.name.endsWith('.docx') && !file.name.endsWith('.doc')) {
      alert('Please upload a valid Word document (.docx or .doc).');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const arrayBuffer = e.target.result;
      try {
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        this.editorContainer.innerHTML = result.value || '<p>Start typing your document here...</p>';
        this.dropZone.classList.add('hidden');
        this.workspace.classList.remove('hidden');
        document.getElementById('docx-filename').textContent = file.name;
        this.bindTableEvents();
        this.updateToolbarState();
      } catch (err) {
        console.error('Mammoth DOCX parse error:', err);
        alert('Could not convert DOCX file: ' + err.message);
      }
    };
    reader.readAsArrayBuffer(file);
  }

  loadSample(sampleType = 'contract') {
    const samples = {
      'contract': {
        title: 'sample-consulting-agreement.docx',
        content: `
          <h1 style="text-align: center; color: #1e3a8a;">INDEPENDENT PROFESSIONAL CONSULTING AGREEMENT</h1>
          <p style="text-align: center; color: #64748b; font-size: 13px;">Document Reference: AGR-2026-CONS-0914</p>
          <hr style="border: 0; border-top: 1px solid #cbd5e1; margin: 20px 0;">
          
          <p>This <strong>Consulting Services Agreement</strong> (the "Agreement") is entered into on this <strong>15th day of October, 2026</strong>, by and between:</p>
          
          <p><strong>1. CLIENT:</strong> Apex Global Health Technologies Inc., with principal address at 100 Innovation Way, Suite 400, New York, NY ("Client"), and</p>
          <p><strong>2. CONSULTANT:</strong> Dr. Michael Chen, M.D., consulting specialist ("Consultant").</p>
          
          <h2>1. Scope of Services</h2>
          <p>Consultant agrees to provide high-level clinical guidance, regulatory medical compliance review, and clinical trial documentation analysis for Client's automated diagnostic platform.</p>
          
          <h2>2. Deliverables & Schedule</h2>
          <ul>
            <li>Bi-weekly clinical safety assessment reports</li>
            <li>Regulatory submission protocol evaluation</li>
            <li>Advisory sessions with Client clinical research teams</li>
          </ul>

          <h2>3. Compensation & Invoicing</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <thead>
              <tr style="background-color: #f1f5f9;">
                <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Milestone / Phase</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Estimated Timeline</th>
                <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">Fee Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 8px;">Phase 1: Diagnostic Compliance Audit</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px;">2 Weeks</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">$4,500.00</td>
              </tr>
              <tr>
                <td style="border: 1px solid #cbd5e1; padding: 8px;">Phase 2: Protocol Documentation Validation</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px;">3 Weeks</td>
                <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">$6,000.00</td>
              </tr>
            </tbody>
          </table>

          <h2>4. Signatures of Parties</h2>
          <p>IN WITNESS WHEREOF, the authorized representatives have executed this Agreement as of the date first above written.</p>
          
          <div style="display: flex; justify-content: space-between; margin-top: 40px;">
            <div style="width: 45%;">
              <p><strong>CLIENT:</strong></p>
              <div style="border-bottom: 1.5px solid #000; height: 50px; margin-bottom: 6px;"></div>
              <p>Authorized Signature: <em>Elena Rostova</em></p>
            </div>
            <div style="width: 45%;">
              <p><strong>CONSULTANT:</strong></p>
              <div style="border-bottom: 1.5px solid #000; height: 50px; margin-bottom: 6px;"></div>
              <p>Authorized Signature: <em>Dr. Michael Chen</em></p>
            </div>
          </div>
        `
      },
      'medical': {
        title: 'sample-clinical-referral.docx',
        content: `
          <h1 style="color: #0f766e; text-align: center;">CLINICAL SPECIALIST REFERRAL LETTER</h1>
          <p style="text-align: center; color: #64748b;">Harbor Specialist Medical Centre | Referral Unit</p>
          <hr style="margin: 20px 0;">

          <p><strong>To:</strong> Department of Cardiology & Internal Medicine, St. Jude's Hospital<br>
          <strong>From:</strong> Dr. Nneka Okafor, Consultant Family Physician<br>
          <strong>Date:</strong> October 20, 2026<br>
          <strong>Re:</strong> Clinical Consultation & Assessment for Patient <strong>Aisha Bello (DOB: 12/04/1997)</strong></p>

          <h2>Dear Colleague,</h2>
          <p>Thank you for seeing this pleasant 29-year-old female who presented to our clinic with recurrent episodes of exertional palpitation, occasional dyspnea on moderate exertion, and lightheadedness over the past six weeks.</p>

          <h2>Clinical Examination Findings</h2>
          <ul>
            <li><strong>Blood Pressure:</strong> 132/84 mmHg (Sitting)</li>
            <li><strong>Pulse Rate:</strong> 88 bpm regular, normal volume</li>
            <li><strong>Cardiovascular:</strong> S1, S2 audible, no murmurs detected</li>
            <li><strong>Respiratory:</strong> Vesicular breath sounds bilaterally, clear lung fields</li>
          </ul>

          <h2>Investigations Conducted</h2>
          <p>Resting 12-lead ECG demonstrated sinus rhythm with occasional benign premature atrial contractions. Full Blood Count, Thyroid Function Panel, and Electrolytes were within normal clinical limits.</p>

          <p>I would be grateful for your expert specialist evaluation and would appreciate an echocardiogram to rule out any structural heart pathology. Please feel free to contact me if further background information is required.</p>

          <p style="margin-top: 40px;">Warm regards,</p>
          <p><strong>Dr. Nneka Okafor, FWACS, MBBS</strong><br>
          Consultant Physician | Reg: MDCN-2015-77291</p>
        `
      },
      'letter': {
        title: 'sample-employment-verification.docx',
        content: `
          <h1 style="color: #1e3a8a; text-align: center;">OFFICIAL EMPLOYMENT VERIFICATION LETTER</h1>
          <p style="text-align: center; color: #64748b;">Global Tech Solutions Corp. | Human Resources Department</p>
          <hr style="margin: 20px 0;">

          <p><strong>Date:</strong> October 28, 2026</p>
          <p><strong>To Whom It May Concern,</strong></p>

          <p>This letter is to officially confirm that <strong>Mr. David Adeleke</strong> has been employed with Global Tech Solutions Corp. on a full-time, permanent basis since <strong>March 1, 2022</strong>.</p>

          <h2>Employment Details:</h2>
          <ul>
            <li><strong>Job Title:</strong> Senior Systems Engineer & Technical Lead</li>
            <li><strong>Department:</strong> Cloud Infrastructure & Operations</li>
            <li><strong>Current Employment Status:</strong> Active & in Good Standing</li>
            <li><strong>Base Annual Remuneration:</strong> $115,000.00 USD</li>
          </ul>

          <p>Mr. Adeleke is a highly valued and dependable member of our technical staff. This letter is issued upon the request of the employee for administrative, tenancy, or financial clearance purposes without liability to the company.</p>

          <p>Should you require any additional information or further clarification, please do not hesitate to contact our Human Resources Office at <strong>hr@globaltechsolutions.example.com</strong> or call +1 (800) 555-0144.</p>

          <div style="margin-top: 50px;">
            <p>Sincerely,</p>
            <p><strong>Victoria Sterling</strong><br>
            Vice President of People & Talent<br>
            Global Tech Solutions Corp.</p>
          </div>
        `
      }
    };

    const doc = samples[sampleType] || samples['contract'];
    this.editorContainer.innerHTML = doc.content;
    this.dropZone.classList.add('hidden');
    this.workspace.classList.remove('hidden');
    document.getElementById('docx-filename').textContent = doc.title;
    this.bindTableEvents();
    this.updateToolbarState();
  }

  execCmd(command, value = null) {
    document.execCommand(command, false, value);
    if (this.editorContainer) this.editorContainer.focus();
    this.updateToolbarState();
  }

  initFloatingToolbar() {
    let toolbar = document.getElementById('docx-floating-toolbar');
    if (!toolbar) {
      toolbar = document.createElement('div');
      toolbar.id = 'docx-floating-toolbar';
      toolbar.className = 'docx-floating-toolbar hidden';
      toolbar.innerHTML = `
        <button type="button" data-cmd="bold" title="Bold"><b>B</b></button>
        <button type="button" data-cmd="italic" title="Italic"><i>I</i></button>
        <button type="button" data-cmd="underline" title="Underline"><u>U</u></button>
        <button type="button" data-cmd="formatBlock" data-val="h1" title="Heading 1">H1</button>
        <button type="button" data-cmd="formatBlock" data-val="h2" title="Heading 2">H2</button>
        <button type="button" data-cmd="removeFormat" title="Clear Formatting">✕</button>
      `;
      const target = this.workspace || document.body;
      target.appendChild(toolbar);
    }
    this.floatingToolbar = toolbar;

    // Prevent editor selection loss on mousedown
    toolbar.addEventListener('mousedown', (e) => {
      e.preventDefault();
    });

    const buttons = toolbar.querySelectorAll('button');
    buttons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const cmd = btn.getAttribute('data-cmd') || 'bold';
        const val = btn.getAttribute('data-val');
        if (cmd === 'formatBlock') {
          this.execCmd('formatBlock', val ? `<${val}>` : '<h1>');
        } else {
          this.execCmd(cmd, val || null);
        }
        this.updateToolbarState();
      });
    });
  }

  updateSelectionAndFloatingToolbar() {
    this.updateToolbarState();

    const floating = this.floatingToolbar || document.getElementById('docx-floating-toolbar');
    if (!floating) return;

    if (!window.getSelection) {
      floating.classList.add('hidden');
      floating.style.display = 'none';
      return;
    }

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) {
      floating.classList.add('hidden');
      floating.style.display = 'none';
      return;
    }

    const text = typeof sel.toString === 'function' ? sel.toString().trim() : '';
    if (!text || sel.isCollapsed === true) {
      floating.classList.add('hidden');
      floating.style.display = 'none';
      return;
    }

    // Verify selection is within editor container
    let isInside = false;
    try {
      const range = sel.getRangeAt(0);
      let container = range.commonAncestorContainer || range.startContainer;
      if (container && container.nodeType === 3) container = container.parentElement;
      if (container && this.editorContainer) {
        if (this.editorContainer === container || (this.editorContainer.contains && this.editorContainer.contains(container))) {
          isInside = true;
        } else if (container.closest && container.closest('#docx-editor-content')) {
          isInside = true;
        }
      }
    } catch (_) {
      isInside = true;
    }

    if (!isInside) {
      floating.classList.add('hidden');
      floating.style.display = 'none';
      return;
    }

    // Show floating toolbar and position near selection
    floating.classList.remove('hidden');
    floating.style.display = 'flex';

    try {
      const range = sel.getRangeAt(0);
      if (range && typeof range.getBoundingClientRect === 'function') {
        const rect = range.getBoundingClientRect();
        if (rect && rect.top !== undefined) {
          const top = Math.max(10, rect.top - 46 + (window.scrollY || 0));
          const left = Math.max(10, rect.left + ((rect.width || 0) / 2) - 100 + (window.scrollX || 0));
          floating.style.top = `${top}px`;
          floating.style.left = `${left}px`;
        }
      }
    } catch (_) {}
  }

  updateToolbarState() {
    let blockTag = '';
    try {
      const val = document.queryCommandValue('formatBlock');
      if (val) blockTag = String(val).toLowerCase().replace(/[<>]/g, '');
    } catch (_) {}

    if (!blockTag && window.getSelection) {
      try {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          let node = range.commonAncestorContainer || range.startContainer;
          if (node && node.nodeType === 3) node = node.parentElement;
          if (node && typeof node.closest === 'function') {
            const block = node.closest('h1, h2, h3, p');
            if (block) blockTag = block.tagName.toLowerCase();
          } else if (node && node.tagName) {
            blockTag = node.tagName.toLowerCase();
          }
        }
      } catch (_) {}
    }

    const checkCmd = (cmd) => {
      try {
        return !!document.queryCommandState(cmd);
      } catch (_) {
        return false;
      }
    };

    const isBold = checkCmd('bold');
    const isItalic = checkCmd('italic');
    const isUnderline = checkCmd('underline');
    const isStrike = checkCmd('strikeThrough');
    const isUl = checkCmd('insertUnorderedList');
    const isOl = checkCmd('insertOrderedList');
    const isLeft = checkCmd('justifyLeft');
    const isCenter = checkCmd('justifyCenter');
    const isRight = checkCmd('justifyRight');

    const buttons = document.querySelectorAll('#docx-editor-workspace button, #docx-floating-toolbar button');
    buttons.forEach((btn) => {
      const cmd = (btn.getAttribute('data-cmd') || '').toLowerCase();
      const val = (btn.getAttribute('data-val') || '').toLowerCase();
      const title = (btn.getAttribute('title') || '').toLowerCase();
      const text = (btn.textContent || '').trim().toLowerCase();

      let active = false;
      if (cmd === 'bold' || title === 'bold' || text === 'b') {
        active = isBold;
      } else if (cmd === 'italic' || title === 'italic' || text === 'i') {
        active = isItalic;
      } else if (cmd === 'underline' || title === 'underline' || text === 'u') {
        active = isUnderline;
      } else if (cmd === 'strikethrough' || title === 'strikethrough' || text === 's') {
        active = isStrike;
      } else if (cmd === 'insertunorderedlist' || title.includes('bullet')) {
        active = isUl;
      } else if (cmd === 'insertorderedlist' || title.includes('number')) {
        active = isOl;
      } else if (cmd === 'justifyleft' || title.includes('align left')) {
        active = isLeft;
      } else if (cmd === 'justifycenter' || title.includes('align center')) {
        active = isCenter;
      } else if (cmd === 'justifyright' || title.includes('align right')) {
        active = isRight;
      } else if ((cmd === 'formatblock' && val === 'h1') || cmd === 'h1' || text === 'h1' || title.includes('heading 1')) {
        active = (blockTag === 'h1') || checkCmd('h1');
      } else if ((cmd === 'formatblock' && val === 'h2') || cmd === 'h2' || text === 'h2' || title.includes('heading 2')) {
        active = (blockTag === 'h2') || checkCmd('h2');
      } else if ((cmd === 'formatblock' && val === 'p') || cmd === 'p' || text === 'p') {
        active = (blockTag === 'p') || checkCmd('p');
      }

      if (active) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  handleTableKeydown(e) {
    if (e.key !== 'Tab') return;

    let cell = null;
    if (e.target && typeof e.target.closest === 'function') {
      cell = e.target.closest('td, th');
    }
    if (!cell && window.getSelection) {
      try {
        const sel = window.getSelection();
        if (sel && sel.rangeCount > 0) {
          const node = sel.getRangeAt(0).startContainer;
          if (node) {
            cell = typeof node.closest === 'function' ? node.closest('td, th') : (node.parentElement && typeof node.parentElement.closest === 'function' ? node.parentElement.closest('td, th') : null);
          }
        }
      } catch (_) {}
    }

    if (!cell) return;

    e.preventDefault();
    const table = cell.closest('table');
    if (!table) return;

    const allCells = Array.from(table.querySelectorAll('td, th'));
    const currentIndex = allCells.indexOf(cell);
    if (currentIndex === -1) return;

    if (e.shiftKey) {
      // Shift+Tab: Navigate to previous cell
      if (currentIndex > 0) {
        const prevCell = allCells[currentIndex - 1];
        prevCell.focus();
        this.moveCaretToEnd(prevCell);
      }
      // If currentIndex === 0, stay within table bounds on first cell
    } else {
      // Tab: Navigate to next cell or append new row on last cell (F16, T1.23, T2.16)
      if (currentIndex < allCells.length - 1) {
        const nextCell = allCells[currentIndex + 1];
        nextCell.focus();
        this.moveCaretToEnd(nextCell);
      } else {
        // Last cell in table! Append new row
        const tr = cell.closest('tr');
        const colCount = tr && tr.children && tr.children.length > 0
          ? tr.children.length
          : (table.querySelector('tr') ? table.querySelector('tr').children.length : 3);
        const tbody = table.querySelector('tbody') || table;
        const newRow = document.createElement('tr');
        for (let i = 0; i < colCount; i++) {
          const newCell = document.createElement('td');
          newCell.style.border = '1px solid #cbd5e1';
          newCell.style.padding = '8px';
          newCell.textContent = '';
          newRow.appendChild(newCell);
        }
        tbody.appendChild(newRow);
        this.bindTableEvents();
        const firstNewCell = newRow.querySelector('td') || newRow.children[0];
        if (firstNewCell) {
          firstNewCell.focus();
          this.moveCaretToEnd(firstNewCell);
        }
      }
    }
  }

  bindTableEvents() {
    if (!this.editorContainer) return;
    const tables = this.editorContainer.querySelectorAll('table');
    tables.forEach((table) => {
      const cells = table.querySelectorAll('td, th');
      cells.forEach((cell) => {
        if (!cell._docxKeydownBound) {
          cell._docxKeydownBound = true;
          cell.addEventListener('keydown', (e) => this.handleTableKeydown(e));
        }
      });
      if (!table._docxKeydownBound) {
        table._docxKeydownBound = true;
        table.addEventListener('keydown', (e) => this.handleTableKeydown(e));
      }
    });
  }

  moveCaretToEnd(el) {
    if (!el) return;
    try {
      if (typeof window.getSelection === 'function' && typeof document.createRange === 'function') {
        const range = document.createRange();
        range.selectNodeContents(el);
        range.collapse(false);
        const sel = window.getSelection();
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
      }
    } catch (_) {}
  }

  insertTable() {
    const tableHtml = `
      <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
        <thead>
          <tr style="background-color: #f8fafc;">
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: left;">Item</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">Quantity</th>
            <th style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="border: 1px solid #cbd5e1; padding: 8px;">Sample Description</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: center;">1</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px; text-align: right;">$100.00</td>
          </tr>
        </tbody>
      </table>
    `;
    this.execCmd('insertHTML', tableHtml);
    this.bindTableEvents();
  }

  insertSignature(dataUrl) {
    const imgHtml = `<img src="${dataUrl}" alt="Digital Signature" style="max-height: 70px; width: auto; display: inline-block; vertical-align: middle;">`;
    this.execCmd('insertHTML', imgHtml);
  }

  downloadHTML() {
    const content = this.editorContainer.innerHTML;
    const fullHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Document</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; line-height: 1.6; max-width: 800px; margin: 40px auto; padding: 0 20px; color: #1e293b; }
          table { width: 100%; border-collapse: collapse; margin: 16px 0; }
          td, th { border: 1px solid #cbd5e1; padding: 8px; }
          th { background: #f8fafc; }
        </style>
      </head>
      <body>
        ${content}
      </body>
      </html>
    `;
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = document.getElementById('docx-filename').textContent.replace('.docx', '.html') || 'document.html';
    a.click();
    URL.revokeObjectURL(url);
  }

  downloadDoc() {
    // Export as MS Word compatible HTML .doc format
    const content = this.editorContainer.innerHTML;
    const header = `<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><title>Exported Document</title>
      <style>body { font-family: 'Times New Roman', serif; font-size: 12pt; }</style>
      </head><body>`;
    const footer = `</body></html>`;
    const sourceHTML = header + content + footer;

    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    fileDownload.href = source;
    fileDownload.download = (document.getElementById('docx-filename').textContent || 'document').replace(/\.(html|docx)$/, '') + '.doc';
    fileDownload.click();
  }

  printOrSavePDF() {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Document</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 13pt; line-height: 1.6; padding: 25mm; }
          h1 { font-size: 22pt; margin-bottom: 12pt; font-family: Arial, sans-serif; }
          h2 { font-size: 16pt; margin-top: 14pt; margin-bottom: 8pt; font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
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
