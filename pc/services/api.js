/**
 * DawaDhwani Desktop Caregiver Platform
 * Service Layer & API Client (REST ready with local persistence & demo fallback)
 * 
 * SAFETY PRINCIPLES:
 * - Records "Reported Taken" via IVR keypad confirmation.
 * - Never claims physical ingestion or medical diagnosis.
 * - All pattern alerts are comparative observations vs baseline activity.
 */

const STORAGE_KEYS = {
  PATIENTS: 'dawadhwani_patients',
  MEDICINES: 'dawadhwani_medicines',
  SCHEDULE: 'dawadhwani_today_schedule',
  CALL_LOGS: 'dawadhwani_call_logs',
  ALERTS: 'dawadhwani_alerts',
  SETTINGS: 'dawadhwani_settings'
};

// Initial Seed Data
const SEED_PATIENTS = [
  {
    id: 'P01',
    name: 'Lakshmi Devi',
    age: 72,
    gender: 'Female',
    phone: '+91 98451 22341',
    phoneType: 'Nokia 105 (Feature Phone - Basic Keypad)',
    language: 'Telugu / Hindi IVR',
    address: 'Flat 302, Green Glen Layout, Bengaluru',
    caregiver: 'Emma Patel (Daughter-in-law)',
    caregiverPhone: '+91 98765 43210',
    helplinePin: '4122',
    systemStatus: 'System Active',
    avatar: 'assets/anita.jpg', // Existing photo asset
    notes: 'Mild cognitive decline. Responds reliably to morning reminder calls.',
    nextMedicine: '01:00 PM Sugar Tablet',
    lastResponse: '8:05 AM (Keypad 1)',
    stats: {
      totalRemindersThisMonth: 62,
      reportedTakenOnFirstAttempt: '88%',
      unusualPatternAlerts: 1
    }
  },
  {
    id: 'P02',
    name: 'Ravi Kumar',
    age: 68,
    gender: 'Male',
    phone: '+91 98452 33452',
    phoneType: 'Samsung Guru 1200 (Basic Phone)',
    language: 'Hindi / English IVR',
    address: '14th Cross, Malleshwaram, Bengaluru',
    caregiver: 'Emma Patel (Niece)',
    caregiverPhone: '+91 98765 43210',
    helplinePin: '3345',
    systemStatus: 'System Active',
    avatar: 'assets/james.jpg', // Existing photo asset
    notes: 'Hypertension management. Prefers Hindi voice prompts with warm pacing.',
    nextMedicine: '08:00 PM BP Tablet',
    lastResponse: 'Yesterday 8:02 PM (Keypad 1)',
    stats: {
      totalRemindersThisMonth: 58,
      reportedTakenOnFirstAttempt: '94%',
      unusualPatternAlerts: 0
    }
  },
  {
    id: 'P03',
    name: 'Anita Patel',
    age: 74,
    gender: 'Female',
    phone: '+91 98453 44563',
    phoneType: 'Itel Magic 2 (Feature Landline/Mobile)',
    language: 'Gujarati / Hindi IVR',
    address: 'B-12 Shanti Niketan, Indiranagar, Bengaluru',
    caregiver: 'Emma Patel (Daughter)',
    caregiverPhone: '+91 98765 43210',
    helplinePin: '7789',
    systemStatus: 'System Active',
    avatar: 'assets/sophia.jpg', // Existing photo asset
    notes: 'Early-stage Alzheimer’s. Often calls IVR helpline to ask if she took morning dose.',
    nextMedicine: '02:00 PM Heart Pill',
    lastResponse: '08:02 AM (Keypad 1)',
    stats: {
      totalRemindersThisMonth: 60,
      reportedTakenOnFirstAttempt: '90%',
      unusualPatternAlerts: 1
    }
  }
];

