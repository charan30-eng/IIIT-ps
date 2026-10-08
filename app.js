/**
 * Eldora Mobile Healthcare App Redesign
 * Interactive Studio Controller & State Management
 */

// State variables
let currentZoom = 0.90;
let isSeniorMode = false;
let isCaregiverPerspective = false;
let metforminConfirmed = false;
let toastTimeout = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  updateZoomUI();
});

/**
 * Zoom Controls
 */
function adjustZoom(delta) {
  currentZoom = Math.min(1.3, Math.max(0.6, currentZoom + delta));
  applyZoom();
}

function resetZoom() {
  currentZoom = 0.90;
  applyZoom();
}

function applyZoom() {
  const container = document.getElementById('screens-container');
  if (container) {
    container.style.transform = `scale(${currentZoom.toFixed(2)})`;
  }
  updateZoomUI();
}

function updateZoomUI() {
  const zoomText = document.getElementById('zoom-text');
  if (zoomText) {
    zoomText.textContent = `${Math.round(currentZoom * 100)}%`;
  }
}

/**
 * Focus and scroll smoothly to a specific device screen
 */
function focusDevice(screenKey) {
  const idMap = {
    'splash': 'col-screen-splash',
    'home': 'col-screen-home',
    'health': 'col-screen-health',
    'medication': 'col-screen-medication',
    'connect': 'col-screen-connect'
  };

  const targetId = idMap[screenKey];
  if (!targetId) return;

  const targetEl = document.getElementById(targetId);
  if (targetEl) {
    targetEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    
    // Add subtle focus animation
    const device = targetEl.querySelector('.mobile-device');
    if (device) {
      device.style.transition = 'transform 0.25s ease, box-shadow 0.25s ease';
      device.style.transform = 'translateY(-8px) scale(1.02)';
      setTimeout(() => {
        device.style.transform = '';
      }, 350);
    }
  }
}

/**
 * Senior Accessibility Mode Toggle
 */
function toggleSeniorMode() {
  isSeniorMode = !isSeniorMode;
  const body = document.body;
  const toggleBtn = document.getElementById('senior-mode-toggle');

  if (isSeniorMode) {
    body.classList.add('senior-mode');
    toggleBtn.classList.add('active');
    showToast('Senior Mode Enabled: +15% text scale & enhanced contrast');
  } else {
    body.classList.remove('senior-mode');
    toggleBtn.classList.remove('active');
    showToast('Standard Mode Restored');
  }
}

/**
 * Caregiver Perspective Toggle
 */
function toggleCaregiverMode() {
  isCaregiverPerspective = !isCaregiverPerspective;
  const roleLabel = document.getElementById('role-label');
  const greetingTitle = document.getElementById('greeting-title');
  const patientSub = document.getElementById('patient-sub');
  const caregiverTag = document.getElementById('caregiver-context-tag');

  if (isCaregiverPerspective) {
    roleLabel.textContent = 'View: Emma (Caregiver)';
    if (greetingTitle) greetingTitle.textContent = 'Caregiver Dashboard 👋';
    if (patientSub) patientSub.textContent = 'Monitoring Mom (Anita Patel, 74)';
    if (caregiverTag) caregiverTag.textContent = 'Caregiver Role: Primary Coordinator';
    showToast('Switched to Caregiver View: Emma (Daughter)');
  } else {
    roleLabel.textContent = 'View: Anita (Senior)';
    if (greetingTitle) greetingTitle.textContent = 'Good morning, Anita 👋';
    if (patientSub) patientSub.textContent = 'How are you feeling today?';
    if (caregiverTag) caregiverTag.textContent = 'Caregiver: Emma (Daughter)';
    showToast('Switched to Senior View: Anita');
  }
}

/**
 * Interactive Medication Confirmation
 */
