/**
 * DawaDhwani Senior IVR Phone Simulator Component
 * Demonstrates the voice-first paradigm:
 * 1. Basic phone rings at scheduled medicine time
 * 2. Voice prompt plays in senior's language
 * 3. Senior presses keypad 1
 * 4. System updates dashboard status to "Reported Taken"
 * 5. Also simulates Senior dialing 1800-DAWA-HELP ("Did I take my medicine?")
 */

class IvrSimulator {
  constructor() {
    this.modalEl = null;
    this.activeSession = null;
    this.speechSynthesis = window.speechSynthesis || null;
  }

  openReminderCall(scheduleItem) {
    this.activeSession = {
      type: 'REMINDER_OUTGOING',
      patientName: scheduleItem.patientName,
      patientId: scheduleItem.patientId,
      medicineName: scheduleItem.medicineName,
      dose: scheduleItem.dose,
      habitCue: scheduleItem.habitCue || 'After meal',
      scheduleId: scheduleItem.id,
      state: 'RINGING', // RINGING, IN_CALL, COMPLETED, MISSED
      attempts: scheduleItem.attempts + 1
    };
    this.render();
  }

  openHelplineCall(patient) {
    this.activeSession = {
      type: 'HELPLINE_INCOMING',
      patientName: patient ? patient.name : 'Anita Patel',
      patientId: patient ? patient.id : 'P03',
      state: 'CONNECTED',
      query: 'Did I take my medicine?'
    };
    this.render();
  }

  close() {
    if (this.speechSynthesis) {
      this.speechSynthesis.cancel();
    }
    const modal = document.getElementById('ivr-simulator-modal');
    if (modal) {
      modal.classList.remove('active');
    }
    this.activeSession = null;
  }