const SEED_MEDICINES = [
  {
    id: 'M01',
    patientId: 'P01',
    patientName: 'Lakshmi Devi',
    name: 'BP Tablet (Amlodipine)',
    dose: '1 tablet (5mg)',
    scheduleTime: '08:00 AM',
    frequency: 'Once Daily (Morning)',
    habitCue: 'After morning chai',
    reminderLanguage: 'Telugu',
    status: 'Active',
    maxRetries: 2,
    retryInterval: '15 mins',
    instructions: 'Remind with gentle tone. Prompt for keypad 1 upon taking.'
  },
  {
    id: 'M02',
    patientId: 'P01',
    patientName: 'Lakshmi Devi',
    name: 'Sugar Tablet (Metformin)',
    dose: '1 tablet (500mg)',
    scheduleTime: '01:00 PM',
    frequency: 'Once Daily (Afternoon)',
    habitCue: 'Right after lunch',
    reminderLanguage: 'Telugu',
    status: 'Active',
    maxRetries: 2,
    retryInterval: '15 mins',
    instructions: 'Remind to take with food.'
  },
  {
    id: 'M03',
    patientId: 'P01',
    patientName: 'Lakshmi Devi',
    name: 'Joint Care Calcium',
    dose: '1 tablet (500mg)',
    scheduleTime: '02:00 PM',
    frequency: 'Once Daily (Post lunch)',
    habitCue: 'Post lunch rest',
    reminderLanguage: 'Telugu',
    status: 'Active',
    maxRetries: 2,
    retryInterval: '15 mins',
    instructions: 'Take with warm water.'
  },
  {
    id: 'M04',
    patientId: 'P02',
    patientName: 'Ravi Kumar',
    name: 'Multivitamin & Zinc',
    dose: '1 capsule',
    scheduleTime: '08:30 AM',
    frequency: 'Once Daily (Morning)',
    habitCue: 'After breakfast',
    reminderLanguage: 'Hindi',
    status: 'Active',
    maxRetries: 2,
    retryInterval: '10 mins',
    instructions: 'Morning nutritional support.'
  },
  {
    id: 'M05',
    patientId: 'P02',
    patientName: 'Ravi Kumar',
    name: 'BP Tablet (Telmisartan)',
    dose: '1 tablet (40mg)',
    scheduleTime: '08:00 PM',
    frequency: 'Once Daily (Evening)',
    habitCue: 'Before dinner',
    reminderLanguage: 'Hindi',
    status: 'Active',
    maxRetries: 2,
    retryInterval: '15 mins',
    instructions: 'Evening blood pressure maintenance.'
  },
  {
    id: 'M06',
    patientId: 'P03',
    patientName: 'Anita Patel',
    name: 'Metformin 500mg',
    dose: '1 tablet',
    scheduleTime: '08:00 AM',
    frequency: 'Once Daily (Morning)',
    habitCue: 'With breakfast',
    reminderLanguage: 'Hindi',
    status: 'Active',
    maxRetries: 2,
    retryInterval: '15 mins',
    instructions: 'Blood sugar morning routine.'
  },
  {
    id: 'M07',
    patientId: 'P03',
    patientName: 'Anita Patel',
    name: 'Heart Pill (Ecosprin)',
    dose: '1 tablet (75mg)',
    scheduleTime: '02:00 PM',
    frequency: 'Once Daily (Afternoon)',
    habitCue: 'After afternoon rest',
    reminderLanguage: 'Hindi',
    status: 'Active',
    maxRetries: 2,
    retryInterval: '15 mins',
    instructions: 'Cardiovascular care.'
  },
  {
    id: 'M08',
    patientId: 'P03',
    patientName: 'Anita Patel',
    name: 'Neuro & Sleep Care',
    dose: '1 tablet',
    scheduleTime: '08:30 PM',
    frequency: 'Once Daily (Bedtime)',
    habitCue: 'Before bedtime with warm water',
    reminderLanguage: 'Hindi',
    status: 'Active',
    maxRetries: 2,
    retryInterval: '15 mins',
    instructions: 'Evening calming support.'
  }
];