function confirmMetforminDose() {
  if (metforminConfirmed) return;
  metforminConfirmed = true;

  const card = document.getElementById('card-metformin');
  const pill = document.getElementById('metformin-pill');
  const iconBox = document.getElementById('metformin-icon-box');
  const actionBar = document.getElementById('metformin-action-bar');
  const scheduleSummary = document.getElementById('med-schedule-summary');
  const pctText = document.getElementById('med-pct-text');
  const wellnessCircle = document.getElementById('wellness-circle');
  const wellnessScoreNum = document.getElementById('wellness-score-num');

  // Update card styling
  if (card) {
    card.classList.remove('status-pending');
    card.classList.add('status-confirmed');
  }

  // Update Pill Badge
  if (pill) {
    pill.className = 'status-pill confirmed';
    pill.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
      Confirmed
    `;
  }

  // Update Icon Box
  if (iconBox) {
    iconBox.className = 'med-pill-icon-box green';
    iconBox.innerHTML = `
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
    `;
  }

  // Update Action Bar
  if (actionBar) {
    actionBar.innerHTML = `
      <div class="btn-dose-confirmed">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        Taken just now (Logged)
      </div>
      <span class="caregiver-sync-label">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 10"/></svg>
        Emma notified
      </span>
    `;
  }

  // Update Progress Banner
  if (scheduleSummary) {
    scheduleSummary.textContent = '4 of 4 doses completed today • All on schedule!';
  }
  if (pctText) {
    pctText.textContent = '100%';
    pctText.style.color = '#FFFFFF';
  }

  // Boost Wellness Score from 85 to 92
  if (wellnessCircle) {
    wellnessCircle.style.strokeDashoffset = '19'; // 92%
  }
  if (wellnessScoreNum) {
    wellnessScoreNum.textContent = '92';
  }

  showToast('Metformin 500mg logged! Daily adherence is now 100%. Caregiver Emma notified.');
}

/**
 * Filter Medication Tabs
 */
function filterMedTab(btn, category) {
  const allTabs = document.querySelectorAll('.med-tab-chip');
  allTabs.forEach(tab => tab.classList.remove('active'));
  btn.classList.add('active');

  const allCards = document.querySelectorAll('.med-detail-card');
  allCards.forEach(card => {
    const cardTime = card.getAttribute('data-time');
    if (category === 'all' || cardTime === category) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });

  showToast(`Showing: ${btn.textContent} medications`);
}

/**
 * Mood selector on Home Dashboard
 */
function selectMood(chipEl, moodLabel) {
  const allChips = document.querySelectorAll('.mood-chip');
  allChips.forEach(c => c.classList.remove('active'));
  chipEl.classList.add('active');

  const pill = document.getElementById('wellness-pill-text');
  if (pill) {
    pill.textContent = 'Status: ' + moodLabel.split(' ')[0];
  }

  showToast(`Daily wellness check-in updated: ${moodLabel}`);
}

/**
 * Calendar day selector on Health Screen
 */
function selectCalDay(dayEl) {
  const allDays = document.querySelectorAll('.cal-day-col');
  allDays.forEach(d => d.classList.remove('active'));
  dayEl.classList.add('active');

  const dayNum = dayEl.querySelector('.cal-day-num').textContent;
  showToast(`Displaying health vitals for May ${dayNum}`);
}

/**
 * Design System Spec Modal Drawer
 */
function openSpecModal() {
  const modal = document.getElementById('spec-modal');
  if (modal) {
    modal.classList.add('open');
  }
}

function closeSpecModal() {
  const modal = document.getElementById('spec-modal');
  if (modal) {
    modal.classList.remove('open');
  }
}

function closeSpecModalOnBackdrop(e) {
  if (e.target && e.target.id === 'spec-modal') {
    closeSpecModal();
  }
}

function switchStudioView(mode) {
  const btnPanorama = document.getElementById('btn-view-panorama');
  const btnInspect = document.getElementById('btn-view-inspect');

  if (mode === 'panorama') {
    btnPanorama.classList.add('active');
    btnInspect.classList.remove('active');
    closeSpecModal();
  } else if (mode === 'inspect') {
    openSpecModal();
  }
}

/**
 * Toast Notification System
 */
function showToast(message) {
  const toast = document.getElementById('studio-toast');
  const msgEl = document.getElementById('toast-message');

  if (!toast || !msgEl) return;

  msgEl.textContent = message;
  toast.classList.add('show');

  if (toastTimeout) {
    clearTimeout(toastTimeout);
  }

  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}
