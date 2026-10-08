# DawaDhwani — Desktop Caregiver Platform

DawaDhwani is a voice-first medicine companion designed for seniors and Alzheimer's patients.

The senior/patient does **not** need a smartphone, an app, or an internet connection. They interact using basic keypad phones or landlines through automated voice calls in their native language.

The caregiver uses this **Desktop Caregiver Dashboard** to monitor adherence, schedule reminders, review call logs, observe response patterns, and manage family escalation chains.

---

## Safety & Medical Compliance Principles

1. **"Reported Taken" Wording Standard**:
   - Status is recorded strictly as **"Reported Taken"** when a senior confirms via telephone keypad (e.g., pressing `1`).
   - The application **never** claims physical ingestion, clinical certainty, or "Verified Taken".
   - Never states "Patient is safe" or "Emergency detected".

2. **Caregiver Dosing Disclaimer**:
   - *"This app repeats the information entered by the caregiver. It does not provide medical dosing advice."*
   - Step 2 confirmation dialog required before saving any new medication schedule.

3. **Pattern Analysis as Observations**:
   - Behavioral pattern alerts (e.g. response latency changes) are observations compared with the patient's own previous 30-day baseline.
   - Pattern alerts are **never** medical diagnoses.

4. **Escalation Protocol**:
   - Tier 1: Scheduled Voice Call
   - Tier 2: Automated Retry (+15 minutes)
   - Tier 3: Primary Family Caregiver (Emma Patel)
   - Tier 4: Family-Selected Backup Contact (Dr. Ramesh Sharma / Neighbor)
   - Tier 5: Community Health Worker (ASHA) — Marked clearly as **Future / Pilot**.

---

## Architecture & File Structure

```
desktop/
├── index.html               # Semantic desktop dashboard UI
├── styles.css               # Design system adhering to warm healthcare palette
├── app.js                   # Client-side router, view controllers, search & events
├── assets/                  # High-resolution caregiver & patient profile images
├── components/
│   ├── ivr-simulator.js     # Live Senior Feature Phone IVR Call Simulator
│   ├── modal.js             # Add Patient, Add Medicine (with Step 2 confirmation), Transcript
│   └── toast.js             # Toast notification feedback
├── services/
│   └── api.js               # Clean Data & REST API service layer with LocalStorage fallback
└── README.md                # Documentation & startup instructions
```

---

## Desktop Features Implemented

1. **Dashboard (`#dashboard`)**:
   - Greeting & overview: "Good morning, Emma"
   - 4 Summary Stat Cards: Active Patients, Scheduled Today, Reported Taken, Needs Attention
   - Today's Medications table with colored status badges (Reported Taken, Calling, No Response, Upcoming)
   - Real-time Automated Call Queue monitor
   - Urgent Attention feed & System Diagnostics widget

2. **Patients Page & Detail View (`#patients`, `#patient-detail`)**:
   - Search & filter (All, System Active, Needs Attention)
   - Add Patient modal (with language, device model, caregiver notes)
   - Patient Profile banner (Nokia 105 feature phone badge, IVR helpline PIN)
   - 5 Detailed Tabs:
     - Today's Medicine Timeline (vertical chronological status list)
     - Medication Schedule (registered doses & habit cues)
     - Call History (filtered logs with keypad inputs)
     - Pattern Alerts (with non-diagnosis safety notices)
     - Family Contacts (primary caregiver & backup doctor/neighbor)

3. **Medicines Page (`#medicines`)**:
   - List of active medicine schedules with habit cues and voice languages
   - "+ Add Medicine" button opening the 2-step flow:
     - Step 1: Input details (Patient, Medicine, Dose, Time, Habit Cue, Language, Retries)
     - Step 2: Confirmation Dialog ("You entered: Medicine: ..., Dose: ..., Time: ... Please confirm.")
     - Helper text: *"This app repeats the information entered by the caregiver. It does not provide medical dosing advice."*

4. **Call Logs (`#calls`)**:
   - Direction filters: All, Outgoing Reminders, Incoming Helpline, Missed
   - Detailed logs: Time, Patient, Direction, Call Type, Attempt, Key Pressed, Result, Duration
   - Interactive "Transcript" modal showing telephony event streams & spoken audio scripts

5. **Alerts Page (`#alerts`)**:
   - Filters: All, Needs Attention, Pattern Alerts, Unresolved
   - Severity-based styling with observational safety notes
   - Direct actions: "Call Patient", "View Patient Profile", "Acknowledge & Resolve"

6. **Care Insights (`#insights`)**:
   - Observation notice: *"This comparison uses the patient's own previous activity. Pattern insights are observations, not medical diagnoses."*
   - Weekly Response Time SVG Trend Chart (comparing against 45s baseline)
   - Response distribution breakdown (76% 1st attempt, 16% retry, 8% escalated)
   - Helpline call distribution

7. **Family & Escalation (`#escalation`)**:
   - 5-Step Escalation Protocol diagram (with ASHA marked "Future / Pilot")
   - Contact cards for Emma Patel, James Patel, and Dr. Ramesh Sharma

8. **Settings (`#settings`)**:
   - Caregiver profile configuration
   - Telephony voice settings (language, tone, caller ID)
   - Diagnostic table & Demo simulation triggers (Simulate reminder call, simulate helpline query, reset demo data)

9. **Interactive Senior Phone IVR Simulator**:
   - Simulates a basic Nokia feature phone ringing
   - Plays spoken audio voice prompt via Web Speech API / visual transcript
   - Allows caregiver to press keypad `1` to confirm or simulate no-response timeout
   - Updates dashboard in real-time to "Reported Taken"

---

## How to Run Locally

You can run the application using Node.js or any static file server:

### Option 1: Using the Existing Node Server
```bash
node server.js
```
Then open in your browser:
- Desktop Dashboard: `http://localhost:3000/desktop/index.html` (or `http://localhost:3000/pc/index.html`)
- Original Mobile Showcase: `http://localhost:3000/index.html`

### Option 2: Direct File Open
Simply double-click or open `desktop/index.html` in Chrome, Edge, Firefox, or Safari.

---

## Backend REST API Endpoints Specification

When connecting to a production backend, `services/api.js` connects to the following REST endpoints:

- `GET /api/patients` — List all registered patients
- `POST /api/patients` — Register new senior patient
- `GET /api/medicines` — List medication schedules
- `POST /api/medicines` — Add new scheduled dose
- `DELETE /api/medicines/:id` — Delete medication schedule
- `GET /api/schedule/today` — Retrieve today's medication reminder status
- `PATCH /api/schedule/:id` — Update status (e.g. "Reported Taken")
- `GET /api/calls` — Retrieve call log history
- `POST /api/calls` — Log automated call event
- `GET /api/alerts` — Retrieve active alerts
- `PATCH /api/alerts/:id/resolve` — Mark alert as resolved
- `GET /api/insights` — Retrieve aggregated adherence & response latency metrics
- `GET /api/system/health` — Retrieve telephony & scheduler health diagnostics