const SEED_TODAY_SCHEDULE = [
  {
    id: 'SCH-01',
    time: '08:00 AM',
    patientId: 'P01',
    patientName: 'Lakshmi Devi',
    medicineName: 'BP Tablet (Amlodipine)',
    dose: '1 tablet',
    status: 'Reported Taken',
    statusTime: '08:05 AM',
    attempts: 1,
    keypadInput: '1',
    habitCue: 'After morning chai',
    notes: 'Keypad confirmed on first attempt'
  },
  {
    id: 'SCH-02',
    time: '08:00 AM',
    patientId: 'P03',
    patientName: 'Anita Patel',
    medicineName: 'Metformin 500mg',
    dose: '1 tablet',
    status: 'Reported Taken',
    statusTime: '08:02 AM',
    attempts: 1,
    keypadInput: '1',
    habitCue: 'With breakfast',
    notes: 'Keypad confirmed immediately'
  },
  {
    id: 'SCH-03',
    time: '08:30 AM',
    patientId: 'P02',
    patientName: 'Ravi Kumar',
    medicineName: 'Multivitamin & Zinc',
    dose: '1 capsule',
    status: 'Reported Taken',
    statusTime: '08:31 AM',
    attempts: 1,
    keypadInput: '1',
    habitCue: 'After breakfast',
    notes: 'Keypad confirmed on first attempt'
  },
  {
    id: 'SCH-04',
    time: '01:00 PM',
    patientId: 'P01',
    patientName: 'Lakshmi Devi',
    medicineName: 'Sugar Tablet (Metformin)',
    dose: '1 tablet',
    status: 'Reported Taken',
    statusTime: '01:06 PM',
    attempts: 1,
    keypadInput: '1',
    habitCue: 'Right after lunch',
    notes: 'Keypad confirmed at 01:06 PM'
  },
  {
    id: 'SCH-05',
    time: '02:00 PM',
    patientId: 'P01',
    patientName: 'Lakshmi Devi',
    medicineName: 'Joint Care Calcium',
    dose: '1 tablet',
    status: 'No Response',
    statusTime: '02:18 PM',
    attempts: 2,
    keypadInput: 'None',
    habitCue: 'Post lunch rest',
    notes: 'No response after 2 automated attempts. Caregiver notified.'
  },
  {
    id: 'SCH-06',
    time: '02:00 PM',
    patientId: 'P03',
    patientName: 'Anita Patel',
    medicineName: 'Heart Pill (Ecosprin)',
    dose: '1 tablet',
    status: 'Calling',
    statusTime: 'In Progress',
    attempts: 1,
    keypadInput: 'Awaiting',
    habitCue: 'After afternoon rest',
    notes: 'IVR automated reminder call connected'
  },
  {
    id: 'SCH-07',
    time: '08:00 PM',
    patientId: 'P02',
    patientName: 'Ravi Kumar',
    medicineName: 'BP Tablet (Telmisartan)',
    dose: '1 tablet',
    status: 'Upcoming',
    statusTime: 'Scheduled',
    attempts: 0,
    keypadInput: '—',
    habitCue: 'Before dinner',
    notes: 'Call scheduled at 08:00 PM'
  },
  {
    id: 'SCH-08',
    time: '08:30 PM',
    patientId: 'P03',
    patientName: 'Anita Patel',
    medicineName: 'Neuro & Sleep Care',
    dose: '1 tablet',
    status: 'Upcoming',
    statusTime: 'Scheduled',
    attempts: 0,
    keypadInput: '—',
    habitCue: 'Before bedtime with warm water',
    notes: 'Call scheduled at 08:30 PM'
  }
];

