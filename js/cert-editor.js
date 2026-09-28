/**
 * Universal Certificate, Form & Template Editor
 * Features:
 * - 5+ Professional ready-to-use Sample Templates
 * - Direct Click-to-Edit on every text, title, date, and cell
 * - Sample data autofill & reset
 * - Interactive logo changer & signature stamping
 * - Print & Save to PDF
 */

class CertificateEditor {
  constructor() {
    this.container = document.getElementById('cert-sheet');
    this.templateSelector = document.getElementById('cert-template-select');
    this.currentTemplate = 'medical-cert';
    this.init();
  }

  init() {
    this.renderTemplate(this.currentTemplate);
    this.bindEvents();
  }

  bindEvents() {
    if (this.templateSelector) {
      this.templateSelector.addEventListener('change', (e) => {
        this.setTemplate(e.target.value);
      });
    }

    const logoInput = document.getElementById('cert-logo-input');
    if (logoInput) {
      logoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            const logoImg = document.getElementById('cert-logo-img');
            if (logoImg) logoImg.src = ev.target.result;
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  setTemplate(templateKey) {
    this.currentTemplate = templateKey;
    this.renderTemplate(templateKey);
  }

  renderTemplate(key) {
    if (!this.container) return;
    const templates = this.getTemplates();
    const tpl = templates[key] || templates['medical-cert'];
    this.container.innerHTML = tpl.html;
    this.bindEditableEvents();
  }

  bindEditableEvents() {
    const editables = this.container.querySelectorAll('[contenteditable="true"]');
    editables.forEach(el => {
      el.setAttribute('spellcheck', 'false');

      // Auto-select on focus for all editable elements (decoupled from mouseup collapse)
      let isFocusing = false;
      el.addEventListener('focus', () => {
        isFocusing = true;
        setTimeout(() => {
          try {
            const range = document.createRange();
            range.selectNodeContents(el);
            const sel = window.getSelection();
            if (sel) {
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } catch (err) {
            // ignore range selection errors if element unmounted
          }
          isFocusing = false;
        }, 10);
      });

      // Prevent mouseup from immediately collapsing the selection when focus was just triggered
      el.addEventListener('mouseup', (e) => {
        if (isFocusing) {
          e.preventDefault();
        }
      });

      // Enter key creates newline in blocks, but finishes edit in short fields
      el.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !el.classList.contains('editable-block')) {
          e.preventDefault();
          el.blur();
        }
      });
    });
  }

  reset() {
    if (!confirm('Reset all fields in this template to sample defaults?')) return;
    this.renderTemplate(this.currentTemplate);
  }

  fillRandomSample() {
    const samples = [
      {
        patient: 'Michael Chen',
        age: '34',
        day: '18',
        month: 'November',
        year: '2026',
        from: '18/11/2026',
        to: '25/11/2026',
        doctor: 'Dr. Marcus Vance, M.D.',
        condition: 'acute bronchitis with persistent coughing and fatigue'
      },
      {
        patient: 'Sarah Jenkins',
        age: '42',
        day: '04',
        month: 'December',
        year: '2026',
        from: '04/12/2026',
        to: '10/12/2026',
        doctor: 'Dr. Elena Rostova, M.D.',
        condition: 'severe migraine accompanied by visual disturbances and sensory exhaustion'
      },
      {
        patient: 'David Adeleke',
        age: '28',
        day: '15',
        month: 'October',
        year: '2026',
        from: '15/10/2026',
        to: '22/10/2026',
        doctor: 'Dr. Nneka Okafor, FWACS',
        condition: 'lumbar strain and spinal discomfort necessitating bed rest and physical therapy'
      }
    ];

    const pick = samples[Math.floor(Math.random() * samples.length)];

    const patEl = this.container.querySelector('[data-field="patient"]');
    if (patEl) patEl.textContent = pick.patient;

    const ageEl = this.container.querySelector('[data-field="age"]');
    if (ageEl) ageEl.textContent = pick.age;

    const dayEl = this.container.querySelector('[data-field="day"]');
    if (dayEl) dayEl.textContent = pick.day;

    const monthEl = this.container.querySelector('[data-field="month"]');
    if (monthEl) monthEl.textContent = pick.month;

    const yearEl = this.container.querySelector('[data-field="year"]');
    if (yearEl) yearEl.textContent = pick.year;

    const fromEl = this.container.querySelector('[data-field="from"]');
    if (fromEl) fromEl.textContent = pick.from;

    const toEl = this.container.querySelector('[data-field="to"]');
    if (toEl) toEl.textContent = pick.to;

    const docEl = this.container.querySelector('[data-field="doctor"]');
    if (docEl) docEl.textContent = pick.doctor;

    const condEl = this.container.querySelector('[data-field="condition"]');
    if (condEl) condEl.textContent = pick.condition;
  }