  render() {
    let modal = document.getElementById('ivr-simulator-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ivr-simulator-modal';
      modal.className = 'modal-backdrop';
      document.body.appendChild(modal);
    }

    const s = this.activeSession;
    if (!s) return;

    let displayTitle = '';
    let screenContentHtml = '';

    if (s.type === 'REMINDER_OUTGOING') {
      if (s.state === 'RINGING') {
        displayTitle = 'Incoming Reminder Call';
        screenContentHtml = `
          <div class="phone-screen-banner ringing">
            <span class="pulsing-call-dot"></span>
            INCOMING CALL: DawaDhwani
          </div>
          <div class="phone-screen-body">
            <div class="senior-caller-id">DawaDhwani Companion</div>
            <div class="senior-target-name">${s.patientName}’s Phone</div>
            <div class="senior-call-subtitle">Automated Scheduled Reminder Call</div>
            <div class="call-controls-row">
              <button class="phone-cta-btn answer" onclick="window.dawaIvr.answerReminder()">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                Answer Call
              </button>
              <button class="phone-cta-btn decline" onclick="window.dawaIvr.ignoreReminder()">
                Ignore (No Response)
              </button>
            </div>
          </div>
        `;
      } else if (s.state === 'IN_CALL') {
        displayTitle = 'Active Reminder Call (In Progress)';
        screenContentHtml = `
          <div class="phone-screen-banner connected">
            ● 00:14 • Connected
          </div>
          <div class="phone-screen-body">
            <div class="audio-wave-anim">
              <span></span><span></span><span></span><span></span><span></span>
            </div>
            <div class="ivr-speech-bubble">
              <strong>Voice Prompt Playing:</strong>
              "Namaste ${s.patientName} ji, this is your DawaDhwani companion. Please take your <strong>${s.medicineName} (${s.dose})</strong> ${s.habitCue}.
              <br><br>
              <strong>👉 Press 1 on your keypad after taking.</strong>"
            </div>
            <div class="keypad-instruction-hint">
              Tap <strong>[ 1 ]</strong> on the keypad below to confirm reported intake.
            </div>
          </div>
        `;
      } else if (s.state === 'CONFIRMED') {
        displayTitle = 'Call Finished';
        screenContentHtml = `
          <div class="phone-screen-banner completed">
            ✓ Reported Taken Confirmed
          </div>
          <div class="phone-screen-body">
            <div class="ivr-speech-bubble success">
              "Dhanyavaad ${s.patientName} ji. Recorded as <strong>Reported Taken</strong>. Have a wonderful day!"
            </div>
            <div class="phone-status-note">
              Caregiver dashboard updated in real-time. Call logged in system.
            </div>
            <button class="btn btn-primary" style="margin-top: 14px;" onclick="window.dawaIvr.close()">
              Done & Return to Dashboard
            </button>
          </div>
        `;
      } else if (s.state === 'NO_RESPONSE') {
        displayTitle = 'Call Unanswered';
        screenContentHtml = `
          <div class="phone-screen-banner alert">
            ⚠ No Response Recorded
          </div>
          <div class="phone-screen-body">
            <div class="ivr-speech-bubble alert">
              Call rang out after 30 seconds with no answer or keypad response.
              Attempt #${s.attempts} logged. Caregiver escalation triggered.
            </div>
            <button class="btn btn-secondary" style="margin-top: 14px;" onclick="window.dawaIvr.close()">
              Close Window
            </button>
          </div>
        `;
      }
    } else if (s.type === 'HELPLINE_INCOMING') {
      displayTitle = 'Toll-Free Senior IVR Helpline (1800-DAWA-HELP)';
      screenContentHtml = `
        <div class="phone-screen-banner connected">
          ● Senior Dialed: 1800-202-DAWA
        </div>
        <div class="phone-screen-body">
          <div class="audio-wave-anim">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="ivr-speech-bubble">
            <strong>Senior asked:</strong> "Did I take my medicine?"
            <br><br>
            <strong>IVR Audio Response:</strong>
            "Namaste ${s.patientName} ji. Your morning medicine (Metformin 500mg) was <strong>Reported Taken</strong> at 08:02 AM today. Your next medicine is scheduled at 08:30 PM."
          </div>
          <div class="phone-status-note">
            The system answers senior memory queries automatically from recorded reported status.
          </div>
          <button class="btn btn-primary" style="margin-top: 14px;" onclick="window.dawaIvr.close()">
            Close Helpline Call
          </button>
        </div>
      `;
    }

    modal.innerHTML = `
      <div class="modal-dialog ivr-phone-dialog">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">${displayTitle}</h3>
            <p class="modal-subtitle">Live simulation of senior's basic feature phone & automated voice engine</p>
          </div>
          <button class="modal-close-btn" onclick="window.dawaIvr.close()">&times;</button>
        </div>

        <div class="modal-body ivr-phone-layout">
          <!-- Realistic Feature Phone Handset -->
          <div class="feature-phone-chassis">
            <div class="feature-phone-speaker"></div>
            
            <div class="feature-phone-lcd">
              <div class="lcd-header">
                <span>📶 AIRTEL 4G</span>
                <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <span>🔋 88%</span>
              </div>
              ${screenContentHtml}
            </div>

            <!-- Basic Phone Physical Keypad -->
            <div class="feature-phone-keypad">
              <div class="keypad-nav-cluster">
                <button class="nav-key nav-soft-left" onclick="window.dawaIvr.pressKey('SOFT1')">Options</button>
                <button class="nav-key nav-dpad" onclick="window.dawaIvr.pressKey('OK')">OK</button>
                <button class="nav-key nav-soft-right" onclick="window.dawaIvr.pressKey('SOFT2')">Back</button>
              </div>
              <div class="keypad-grid">
                <button class="keypad-num" onclick="window.dawaIvr.pressKey('1')">
                  <span class="num">1</span><span class="letters">CONFIRM</span>
                </button>
                <button class="keypad-num" onclick="window.dawaIvr.pressKey('2')">
                  <span class="num">2</span><span class="letters">ABC</span>
                </button>
                <button class="keypad-num" onclick="window.dawaIvr.pressKey('3')">
                  <span class="num">3</span><span class="letters">DEF</span>
                </button>
                <button class="keypad-num" onclick="window.dawaIvr.pressKey('4')">
                  <span class="num">4</span><span class="letters">GHI</span>
                </button>
                <button class="keypad-num" onclick="window.dawaIvr.pressKey('5')">
                  <span class="num">5</span><span class="letters">JKL</span>
                </button>
                <button class="keypad-num" onclick="window.dawaIvr.pressKey('6')">
                  <span class="num">6</span><span class="letters">MNO</span>
                </button>
                <button class="keypad-num" onclick="window.dawaIvr.pressKey('7')">
                  <span class="num">7</span><span class="letters">PQRS</span>
                </button>
                <button class="keypad-num" onclick="window.dawaIvr.pressKey('8')">
                  <span class="num">8</span><span class="letters">TUV</span>
                </button>
                <button class="keypad-num" onclick="window.dawaIvr.pressKey('9')">
                  <span class="num">9</span><span class="letters">WXYZ</span>
                </button>
                <button class="keypad-num" onclick="window.dawaIvr.pressKey('*')">
                  <span class="num">*</span><span class="letters">+</span>
                </button>
                <button class="keypad-num" onclick="window.dawaIvr.pressKey('0')">
                  <span class="num">0</span><span class="letters">SPACE</span>
                </button>
                <button class="keypad-num" onclick="window.dawaIvr.pressKey('#')">
                  <span class="num">#</span><span class="letters">HELP</span>
                </button>
              </div>
            </div>
          </div>

          <!-- Educational Context Panel -->
          <div class="ivr-explanation-panel">
            <h4>Voice-First Companion Architecture</h4>
            <p>
              The senior uses any simple feature phone or landline with zero apps, zero screens, and zero passwords.
            </p>
            <div class="ivr-step-card">
              <span class="step-num">1</span>
              <div>
                <strong>Scheduled Voice Call</strong>
                <p>Cloud telephony places an automated call in the patient’s native language at the scheduled minute.</p>
              </div>
            </div>
            <div class="ivr-step-card">
              <span class="step-num">2</span>
              <div>
                <strong>Simple Keypad 1 Confirmation</strong>
                <p>The patient presses any standard keypad key (e.g. 1) to confirm. The system records this strictly as <strong>"Reported Taken"</strong>.</p>
              </div>
            </div>
            <div class="ivr-step-card">
              <span class="step-num">3</span>
              <div>
                <strong>Caregiver Alert on Missed Retries</strong>
                <p>If unanswered after 2 retries, the caregiver is notified instantly. No fake medical claims are made.</p>
              </div>
            </div>

            <div class="safety-advisory-box">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div>
                <strong>Safety & Terminology Standard</strong>
                <p>DawaDhwani records senior confirmation as <em>Reported Taken</em>. The system never claims physical ingestion or medical certainty.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  answerReminder() {
    if (!this.activeSession) return;
    this.activeSession.state = 'IN_CALL';
    this.render();
    if ('speechSynthesis' in window) {
      try {
        const text = `Namaste ${this.activeSession.patientName}, this is your DawaDhwani reminder. Please take ${this.activeSession.medicineName}. Press 1 after taking.`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn('Speech synthesis skipped:', e);
      }
    }
  }

  ignoreReminder() {
    if (!this.activeSession) return;
    this.activeSession.state = 'NO_RESPONSE';
    this.render();

    // Log call as No response
    window.dawaApi.addCallLog({
      patientId: this.activeSession.patientId,
      patientName: this.activeSession.patientName,
      phone: '+91 9845X XXXXX',
      direction: 'Outgoing',
      callType: 'Medicine Reminder',
      attempt: `${this.activeSession.attempts} of 2`,
      keyPressed: '—',
      duration: '30s',
      result: 'No Response',
      transcript: `Call rang out without answer. Reminder for ${this.activeSession.medicineName}.`
    });

    if (this.activeSession.scheduleId) {
      window.dawaApi.updateScheduleStatus(this.activeSession.scheduleId, 'No Response', 'None', 'No answer after call');
    }

    if (window.dawaApp) {
      window.dawaApp.refreshCurrentView();
    }
    window.dawaToast.show(`No response recorded for ${this.activeSession.patientName}. Escalation initiated.`, 'warning');
  }

  pressKey(key) {
    if (!this.activeSession) return;

    if (key === '1' && (this.activeSession.state === 'IN_CALL' || this.activeSession.state === 'RINGING')) {
      this.activeSession.state = 'CONFIRMED';
      this.render();

      if ('speechSynthesis' in window) {
        try {
          const utterance = new SpeechSynthesisUtterance("Dhanyavaad, recorded as Reported Taken.");
          utterance.rate = 1.0;
          window.speechSynthesis.speak(utterance);
        } catch (e) {}
      }

      // Record as Reported Taken in API
      if (this.activeSession.scheduleId) {
        window.dawaApi.updateScheduleStatus(this.activeSession.scheduleId, 'Reported Taken', '1', 'Keypad 1 pressed');
      }

      // Add to Call Logs
      window.dawaApi.addCallLog({
        patientId: this.activeSession.patientId,
        patientName: this.activeSession.patientName,
        phone: '+91 9845X XXXXX',
        direction: 'Outgoing',
        callType: 'Medicine Reminder',
        attempt: '1 of 2',
        keyPressed: '1',
        duration: '45s',
        result: 'Reported Taken',
        transcript: `Voice prompt played for ${this.activeSession.medicineName}. Senior pressed keypad 1. Status recorded as Reported Taken.`
      });

      if (window.dawaApp) {
        window.dawaApp.refreshCurrentView();
      }
      window.dawaToast.show(`Keypad '1' recorded! ${this.activeSession.medicineName} marked as Reported Taken.`, 'success');
    } else {
      window.dawaToast.show(`Keypad '${key}' pressed on feature phone`, 'info');
    }
  }
}

window.dawaIvr = new IvrSimulator();