const SEED_CALL_LOGS = [
  {
    id: 'CALL-101',
    time: 'Today, 08:00 AM',
    patientId: 'P01',
    patientName: 'Lakshmi Devi',
    phone: '+91 98451 22341',
    direction: 'Outgoing',
    callType: 'Medicine Reminder',
    attempt: '1 of 2',
    keyPressed: '1',
    duration: '42s',
    result: 'Reported Taken',
    transcript: 'Voice Prompt (Telugu): "Namaste Lakshmi garu, this is DawaDhwani. Please take your BP Tablet (1 tablet). Press 1 on your keypad after taking." -> Key 1 received -> "Dhanyavaad, recorded as Reported Taken."'
  },
  {
    id: 'CALL-102',
    time: 'Today, 08:01 AM',
    patientId: 'P03',
    patientName: 'Anita Patel',
    phone: '+91 98453 44563',
    direction: 'Outgoing',
    callType: 'Medicine Reminder',
    attempt: '1 of 2',
    keyPressed: '1',
    duration: '38s',
    result: 'Reported Taken',
    transcript: 'Voice Prompt (Hindi): "Namaste Anita ji, DawaDhwani reminder: Please take Metformin 500mg with breakfast. Press 1 when taken." -> Key 1 received -> "Shukriya, recorded as Reported Taken."'
  },
  {
    id: 'CALL-103',
    time: 'Today, 08:30 AM',
    patientId: 'P02',
    patientName: 'Ravi Kumar',
    phone: '+91 98452 33452',
    direction: 'Outgoing',
    callType: 'Medicine Reminder',
    attempt: '1 of 2',
    keyPressed: '1',
    duration: '35s',
    result: 'Reported Taken',
    transcript: 'Voice Prompt (Hindi): "Namaste Ravi ji, please take your Multivitamin capsule. Press 1 when completed." -> Key 1 received -> Recorded Reported Taken.'
  },
  {
    id: 'CALL-104',
    time: 'Today, 01:00 PM',
    patientId: 'P01',
    patientName: 'Lakshmi Devi',
    phone: '+91 98451 22341',
    direction: 'Outgoing',
    callType: 'Medicine Reminder',
    attempt: '1 of 2',
    keyPressed: '1',
    duration: '50s',
    result: 'Reported Taken',
    transcript: 'Voice Prompt (Telugu): "Namaste Lakshmi garu, please take your Sugar Tablet after lunch. Press 1 when taken." -> Key 1 received at 01:06 PM.'
  },
  {
    id: 'CALL-105',
    time: 'Today, 02:00 PM',
    patientId: 'P01',
    patientName: 'Lakshmi Devi',
    phone: '+91 98451 22341',
    direction: 'Outgoing',
    callType: 'Medicine Reminder',
    attempt: '1 of 2',
    keyPressed: '—',
    duration: '30s',
    result: 'No Response',
    transcript: 'Voice Prompt (Telugu): Call rang for 30s. No answer. Scheduled retry in 15 minutes.'
  },
  {
    id: 'CALL-106',
    time: 'Today, 02:15 PM',
    patientId: 'P01',
    patientName: 'Lakshmi Devi',
    phone: '+91 98451 22341',
    direction: 'Outgoing',
    callType: 'Medicine Reminder (Retry)',
    attempt: '2 of 2',
    keyPressed: '—',
    duration: '32s',
    result: 'No Response (Escalated)',
    transcript: 'Call answered, prompt played: "Namaste Lakshmi garu... Press 1 when taken." No keypad input detected. Max retries reached. Caregiver alert dispatched.'
  },
  {
    id: 'CALL-107',
    time: 'Today, 03:20 PM',
    patientId: 'P03',
    patientName: 'Anita Patel',
    phone: '+91 98453 44563',
    direction: 'Incoming',
    callType: 'Helpline Self-Inquiry',
    attempt: '—',
    keyPressed: '1',
    duration: '1m 12s',
    result: 'Medication Status Request',
    transcript: 'Patient called IVR Helpline: "Did I take my medicine?" System queried recorded log and replied: "Namaste Anita ji. Your Metformin was Reported Taken at 8:02 AM today. Your next medicine is scheduled for 8:30 PM."'
  },
  {
    id: 'CALL-108',
    time: 'Yesterday, 08:00 PM',
    patientId: 'P02',
    patientName: 'Ravi Kumar',
    phone: '+91 98452 33452',
    direction: 'Outgoing',
    callType: 'Medicine Reminder',
    attempt: '1 of 2',
    keyPressed: '1',
    duration: '40s',
    result: 'Reported Taken',
    transcript: 'Voice Prompt (Hindi): "Namaste Ravi ji, please take your BP tablet before dinner. Press 1 when taken." -> Key 1 received.'
  }
];

