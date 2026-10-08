/**
 * DawaDhwani Modals Manager
 * Handles Add Patient, Add Medicine (with Step 2 confirmation), Call Transcript, and Inspection
 */

class ModalManager {
  constructor() {
    this.pendingMedicine = null;
  }

  // --- Add Patient Modal ---
  openAddPatientModal() {
    let modal = document.getElementById('add-patient-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'add-patient-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Add New Senior Patient</h3>
            <p class="modal-subtitle">Setup basic phone IVR reminders for your family member</p>
          </div>
          <button class="modal-close-btn" onclick="window.dawaModals.close('add-patient-modal')">&times;</button>
        </div>

        <form id="add-patient-form" onsubmit="window.dawaModals.submitAddPatient(event)">
          <div class="modal-body">
            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="pt-name">Full Name *</label>
                <input type="text" id="pt-name" class="form-input" placeholder="e.g. Meera Devi" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="pt-age">Age *</label>
                <input type="number" id="pt-age" class="form-input" min="50" max="110" placeholder="e.g. 76" required>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="pt-phone">Phone Number (Basic Phone / Landline) *</label>
                <input type="tel" id="pt-phone" class="form-input" placeholder="+91 98XXX XXXXX" required>
                <span class="form-hint">Patient does NOT need a smartphone. Any basic keypad phone works.</span>
              </div>
              <div class="form-group">
                <label class="form-label" for="pt-lang">Preferred IVR Voice Language *</label>
                <select id="pt-lang" class="form-select" required>
                  <option value="Hindi IVR">Hindi (हिंदी)</option>
                  <option value="Telugu IVR">Telugu (తెలుగు)</option>
                  <option value="Tamil IVR">Tamil (தமிழ்)</option>
                  <option value="Kannada IVR">Kannada (ಕನ್ನಡ)</option>
                  <option value="Gujarati IVR">Gujarati (ગુજરાતી)</option>
                  <option value="Bengali IVR">Bengali (বাংলা)</option>
                  <option value="English IVR">English (Indian Accent)</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="pt-phone-type">Device Type / Model</label>
              <input type="text" id="pt-phone-type" class="form-input" placeholder="e.g. Nokia 105 Feature Phone / BSNL Landline" value="Nokia Feature Phone">
            </div>

            <div class="form-group">
              <label class="form-label" for="pt-address">Care Address / City</label>
              <input type="text" id="pt-address" class="form-input" placeholder="e.g. Bengaluru, Karnataka">
            </div>

            <div class="form-group">
              <label class="form-label" for="pt-notes">Caregiver Care Notes</label>
              <textarea id="pt-notes" class="form-textarea" rows="2" placeholder="e.g. Remind in gentle voice; requires 2 rings before picking up."></textarea>
            </div>

            <div class="safety-advisory-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <div>
                <strong>Voice Companion Notice</strong>
                <p>The system will contact this phone strictly for scheduled reminders and helpline assistance. No personal medical claims are asserted.</p>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.dawaModals.close('add-patient-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Save & Register Patient</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.add('active');
  }

  async submitAddPatient(e) {
    e.preventDefault();
    const name = document.getElementById('pt-name').value.trim();
    const age = document.getElementById('pt-age').value.trim();
    const phone = document.getElementById('pt-phone').value.trim();
    const language = document.getElementById('pt-lang').value;
    const phoneType = document.getElementById('pt-phone-type').value.trim();
    const address = document.getElementById('pt-address').value.trim();
    const notes = document.getElementById('pt-notes').value.trim();

    if (!name || !phone) return;

    await window.dawaApi.addPatient({
      name,
      age,
      phone,
      language,
      phoneType,
      address,
      notes
    });

    this.close('add-patient-modal');
    window.dawaToast.show(`Patient ${name} added successfully!`, 'success');
    if (window.dawaApp) {
      window.dawaApp.refreshCurrentView();
    }
  }

  // --- Add Medicine Flow (With Strict Step 2 Confirmation) ---
  async openAddMedicineModal(preselectedPatientId = null) {
    const patients = await window.dawaApi.getPatients();
    let modal = document.getElementById('add-medicine-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'add-medicine-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    const patientOptions = patients.map(p => `
      <option value="${p.id}" ${preselectedPatientId === p.id ? 'selected' : ''}>${p.name} (${p.age}y - ${p.phone})</option>
    `).join('');

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Schedule Medicine Reminder</h3>
            <p class="modal-subtitle">Setup automated phone reminders for scheduled doses</p>
          </div>
          <button class="modal-close-btn" onclick="window.dawaModals.close('add-medicine-modal')">&times;</button>
        </div>

        <div class="medical-disclaimer-banner">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span>This app repeats the information entered by the caregiver. It does not provide medical dosing advice.</span>
        </div>

        <form id="add-medicine-form" onsubmit="window.dawaModals.proceedToMedicineConfirmation(event)">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label" for="med-patient">Patient *</label>
              <select id="med-patient" class="form-select" required>
                ${patientOptions}
              </select>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="med-name">Medicine Name *</label>
                <input type="text" id="med-name" class="form-input" placeholder="e.g. BP Tablet / Metformin" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="med-dose">Dose *</label>
                <input type="text" id="med-dose" class="form-input" placeholder="e.g. 1 tablet (5mg)" required>
              </div>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="med-time">Scheduled Reminder Time *</label>
                <input type="time" id="med-time" class="form-input" value="08:00" required>
              </div>
              <div class="form-group">
                <label class="form-label" for="med-freq">Frequency *</label>
                <select id="med-freq" class="form-select" required>
                  <option value="Once Daily (Morning)">Once Daily (Morning)</option>
                  <option value="Once Daily (Afternoon)">Once Daily (Afternoon)</option>
                  <option value="Once Daily (Evening)">Once Daily (Evening)</option>
                  <option value="Once Daily (Night / Bedtime)">Once Daily (Night / Bedtime)</option>
                  <option value="Twice Daily">Twice Daily</option>
                  <option value="Every Alternate Day">Every Alternate Day</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="med-cue">Habit Cue / Everyday Context</label>
              <input type="text" id="med-cue" class="form-input" placeholder="e.g. After morning chai / With warm water after lunch">
              <span class="form-hint">Used in IVR voice prompt to help senior recognize the routine context.</span>
            </div>

            <div class="form-row-2">
              <div class="form-group">
                <label class="form-label" for="med-lang">Voice Prompt Language</label>
                <select id="med-lang" class="form-select">
                  <option value="Hindi">Hindi</option>
                  <option value="Telugu">Telugu</option>
                  <option value="Tamil">Tamil</option>
                  <option value="Kannada">Kannada</option>
                  <option value="Gujarati">Gujarati</option>
                  <option value="English">English</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label" for="med-retries">Escalation Retry Setting</label>
                <select id="med-retries" class="form-select">
                  <option value="2">2 retries (15 min interval)</option>
                  <option value="1">1 retry (15 min interval)</option>
                  <option value="3">3 retries (10 min interval)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="window.dawaModals.close('add-medicine-modal')">Cancel</button>
            <button type="submit" class="btn btn-primary">Continue to Confirmation</button>
          </div>
        </form>
      </div>
    `;

    modal.classList.add('active');
  }

  // --- Step 2: Mandatory Confirmation Step ---
  async proceedToMedicineConfirmation(e) {
    e.preventDefault();
    const patientSelect = document.getElementById('med-patient');
    const patientId = patientSelect.value;
    const patientName = patientSelect.options[patientSelect.selectedIndex].text.split('(')[0].trim();
    const name = document.getElementById('med-name').value.trim();
    const dose = document.getElementById('med-dose').value.trim();
    const rawTime = document.getElementById('med-time').value;
    const frequency = document.getElementById('med-freq').value;
    const habitCue = document.getElementById('med-cue').value.trim() || 'After meal';
    const reminderLanguage = document.getElementById('med-lang').value;
    const maxRetries = document.getElementById('med-retries').value;

    // Convert raw time HH:MM to 12-hour AM/PM
    const [hours, minutes] = rawTime.split(':');
    let h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    const formattedTime = `${String(h).padStart(2, '0')}:${minutes} ${ampm}`;

    this.pendingMedicine = {
      patientId,
      patientName,
      name,
      dose,
      scheduleTime: formattedTime,
      frequency,
      habitCue,
      reminderLanguage,
      maxRetries,
      retryInterval: '15 mins'
    };

    // Close step 1
    this.close('add-medicine-modal');

    // Open Step 2 Confirmation Dialog
    this.openConfirmationDialog();
  }

  openConfirmationDialog() {
    let confirmModal = document.getElementById('medicine-confirmation-modal');
    if (!confirmModal) {
      confirmModal = document.createElement('div');
      confirmModal.id = 'medicine-confirmation-modal';
      confirmModal.className = 'modal-backdrop';
      document.body.appendChild(confirmModal);
    }

    const m = this.pendingMedicine;
    if (!m) return;

    confirmModal.innerHTML = `
      <div class="modal-dialog confirmation-dialog">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">Please Confirm Medicine Entry</h3>
            <p class="modal-subtitle">Review reminder parameters before scheduling IVR voice calls</p>
          </div>
          <button class="modal-close-btn" onclick="window.dawaModals.editPendingMedicine()">&times;</button>
        </div>

        <div class="modal-body">
          <div class="confirmation-summary-card">
            <div class="confirmation-lead-text">You entered:</div>
            
            <div class="confirmation-field-row">
              <span class="field-label">Patient:</span>
              <span class="field-value highlight">${m.patientName}</span>
            </div>
            <div class="confirmation-field-row">
              <span class="field-label">Medicine:</span>
              <span class="field-value">${m.name}</span>
            </div>
            <div class="confirmation-field-row">
              <span class="field-label">Dose:</span>
              <span class="field-value">${m.dose}</span>
            </div>
            <div class="confirmation-field-row">
              <span class="field-label">Time:</span>
              <span class="field-value highlight">${m.scheduleTime}</span>
            </div>
            <div class="confirmation-field-row">
              <span class="field-label">Habit Cue:</span>
              <span class="field-value">${m.habitCue}</span>
            </div>
            <div class="confirmation-field-row">
              <span class="field-label">Reminder Language:</span>
              <span class="field-value">${m.reminderLanguage} IVR</span>
            </div>
          </div>

          <div class="safety-advisory-box" style="margin-top: 16px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong>Please confirm the information.</strong>
              <p>DawaDhwani repeats this data to the senior over the telephone call. Ensure dose and schedule match physician instructions.</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="window.dawaModals.editPendingMedicine()">Edit</button>
          <button type="button" class="btn btn-primary" onclick="window.dawaModals.saveConfirmedMedicine()">Yes, Save</button>
        </div>
      </div>
    `;

    confirmModal.classList.add('active');
  }

  editPendingMedicine() {
    this.close('medicine-confirmation-modal');
    // Reopen step 1 with values
    this.openAddMedicineModal(this.pendingMedicine ? this.pendingMedicine.patientId : null);
  }

  async saveConfirmedMedicine() {
    if (!this.pendingMedicine) return;

    await window.dawaApi.addMedicine(this.pendingMedicine);
    const medName = this.pendingMedicine.name;
    const ptName = this.pendingMedicine.patientName;

    this.close('medicine-confirmation-modal');
    this.pendingMedicine = null;

    window.dawaToast.show(`Saved! ${medName} scheduled for ${ptName}.`, 'success');
    if (window.dawaApp) {
      window.dawaApp.refreshCurrentView();
    }
  }

  // --- Call Transcript Modal ---
  openCallTranscript(callLog) {
    let modal = document.getElementById('call-transcript-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'call-transcript-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">IVR Telephony Call Record</h3>
            <p class="modal-subtitle">Call ID: ${callLog.id} • ${callLog.time}</p>
          </div>
          <button class="modal-close-btn" onclick="window.dawaModals.close('call-transcript-modal')">&times;</button>
        </div>

        <div class="modal-body">
          <div class="call-meta-grid">
            <div class="call-meta-item">
              <span class="meta-label">Patient</span>
              <span class="meta-val">${callLog.patientName}</span>
            </div>
            <div class="call-meta-item">
              <span class="meta-label">Phone</span>
              <span class="meta-val">${callLog.phone}</span>
            </div>
            <div class="call-meta-item">
              <span class="meta-label">Direction</span>
              <span class="meta-val">${callLog.direction}</span>
            </div>
            <div class="call-meta-item">
              <span class="meta-label">Call Type</span>
              <span class="meta-val">${callLog.callType}</span>
            </div>
            <div class="call-meta-item">
              <span class="meta-label">Attempt</span>
              <span class="meta-val">${callLog.attempt}</span>
            </div>
            <div class="call-meta-item">
              <span class="meta-label">Key Pressed</span>
              <span class="meta-val highlight">${callLog.keyPressed === '—' ? 'None (No response)' : `Key [ ${callLog.keyPressed} ]`}</span>
            </div>
            <div class="call-meta-item">
              <span class="meta-label">Recorded Result</span>
              <span class="meta-val status-badge ${callLog.result === 'Reported Taken' ? 'status-green' : callLog.result === 'No Response' ? 'status-red' : 'status-amber'}">${callLog.result}</span>
            </div>
            <div class="call-meta-item">
              <span class="meta-label">Duration</span>
              <span class="meta-val">${callLog.duration}</span>
            </div>
          </div>

          <div class="transcript-box">
            <div class="transcript-title">Telephony Event Stream & Audio Script</div>
            <div class="transcript-content">
              ${callLog.transcript}
            </div>
          </div>

          <div class="safety-advisory-box" style="margin-top: 14px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <div>
              <strong>Reported Status Standard</strong>
              <p>Keypad input records the patient’s confirmation. It is recorded as <em>Reported Taken</em> and is not a medical ingestion guarantee.</p>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" onclick="window.dawaModals.close('call-transcript-modal')">Close</button>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  close(modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('active');
  }
}

window.dawaModals = new ModalManager();
