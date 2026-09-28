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
  }

  execCmd(command, value = null) {
    document.execCommand(command, false, value);
    this.editorContainer.focus();
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