const SEED_ALERTS = [
  {
    id: 'ALT-01',
    type: 'Needs Attention',
    severity: 'high',
    patientId: 'P01',
    patientName: 'Lakshmi Devi',
    time: 'Today, 02:18 PM',
    title: 'No response to medication reminder after 2 attempts',
    description: 'Lakshmi Devi did not respond to the 2:00 PM reminder for Joint Care Calcium after 2 scheduled attempts.',
    safetyNote: 'Reminder call attempt completed. No physical safety or ingestion claim is made.',
    status: 'Unresolved',
    actionRequired: 'Call patient or family contact',
    escalationStep: 'Level 3: Family Caregiver Alert Dispatched'
  },
  {
    id: 'ALT-02',
    type: 'Unusual Response Pattern',
    severity: 'medium',
    patientId: 'P03',
    patientName: 'Anita Patel',
    time: 'Today, 09:30 AM',
    title: 'Pattern alert: Response delay increase',
    description: 'Response time has been longer than this patient’s usual pattern over the last 3 days (average 145s vs 40s baseline).',
    safetyNote: 'This comparison uses the patient’s own previous activity. This is an observation, not a medical diagnosis.',
    status: 'Unresolved',
    actionRequired: 'Review response history',
    escalationStep: 'Informational observation for caregiver'
  },
  {
    id: 'ALT-03',
    type: 'Helpline Inquiry',
    severity: 'low',
    patientId: 'P03',
    patientName: 'Anita Patel',
    time: 'Today, 03:20 PM',
    title: 'Senior called Helpline: "Did I take my medicine?"',
    description: 'Anita called the toll-free IVR helpline to verify her dose. System answered using the recorded reported status from 8:02 AM.',
    safetyNote: 'Reported status provided to senior over phone.',
    status: 'Resolved',
    actionRequired: 'None (Self-served inquiry)',
    escalationStep: 'Logged for caregiver visibility'
  },
  {
    id: 'ALT-04',
    type: 'Repeated Calls',
    severity: 'medium',
    patientId: 'P02',
    patientName: 'Ravi Kumar',
    time: 'Yesterday, 08:15 PM',
    title: 'Required second retry call before confirmation',
    description: 'Ravi required 2 reminder calls for evening BP tablet before keypad 1 was pressed.',
    safetyNote: 'Reported Taken on retry attempt #2.',
    status: 'Resolved',
    actionRequired: 'Review schedule timing',
    escalationStep: 'Resolved automatically'
  }
];

const SEED_INSIGHTS = {
  disclaimer: 'This comparison uses each patient\'s own previous activity. Pattern insights are observations, not medical diagnoses.',
  overallStats: {
    averageResponseTime: '1.8 min',
    baselineComparison: '+18s vs 30-day baseline',
    reportedTakenFirstAttemptRate: '91.2%',
    helplineInquiriesThisMonth: 14,
    escalationRate: '3.1%'
  },
  weeklyTrend: [
    { day: 'Mon', avgSeconds: 42, baseline: 45, status: 'Normal' },
    { day: 'Tue', avgSeconds: 38, baseline: 45, status: 'Normal' },
    { day: 'Wed', avgSeconds: 49, baseline: 45, status: 'Normal' },
    { day: 'Thu', avgSeconds: 78, baseline: 45, status: 'Slight Delay' },
    { day: 'Fri', avgSeconds: 112, baseline: 45, status: 'Unusual Delay' },
    { day: 'Sat', avgSeconds: 95, baseline: 45, status: 'Slight Delay' },
    { day: 'Sun', avgSeconds: 65, baseline: 45, status: 'Normal' }
  ],
  responseDistribution: {
    reportedTakenFirstAttempt: 76,
    reportedTakenRetry: 16,
    noResponseEscalated: 8
  },
  helplineCallTimes: [
    { timeSlot: 'Morning (08:00 - 11:00)', count: 2 },
    { timeSlot: 'Mid-Day (11:00 - 14:00)', count: 3 },
    { timeSlot: 'Afternoon (14:00 - 17:00)', count: 7 },
    { timeSlot: 'Evening (17:00 - 21:00)', count: 2 }
  ]
};

const SEED_ESCALATION = {
  primaryCaregiver: {
    name: 'Emma Patel',
    role: 'Primary Family Coordinator',
    relation: 'Daughter / Designated Caregiver',
    phone: '+91 98765 43210',
    email: 'emma.patel@caregiver.dawadhwani.in',
    channels: ['Push Notification', 'SMS Alert', 'Voice Call'],
    active: true
  },
  familyMembers: [
    {
      name: 'James Patel',
      relation: 'Son',
      phone: '+91 98765 11223',
      channels: ['SMS Alert'],
      active: true
    },
    {
      name: 'Sophia Patel',
      relation: 'Granddaughter',
      phone: '+91 98765 99887',
      channels: ['SMS Alert'],
      active: true
    }
  ],
  backupContact: {
    name: 'Dr. Ramesh Sharma',
    relation: 'Family Physician & Neighbor',
    phone: '+91 98450 11223',
    notes: 'To be contacted only if primary caregiver cannot be reached within 30 minutes.'
  },
  communityContact: {
    name: 'ASHA Health Worker Integration',
    status: 'Future / Pilot',
    note: 'Community health worker link is currently in pilot study. Not active for standard dispatch.'
  },
  protocolSteps: [
    { step: 1, title: 'Scheduled Voice Call', desc: 'System calls basic feature phone at exact time in chosen language.' },
    { step: 2, title: 'Automated Retry', desc: 'If no answer or keypress within 15 minutes, a second call is placed.' },
    { step: 3, title: 'Primary Caregiver Alert', desc: 'If still unanswered, instant SMS and dashboard alert to Emma Patel.' },
    { step: 4, title: 'Backup Contact Escalation', desc: 'If unacknowledged for 30 minutes, backup neighbor/family alerted.' },
    { step: 5, title: 'Community Health Link', desc: 'Future / Pilot integration (currently non-active demonstration).' }
  ]
};