  updateSignature(dataUrl) {
    const sigImg = this.container.querySelector('.cert-sig-img');
    if (sigImg) {
      sigImg.src = dataUrl;
    }
  }

  printOrSavePDF() {
    window.print();
  }

  getTemplates() {
    return {
      'medical-cert': {
        name: 'Medical Certificate (Sick Leave)',
        html: `
        <!-- Medical Certificate Template -->
        <div class="relative p-8 sm:p-12 text-slate-900 leading-relaxed font-sans">
          
          <!-- Clinic Header -->
          <div class="flex items-start justify-between border-b-2 border-blue-600 pb-6 mb-8">
            <div class="flex items-start gap-4">
              <div class="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-3xl font-black shadow-md flex-shrink-0">
                <i class="fa-solid fa-staff-snake"></i>
              </div>
              <div>
                <h2 class="text-2xl font-black tracking-tight text-slate-900 editable-block" contenteditable="true">HARBOR CARE CLINIC & SPECIALIST HOSPITAL</h2>
                <div class="text-xs text-slate-600 space-y-0.5 mt-1.5 editable-block" contenteditable="true">
                  <p>14 Palm Grove Avenue, Lekki Phase 1, Lagos, Nigeria</p>
                  <p>Tel: +234 (0) 802 444 9001 | Emergencies: 0800-HARBOR</p>
                  <p>Email: appointments@harborcareclinic.com | Web: www.harborcareclinic.com</p>
                </div>
              </div>
            </div>
            <div class="text-right text-xs text-slate-500">
              <div class="font-bold text-slate-700 uppercase tracking-wider editable-block" contenteditable="true">Ref No:</div>
              <div class="editable-field font-mono font-semibold" contenteditable="true">HC-2026-MED-8491</div>
            </div>
          </div>

          <!-- Document Title -->
          <div class="text-center my-8">
            <h1 class="text-xl sm:text-2xl font-extrabold uppercase tracking-widest text-blue-700 underline underline-offset-8 editable-block" contenteditable="true">
              OFFICIAL MEDICAL CERTIFICATE
            </h1>
            <p class="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-2 editable-block" contenteditable="true">CONFIDENTIAL MEDICAL REPORT</p>
          </div>

          <!-- Salutation -->
          <div class="font-bold text-sm mb-6 text-slate-800 uppercase tracking-wide editable-block" contenteditable="true">
            TO WHOM IT MAY CONCERN,
          </div>

          <!-- Certificate Body -->
          <div class="text-base leading-loose text-slate-800 space-y-4">
            <p>
              <span class="editable-block" contenteditable="true">This is to formally certify that Mr. / Mrs. / Ms.</span> 
              <span class="editable-field handwritten min-w-[280px] font-bold text-lg" contenteditable="true" data-field="patient">Aisha Bello</span><span class="editable-block" contenteditable="true">, aged</span> 
              <span class="editable-field handwritten min-w-[40px] text-center font-bold text-lg" contenteditable="true" data-field="age">29</span> 
              <span class="editable-block" contenteditable="true">years, was professionally examined and received clinical care at this medical facility on the</span> 
              <span class="editable-field handwritten min-w-[40px] text-center font-bold text-lg" contenteditable="true" data-field="day">12th</span> 
              <span class="editable-block" contenteditable="true">day of</span> 
              <span class="editable-field handwritten min-w-[100px] text-center font-bold text-lg" contenteditable="true" data-field="month">October</span><span class="editable-block" contenteditable="true">,</span> 
              <span class="editable-field handwritten min-w-[60px] text-center font-bold text-lg" contenteditable="true" data-field="year">2026</span><span class="editable-block" contenteditable="true">.</span>
            </p>

            <p>
              <span class="editable-block" contenteditable="true">Following thorough diagnostic tests and physical evaluation, the above patient was diagnosed with</span> 
              <span class="editable-field min-w-[360px] font-semibold text-slate-900 border-b-2 border-slate-700" contenteditable="true" data-field="condition">severe acute respiratory tract infection with asthmatic exacerbation</span><span class="editable-block" contenteditable="true">, which renders the individual physically incapacitated from attending employment or academic duties.</span>
            </p>

            <p>
              <span class="editable-block" contenteditable="true">In order to achieve full medical rehabilitation, the patient has been strictly advised to observe complete rest and adhere to clinical medication from</span> 
              <span class="editable-field handwritten min-w-[120px] text-center font-bold" contenteditable="true" data-field="from">12/10/2026</span> 
              <span class="editable-block" contenteditable="true">up to and including</span> 
              <span class="editable-field handwritten min-w-[120px] text-center font-bold" contenteditable="true" data-field="to">19/10/2026</span><span class="editable-block" contenteditable="true">.</span>
            </p>

            <p class="editable-block" contenteditable="true">
              The patient is scheduled for a follow-up review prior to resuming work/academic duties. Please accord the patient all necessary medical dispensation.
            </p>
          </div>

          <!-- Doctor & Signature Footer -->
          <div class="flex items-end justify-between mt-16 pt-6 border-t border-slate-200">
            <div>
              <div class="text-xs uppercase tracking-wider text-slate-500 font-bold mb-1 editable-block" contenteditable="true">Attending Physician:</div>
              <div class="editable-field text-base font-bold text-slate-900 min-w-[200px]" contenteditable="true" data-field="doctor">Dr. Nneka Okafor, FWACS</div>
              <div class="text-xs text-slate-600 mt-1 editable-block" contenteditable="true">MD, Consultant Family Physician</div>
              <div class="text-xs text-slate-500 font-mono mt-0.5 editable-block" contenteditable="true">Lic. Reg: MDCN-2015-77291</div>
            </div>

            <!-- Signature & Stamp -->
            <div class="text-center relative">
              <div class="w-48 h-16 relative flex items-center justify-center cursor-pointer group" onclick="openSignatureModal('cert')" title="Click to change signature">
                <img src="assets/signature.png" alt="Signature" class="cert-sig-img max-h-16 w-auto object-contain select-none">
                <span class="no-print absolute inset-0 bg-blue-500/10 rounded border border-blue-400 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold text-blue-700 transition-opacity">
                  <i class="fa-solid fa-pen mr-1"></i> Edit Sign
                </span>
              </div>
              <div class="w-48 border-b-2 border-slate-900 mt-1"></div>
              <div class="text-xs uppercase tracking-wider text-slate-700 font-bold mt-1.5 editable-block" contenteditable="true">Official Signature & Stamp</div>
            </div>
          </div>

        </div>
        `
      },
      'fitness-clearance': {
        name: 'Certificate of Fitness & Health Clearance',
        html: `
        <!-- Fitness Clearance Template -->
        <div class="relative p-8 sm:p-12 text-slate-900 leading-relaxed font-sans">
          
          <div class="flex items-center justify-between border-b-2 border-emerald-600 pb-5 mb-8">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-full bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                <i class="fa-solid fa-heart-pulse"></i>
              </div>
              <div>
                <h2 class="text-2xl font-black text-slate-900 tracking-tight editable-block" contenteditable="true">METROPOLITAN OCCUPATIONAL HEALTH CENTRE</h2>
                <p class="text-xs text-slate-500 editable-block" contenteditable="true">45 Health Plaza, Victoria Island | Tel: +234 1 890 2233 | health@metroclearance.org</p>
              </div>
            </div>
            <div class="text-right">
              <span class="inline-block bg-emerald-100 text-emerald-800 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider editable-block" contenteditable="true">FIT FOR DUTY</span>
            </div>
          </div>

          <div class="text-center my-6">
            <h1 class="text-xl sm:text-2xl font-extrabold uppercase tracking-wider text-emerald-800 underline underline-offset-4 editable-block" contenteditable="true">
              CERTIFICATE OF MEDICAL FITNESS & CLEARANCE
            </h1>
          </div>

          <div class="space-y-4 text-sm sm:text-base leading-relaxed text-slate-800">
            <p class="editable-block" contenteditable="true">
              I hereby certify that I have conducted a comprehensive clinical examination and laboratory screening of:
            </p>
            <div class="bg-slate-50 p-4 rounded-lg border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div><strong class="text-slate-600 editable-field" contenteditable="true">Candidate Name:</strong> <span class="editable-field font-bold text-slate-900" contenteditable="true" data-field="patient">Ibrahim Adeleke</span></div>
              <div><strong class="text-slate-600 editable-field" contenteditable="true">Identification No:</strong> <span class="editable-field font-mono font-semibold" contenteditable="true">NIN-893049102</span></div>
              <div><strong class="text-slate-600 editable-field" contenteditable="true">Date of Birth / Age:</strong> <span class="editable-field font-semibold" contenteditable="true" data-field="age">14 May 1995 (31 yrs)</span></div>
              <div><strong class="text-slate-600 editable-field" contenteditable="true">Blood Pressure & Pulse:</strong> <span class="editable-field font-semibold" contenteditable="true">118/78 mmHg | 72 bpm</span></div>
              <div><strong class="text-slate-600 editable-field" contenteditable="true">Visual Acuity:</strong> <span class="editable-field font-semibold" contenteditable="true">6/6 Both Eyes (Normal)</span></div>
              <div><strong class="text-slate-600 editable-field" contenteditable="true">Chest X-Ray / ECG:</strong> <span class="editable-field font-semibold" contenteditable="true">Clear / Sinus Rhythm</span></div>
            </div>

            <p class="pt-2">
              <span class="editable-block" contenteditable="true">Based on the clinical assessment, findings, and lab results, I certify that the candidate is in</span> 
              <strong class="text-emerald-700 editable-field" contenteditable="true">SOUND PHYSICAL AND MENTAL HEALTH</strong><span class="editable-block" contenteditable="true">, free from contagious or chronic disabling illnesses, and is deemed</span> 
              <span class="editable-field min-w-[220px] font-bold text-emerald-800 underline" contenteditable="true">MEDICALLY FIT FOR EMPLOYMENT & TRAVEL</span><span class="editable-block" contenteditable="true">.</span>
            </p>
          </div>

          <div class="flex items-end justify-between mt-16 pt-6 border-t border-slate-200">
            <div>
              <div class="text-xs text-slate-500 font-bold uppercase editable-block" contenteditable="true">Authorized Medical Examiner:</div>
              <div class="editable-field text-base font-bold text-slate-900 mt-1" contenteditable="true" data-field="doctor">Dr. Emmanuel Davies, MBBS, FMCP</div>
              <div class="text-xs text-slate-500 editable-block" contenteditable="true">Director of Occupational Health Services</div>
            </div>

            <div class="text-center">
              <div class="w-48 h-16 relative flex items-center justify-center cursor-pointer group" onclick="openSignatureModal('cert')">
                <img src="assets/signature.png" alt="Signature" class="cert-sig-img max-h-16 w-auto object-contain">
              </div>
              <div class="w-48 border-b-2 border-slate-800"></div>
              <div class="text-xs uppercase text-slate-700 font-bold mt-1 editable-block" contenteditable="true">Medical Seal & Signature</div>
            </div>
          </div>

        </div>
        `
      },
      'consulting-invoice': {
        name: 'Professional Consulting / Medical Invoice',
        html: `
        <!-- Invoice Template -->
        <div class="relative p-8 sm:p-12 text-slate-900 leading-relaxed font-sans">
          
          <div class="flex items-start justify-between border-b border-slate-200 pb-6 mb-8">
            <div>
              <h2 class="text-2xl font-black tracking-tight text-slate-900 editable-block" contenteditable="true">APEX HEALTH & CONSULTING LLC</h2>
              <p class="text-xs text-slate-500 mt-1 editable-block" contenteditable="true">Professional Medical, Advisory & Legal Documentation Services</p>
              <p class="text-xs text-slate-500 editable-block" contenteditable="true">billing@apexhealth.org | +1 (800) 555-0199</p>
            </div>
            <div class="text-right">
              <h1 class="text-3xl font-black text-blue-600 tracking-wider editable-block" contenteditable="true">INVOICE</h1>
              <div class="text-xs text-slate-500 mt-1 font-mono"><span class="editable-field font-semibold" contenteditable="true">Invoice #:</span> <span class="editable-field font-bold" contenteditable="true">INV-2026-0492</span></div>
              <div class="text-xs text-slate-500 font-mono"><span class="editable-field font-semibold" contenteditable="true">Date:</span> <span class="editable-field" contenteditable="true">October 28, 2026</span></div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-8 mb-8 text-xs sm:text-sm">
            <div>
              <span class="font-bold text-slate-500 uppercase tracking-wider block mb-1 editable-block" contenteditable="true">Billed To:</span>
              <div class="editable-block font-semibold text-slate-800" contenteditable="true">
                Acme Global Enterprise Ltd.<br>
                Attn: Human Resources & Medical Board<br>
                77 Corporate Boulevard, Suite 400
              </div>
            </div>
            <div>
              <span class="font-bold text-slate-500 uppercase tracking-wider block mb-1 editable-block" contenteditable="true">Payment Details:</span>
              <div class="editable-block text-slate-700" contenteditable="true">
                Bank: First Global Trust<br>
                Account Name: Apex Health LLC<br>
                Account / IBAN: US82 FGT 9920 1192 8841<br>
                Due Date: Net 15 Days
              </div>
            </div>
          </div>

          <!-- Items Table -->
          <table class="w-full text-left text-sm mb-8 border border-slate-200 rounded-lg overflow-hidden">
            <thead class="bg-slate-100 text-slate-700 font-bold uppercase text-xs">
              <tr>
                <th class="p-3 editable-field" contenteditable="true">Description</th>
                <th class="p-3 text-center w-20 editable-field" contenteditable="true">Qty</th>
                <th class="p-3 text-right w-28 editable-field" contenteditable="true">Rate</th>
                <th class="p-3 text-right w-28 editable-field" contenteditable="true">Amount</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200">
              <tr>
                <td class="p-3 editable-block" contenteditable="true">Comprehensive Executive Health Evaluation & Diagnostic Screening</td>
                <td class="p-3 text-center editable-field" contenteditable="true">1</td>
                <td class="p-3 text-right editable-field" contenteditable="true">$450.00</td>
                <td class="p-3 text-right font-semibold editable-field" contenteditable="true">$450.00</td>
              </tr>
              <tr>
                <td class="p-3 editable-block" contenteditable="true">Laboratory Pathology Profiling (Full Blood Count, Metabolic Panel, Lipid Screen)</td>
                <td class="p-3 text-center editable-field" contenteditable="true">1</td>
                <td class="p-3 text-right editable-field" contenteditable="true">$180.00</td>
                <td class="p-3 text-right font-semibold editable-field" contenteditable="true">$180.00</td>
              </tr>
              <tr>
                <td class="p-3 editable-block" contenteditable="true">Medical Fitness Certification & Legal Compliance Attestation</td>
                <td class="p-3 text-center editable-field" contenteditable="true">1</td>
                <td class="p-3 text-right editable-field" contenteditable="true">$120.00</td>
                <td class="p-3 text-right font-semibold editable-field" contenteditable="true">$120.00</td>
              </tr>
            </tbody>
            <tfoot class="bg-slate-50 border-t border-slate-200 text-slate-800">
              <tr>
                <td colspan="3" class="p-3 text-right font-bold editable-field" contenteditable="true">Subtotal:</td>
                <td class="p-3 text-right font-bold editable-field" contenteditable="true">$750.00</td>
              </tr>
              <tr>
                <td colspan="3" class="p-3 text-right font-bold editable-field" contenteditable="true">Tax / VAT (0% Exempt):</td>
                <td class="p-3 text-right font-bold editable-field" contenteditable="true">$0.00</td>
              </tr>
              <tr class="text-base text-blue-700 font-extrabold bg-blue-50/50">
                <td colspan="3" class="p-3 text-right editable-field" contenteditable="true">Total Due:</td>
                <td class="p-3 text-right editable-field" contenteditable="true">$750.00</td>
              </tr>
            </tfoot>
          </table>

          <div class="flex items-end justify-between pt-6 border-t border-slate-200">
            <div class="text-xs text-slate-500">
              <p class="font-bold text-slate-700 editable-block" contenteditable="true">Thank you for your business!</p>
              <p class="mt-0.5 editable-block" contenteditable="true">Inquiries? Contact support@apexhealth.org</p>
            </div>
            <div class="text-center">
              <div class="w-40 h-14 relative flex items-center justify-center cursor-pointer group" onclick="openSignatureModal('cert')">
                <img src="assets/signature.png" alt="Signature" class="cert-sig-img max-h-14 w-auto object-contain">
              </div>
              <div class="w-40 border-b border-slate-800"></div>
              <div class="text-xs uppercase text-slate-600 font-semibold mt-1 editable-block" contenteditable="true">Authorized Signatory</div>
            </div>
          </div>

        </div>
        `
      },
      'achievement-cert': {
        name: 'Certificate of Achievement & Excellence',
        html: `
        <!-- Certificate of Achievement Template -->
        <div class="relative p-10 sm:p-14 text-slate-900 text-center font-serif-formal border-8 border-double border-amber-600/40 rounded-lg">
          
          <div class="my-4">
            <div class="w-16 h-16 mx-auto rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-amber-600 text-3xl mb-4">
              <i class="fa-solid fa-award"></i>
            </div>
            <h3 class="text-xs uppercase font-sans tracking-[0.3em] font-extrabold text-amber-700 mb-2 editable-block" contenteditable="true">INTERNATIONAL INSTITUTE OF MEDICAL SCIENCES</h3>
            <h1 class="text-3xl sm:text-4xl font-black text-slate-900 tracking-wider uppercase mb-1 editable-block" contenteditable="true">CERTIFICATE OF EXCELLENCE</h1>
            <p class="text-xs font-sans text-slate-500 tracking-widest uppercase editable-block" contenteditable="true">THIS CERTIFICATE IS PROUDLY PRESENTED TO</p>
          </div>

          <div class="my-8">
            <div class="editable-field handwritten text-3xl sm:text-4xl font-bold text-blue-900 border-b-2 border-amber-500 pb-2 px-8 inline-block min-w-[320px]" contenteditable="true" data-field="patient">
              Dr. Aisha Bello, M.D.
            </div>
          </div>

          <div class="max-w-xl mx-auto text-sm sm:text-base leading-relaxed text-slate-700 font-sans mb-12">
            <p class="editable-block" contenteditable="true">
              In distinguished recognition of exemplary dedication, clinical leadership, and outstanding contributions towards patient healthcare delivery and advanced clinical excellence throughout the year 2026.
            </p>
          </div>

          <div class="flex items-end justify-between max-w-lg mx-auto font-sans pt-6">
            <div class="text-center">
              <div class="text-xs font-bold text-slate-700 editable-field" contenteditable="true">October 28, 2026</div>
              <div class="w-36 border-b border-slate-700 mt-2"></div>
              <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1 editable-block" contenteditable="true">Date</div>
            </div>

            <div class="text-center">
              <div class="w-36 h-12 relative flex items-center justify-center cursor-pointer group" onclick="openSignatureModal('cert')">
                <img src="assets/signature.png" alt="Signature" class="cert-sig-img max-h-12 w-auto object-contain">
              </div>
              <div class="w-36 border-b border-slate-700"></div>
              <div class="text-xs text-slate-500 uppercase tracking-wider font-semibold mt-1 editable-block" contenteditable="true">Board Director</div>
            </div>
          </div>

        </div>
        `
      }
    };
  }
}

window.CertificateEditor = CertificateEditor;