const SEED_SETTINGS = {
  caregiverName: 'Emma Patel',
  caregiverEmail: 'emma.patel@caregiver.dawadhwani.in',
  caregiverPhone: '+91 98765 43210',
  defaultLanguage: 'Hindi',
  voiceGender: 'Warm & Empathetic Female Voice',
  callerId: 'DawaDhwani Reminder (+91 80 4012 3456)',
  helplineNumber: '1800-202-DAWA (1800-202-3292)',
  retryIntervalMinutes: 15,
  maxRetryCount: 2,
  soundAlerts: true
};

class ApiService {
  constructor() {
    this.initStorage();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(SEED_PATIENTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MEDICINES)) {
      localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(SEED_MEDICINES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SCHEDULE)) {
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(SEED_TODAY_SCHEDULE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CALL_LOGS)) {
      localStorage.setItem(STORAGE_KEYS.CALL_LOGS, JSON.stringify(SEED_CALL_LOGS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(SEED_ALERTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(SEED_SETTINGS));
    }
  }

  // --- Patients API ---
  async getPatients() {
    const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    return data ? JSON.parse(data) : SEED_PATIENTS;
  }

  async getPatientById(id) {
    const patients = await this.getPatients();
    return patients.find(p => p.id === id) || null;
  }

  async addPatient(patientData) {
    const patients = await this.getPatients();
    const newPatient = {
      id: 'P' + String(patients.length + 1).padStart(2, '0'),
      name: patientData.name,
      age: parseInt(patientData.age, 10),
      gender: patientData.gender || 'Not specified',
      phone: patientData.phone,
      phoneType: patientData.phoneType || 'Basic Feature Phone',
      language: patientData.language || 'Hindi IVR',
      address: patientData.address || 'Address on file',
      caregiver: 'Emma Patel (Primary Coordinator)',
      caregiverPhone: '+91 98765 43210',
      helplinePin: String(Math.floor(1000 + Math.random() * 9000)),
      systemStatus: 'System Active',
      avatar: 'assets/anita.jpg',
      notes: patientData.notes || 'Caregiver registered patient.',
      nextMedicine: 'None scheduled yet',
      lastResponse: 'Newly registered',
      stats: {
        totalRemindersThisMonth: 0,
        reportedTakenOnFirstAttempt: '100%',
        unusualPatternAlerts: 0
      }
    };
    patients.push(newPatient);
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
    return newPatient;
  }

  // --- Medicines API ---
  async getMedicines() {
    const data = localStorage.getItem(STORAGE_KEYS.MEDICINES);
    return data ? JSON.parse(data) : SEED_MEDICINES;
  }

  async addMedicine(medicineData) {
    const medicines = await this.getMedicines();
    const newMed = {
      id: 'M' + String(medicines.length + 1).padStart(2, '0'),
      patientId: medicineData.patientId,
      patientName: medicineData.patientName,
      name: medicineData.name,
      dose: medicineData.dose,
      scheduleTime: medicineData.scheduleTime,
      frequency: medicineData.frequency || 'Once Daily',
      habitCue: medicineData.habitCue || 'After meal',
      reminderLanguage: medicineData.reminderLanguage || 'Hindi',
      status: 'Active',
      maxRetries: parseInt(medicineData.maxRetries || 2, 10),
      retryInterval: medicineData.retryInterval || '15 mins',
      instructions: medicineData.instructions || 'Standard caregiver reminder.'
    };
    medicines.push(newMed);
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));

    // Also inject into today's schedule for immediate demonstration!
    await this.addScheduleItem({
      time: medicineData.scheduleTime,
      patientId: medicineData.patientId,
      patientName: medicineData.patientName,
      medicineName: medicineData.name,
      dose: medicineData.dose,
      status: 'Upcoming',
      statusTime: 'Scheduled',
      attempts: 0,
      keypadInput: '—',
      habitCue: medicineData.habitCue || 'After meal',
      notes: 'Scheduled by caregiver'
    });

    return newMed;
  }

  async deleteMedicine(id) {
    let medicines = await this.getMedicines();
    medicines = medicines.filter(m => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEDICINES, JSON.stringify(medicines));
    return true;
  }

  // --- Schedule API ---
  async getSchedule() {
    const data = localStorage.getItem(STORAGE_KEYS.SCHEDULE);
    return data ? JSON.parse(data) : SEED_TODAY_SCHEDULE;
  }

  async addScheduleItem(item) {
    const schedule = await this.getSchedule();
    const newEntry = {
      id: 'SCH-' + String(schedule.length + 1).padStart(2, '0'),
      ...item
    };
    schedule.push(newEntry);
    localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
    return newEntry;
  }

  async updateScheduleStatus(id, newStatus, keypad = '1', note = '') {
    const schedule = await this.getSchedule();
    const item = schedule.find(s => s.id === id);
    if (item) {
      item.status = newStatus;
      item.statusTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      item.keypadInput = keypad;
      if (newStatus === 'Reported Taken') {
        item.attempts = Math.max(1, item.attempts);
        item.notes = note || `Keypad confirmed at ${item.statusTime}`;
      } else if (newStatus === 'No Response') {
        item.attempts = 2;
        item.notes = note || 'No keypad input received after 2 attempts';
      }
      localStorage.setItem(STORAGE_KEYS.SCHEDULE, JSON.stringify(schedule));
    }
    return item;
  }

  // --- Call Logs API ---
  async getCallLogs() {
    const data = localStorage.getItem(STORAGE_KEYS.CALL_LOGS);
    return data ? JSON.parse(data) : SEED_CALL_LOGS;
  }

  async addCallLog(logData) {
    const logs = await this.getCallLogs();
    const newLog = {
      id: 'CALL-' + String(100 + logs.length + 1),
      time: 'Just now (' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')',
      ...logData
    };
    logs.unshift(newLog); // latest on top
    localStorage.setItem(STORAGE_KEYS.CALL_LOGS, JSON.stringify(logs));
    return newLog;
  }

  // --- Alerts API ---
  async getAlerts() {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    return data ? JSON.parse(data) : SEED_ALERTS;
  }

  async resolveAlert(id) {
    const alerts = await this.getAlerts();
    const alert = alerts.find(a => a.id === id);
    if (alert) {
      alert.status = 'Resolved';
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
    }
    return alert;
  }

  // --- Insights API ---
  async getInsights() {
    return SEED_INSIGHTS;
  }

  // --- Family & Escalation API ---
  async getEscalationInfo() {
    return SEED_ESCALATION;
  }

  // --- Settings API ---
  async getSettings() {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : SEED_SETTINGS;
  }

  async updateSettings(settings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    return settings;
  }

  // --- System Status API ---
  async getSystemStatus() {
    return {
      status: 'Operational',
      subsystems: {
        scheduler: { name: 'IVR Cron Scheduler', status: 'Operational', latency: '12ms' },
        telephony: { name: 'SIP Voice Gateway', status: 'Operational', trunks: '4 Active' },
        database: { name: 'Encrypted Care Data', status: 'Operational', storage: 'Healthy' },
        alerts: { name: 'Escalation Alert Engine', status: 'Operational', dispatch: 'Instant' }
      },
      lastHeartbeat: new Date().toLocaleTimeString()
    };
  }

  // Reset to initial demo seed
  resetDemoData() {
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.MEDICINES);
    localStorage.removeItem(STORAGE_KEYS.SCHEDULE);
    localStorage.removeItem(STORAGE_KEYS.CALL_LOGS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    this.initStorage();
  }
}

// Global Export
window.dawaApi = new ApiService();
