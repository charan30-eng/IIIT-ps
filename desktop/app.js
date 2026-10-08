/**
 * DawaDhwani Desktop Caregiver Platform
 * Main Controller & View Router
 */

class DawaApp {
  constructor() {
    this.currentView = 'dashboard';
    this.selectedPatientId = null;
    this.currentPatientTab = 'timeline';
    this.isSidebarCollapsed = false;
    this.callLogsFilter = 'all';
    this.alertsFilter = 'all';
    this.patientsFilter = 'all';
  }

  async init() {
    this.setupNavigation();
    this.setupGlobalSearch();
    this.setupDropdowns();
    this.setupKeyboardShortcuts();
    
    // Check initial hash
    const initialHash = window.location.hash.replace('#', '') || 'dashboard';
    this.navigateTo(initialHash);

    // Initial render
    await this.refreshCurrentView();
  }

  // --- Router & Navigation ---
  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-view]');
    navItems.forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.getAttribute('data-view');
        this.navigateTo(view);
      });
    });

    window.addEventListener('hashchange', () => {
      const hash = window.location.hash.replace('#', '') || 'dashboard';
      if (hash.startsWith('patient-detail-')) {
        const pId = hash.replace('patient-detail-', '');
        this.openPatientDetail(pId);
      } else {
        this.navigateTo(hash, false);
      }
    });

    // Sidebar collapse toggle
    const toggleBtn = document.getElementById('sidebar-toggle');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => this.toggleSidebar());
    }
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('collapsed', this.isSidebarCollapsed);
    }
  }

  navigateTo(viewName, updateHash = true) {
    if (!viewName) viewName = 'dashboard';
    this.currentView = viewName;
    if (updateHash) {
      window.location.hash = viewName;
    }

    // Update active class on nav
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      if (item.getAttribute('data-view') === viewName) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Switch view sections
    document.querySelectorAll('.page-view').forEach(viewEl => {
      viewEl.classList.remove('active');
    });

    const activeEl = document.getElementById(`view-${viewName}`);
    if (activeEl) {
      activeEl.classList.add('active');
    }

    this.refreshCurrentView();
  }

  async refreshCurrentView() {
    switch (this.currentView) {
      case 'dashboard':
        await this.renderDashboard();
        break;
      case 'patients':
        await this.renderPatients();
        break;
      case 'patient-detail':
        await this.renderPatientDetail();
        break;
      case 'medicines':
        await this.renderMedicines();
        break;
      case 'calls':
        await this.renderCallLogs();
        break;
      case 'alerts':
        await this.renderAlerts();
        break;
      case 'insights':
        await this.renderInsights();
        break;
      case 'escalation':
        await this.renderEscalation();
        break;
      case 'settings':
        await this.renderSettings();
        break;
    }
    this.updateNotificationBadge();
  }

  // --- Global Search & Keyboard Shortcuts ---
  setupGlobalSearch() {
    const searchInput = document.getElementById('global-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        if (query.length > 1) {
          this.executeGlobalSearch(query);
        }
      });
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          searchInput.value = '';
          searchInput.blur();
        }
      });
    }
  }

  async executeGlobalSearch(query) {
    const patients = await window.dawaApi.getPatients();
    const medicines = await window.dawaApi.getMedicines();

    const matchedPatient = patients.find(p => p.name.toLowerCase().includes(query) || p.phone.includes(query));
    if (matchedPatient) {
      window.dawaToast.show(`Found Patient: ${matchedPatient.name}. Navigating...`, 'info', 2000);
      this.openPatientDetail(matchedPatient.id);
      return;
    }

    const matchedMed = medicines.find(m => m.name.toLowerCase().includes(query));
    if (matchedMed) {
      window.dawaToast.show(`Found Medicine: ${matchedMed.name} for ${matchedMed.patientName}.`, 'info', 2000);
      this.navigateTo('medicines');
    }
  }

  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      // Ctrl+K or Cmd+K focuses search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('global-search-input');
        if (searchInput) searchInput.focus();
      }
    });
  }

  // --- Dropdowns (Notifications & Profile) ---
  setupDropdowns() {
    const notifBtn = document.getElementById('notif-dropdown-btn');
    const notifPanel = document.getElementById('notif-dropdown-panel');
    const profileBtn = document.getElementById('profile-dropdown-btn');
    const profilePanel = document.getElementById('profile-dropdown-panel');

    if (notifBtn && notifPanel) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (profilePanel) profilePanel.classList.remove('active');
        notifPanel.classList.toggle('active');
        this.renderNotificationsDropdown();
      });
    }

    if (profileBtn && profilePanel) {
      profileBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (notifPanel) notifPanel.classList.remove('active');
        profilePanel.classList.toggle('active');
      });
    }

    // Close on outside click
    window.addEventListener('click', () => {
      if (notifPanel) notifPanel.classList.remove('active');
      if (profilePanel) profilePanel.classList.remove('active');
    });

    if (notifPanel) notifPanel.addEventListener('click', (e) => e.stopPropagation());
    if (profilePanel) profilePanel.addEventListener('click', (e) => e.stopPropagation());
  }

  async updateNotificationBadge() {
    const alerts = await window.dawaApi.getAlerts();
    const unresolved = alerts.filter(a => a.status === 'Unresolved');
    const badge = document.getElementById('topbar-notif-badge');
    const sidebarBadge = document.getElementById('sidebar-alerts-badge');

    if (badge) {
      badge.textContent = unresolved.length;
      badge.style.display = unresolved.length > 0 ? 'flex' : 'none';
    }
    if (sidebarBadge) {
      sidebarBadge.textContent = unresolved.length;
      sidebarBadge.style.display = unresolved.length > 0 ? 'inline-block' : 'none';
    }
  }

  async renderNotificationsDropdown() {
    const alerts = await window.dawaApi.getAlerts();
    const listEl = document.getElementById('notif-dropdown-list');
    if (!listEl) return;

    if (alerts.length === 0) {
      listEl.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-muted);">No new notifications</div>';
      return;
    }

    listEl.innerHTML = alerts.slice(0, 5).map(a => `
      <div class="dropdown-item ${a.status === 'Unresolved' ? 'unread' : ''}" onclick="window.dawaApp.navigateTo('alerts')">
        <div style="color: ${a.severity === 'high' ? 'var(--alert-primary)' : 'var(--amber-primary)'}; margin-top: 2px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <div style="flex: 1;">
          <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">${a.title}</div>
          <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${a.patientName} • ${a.time}</div>
        </div>
      </div>
    `).join('');
  }

  async markAllNotificationsRead() {
    const alerts = await window.dawaApi.getAlerts();
    for (const a of alerts) {
      await window.dawaApi.resolveAlert(a.id);
    }
    const notifPanel = document.getElementById('notif-dropdown-panel');
    if (notifPanel) notifPanel.classList.remove('active');
    await this.refreshCurrentView();
    window.dawaToast.show('All notifications marked as read', 'info');
  }

  // =========================================================================
  // VIEW 1: DASHBOARD
  // =========================================================================
  async renderDashboard() {
    const patients = await window.dawaApi.getPatients();
    const schedule = await window.dawaApi.getSchedule();
    const alerts = await window.dawaApi.getAlerts();

    // 1. Update 4 Top Stat Cards
    const totalPatients = patients.length;
    const totalScheduled = schedule.length;
    const reportedTakenCount = schedule.filter(s => s.status === 'Reported Taken').length;
    const needsAttentionCount = schedule.filter(s => s.status === 'No Response' || s.status === 'Calling').length + alerts.filter(a => a.status === 'Unresolved').length;

    const elPatientsCount = document.getElementById('stat-patients-count');
    const elScheduledCount = document.getElementById('stat-scheduled-count');
    const elReportedCount = document.getElementById('stat-reported-count');
    const elAttentionCount = document.getElementById('stat-attention-count');

    if (elPatientsCount) elPatientsCount.textContent = `${totalPatients} Active`;
    if (elScheduledCount) elScheduledCount.textContent = `${totalScheduled} Scheduled`;
    if (elReportedCount) elReportedCount.textContent = reportedTakenCount;
    if (elAttentionCount) elAttentionCount.textContent = needsAttentionCount;

    // 2. Render Today's Medications Table
    const tbody = document.getElementById('dashboard-schedule-tbody');
    if (tbody) {
      if (schedule.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No medicines scheduled for today.</td></tr>`;
      } else {
        tbody.innerHTML = schedule.map(item => {
          let badgeClass = 'status-grey';
          let statusIcon = '';

          if (item.status === 'Reported Taken') {
            badgeClass = 'status-green';
            statusIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`;
          } else if (item.status === 'Calling') {
            badgeClass = 'status-amber';
            statusIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>`;
          } else if (item.status === 'No Response') {
            badgeClass = 'status-red';
            statusIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
          } else {
            statusIcon = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 14 10"/></svg>`;
          }

          return `
            <tr>
              <td><strong>${item.time}</strong></td>
              <td>
                <span class="patient-table-link" onclick="window.dawaApp.openPatientDetail('${item.patientId}')" style="font-weight: 600; color: var(--green-primary); cursor: pointer;">
                  ${item.patientName}
                </span>
              </td>
              <td>${item.medicineName}</td>
              <td><span class="table-dose-pill">${item.dose}</span></td>
              <td>
                <span class="status-badge ${badgeClass}">
                  ${statusIcon}
                  ${item.status}
                </span>
              </td>
              <td>
                <span class="attempt-badge">${item.attempts} ${item.attempts === 1 ? 'attempt' : 'attempts'}</span>
              </td>
              <td>
                <div style="display: flex; gap: 6px;">
                  <button class="btn btn-secondary btn-sm" onclick="window.dawaApp.openPatientDetail('${item.patientId}')" title="View Patient Timeline">View</button>
                  <button class="btn btn-peach btn-sm" onclick="window.dawaIvr.openReminderCall(${JSON.stringify(item).replace(/"/g, '&quot;')})" title="Simulate Telephone IVR Call">Call</button>
                </div>
              </td>
            </tr>
          `;
        }).join('');
      }
    }

    // 3. Render Live IVR Monitor List
    const liveMonitorEl = document.getElementById('dashboard-live-call-list');
    if (liveMonitorEl) {
      const activeCalls = schedule.filter(s => s.status === 'Calling' || s.status === 'Upcoming').slice(0, 3);
      if (activeCalls.length === 0) {
        liveMonitorEl.innerHTML = `<div style="font-size: 13px; color: var(--text-muted); padding: 8px 0;">All scheduled calls for this session completed.</div>`;
      } else {
        liveMonitorEl.innerHTML = activeCalls.map(c => `
          <div class="active-call-feed-item">
            <div class="telephony-pulse-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            </div>
            <div class="feed-item-content">
              <div class="feed-patient-title">${c.patientName} — ${c.medicineName}</div>
              <div class="feed-patient-sub">Scheduled: ${c.time} • ${c.status}</div>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="window.dawaIvr.openReminderCall(${JSON.stringify(c).replace(/"/g, '&quot;')})">Trigger</button>
          </div>
        `).join('');
      }
    }

    // 4. Render Recent Attention Feed
    const alertsFeedEl = document.getElementById('dashboard-alerts-feed');
    if (alertsFeedEl) {
      const urgentAlerts = alerts.filter(a => a.severity === 'high' || a.severity === 'medium').slice(0, 2);
      if (urgentAlerts.length === 0) {
        alertsFeedEl.innerHTML = `<div style="font-size: 13px; color: var(--text-muted); padding: 8px 0;">No active high priority alerts.</div>`;
      } else {
        alertsFeedEl.innerHTML = urgentAlerts.map(a => `
          <div class="urgent-alert-item">
            <div class="urgent-alert-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            </div>
            <div class="urgent-alert-body">
              <strong>${a.title}</strong>
              <div>${a.description}</div>
              <div class="urgent-alert-actions">
                <button class="btn btn-secondary btn-sm" onclick="window.dawaApp.openPatientDetail('${a.patientId}')">View Patient</button>
                <button class="btn btn-peach btn-sm" onclick="window.dawaIvr.openReminderCall({patientName: '${a.patientName}', patientId: '${a.patientId}', medicineName: 'Reminder', dose: '1 dose', id: 'TEST'})">Call Patient</button>
              </div>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // =========================================================================
  // VIEW 2: PATIENTS PAGE
  // =========================================================================
  async renderPatients() {
    const patients = await window.dawaApi.getPatients();
    const container = document.getElementById('patients-grid-container');
    if (!container) return;

    let filtered = patients;
    if (this.patientsFilter === 'attention') {
      filtered = patients.filter(p => p.stats.unusualPatternAlerts > 0);
    }

    container.innerHTML = filtered.map(p => `
      <div class="patient-profile-card">
        <div>
          <div class="patient-card-top">
            <img src="${p.avatar}" alt="${p.name}" class="patient-card-avatar" onerror="this.src='assets/anita.jpg'">
            <div class="patient-main-info">
              <div class="patient-card-name">${p.name}</div>
              <div class="patient-card-sub">${p.age} years • ${p.language}</div>
              <span class="status-badge status-green" style="margin-top: 6px; font-size: 11px;">
                <span class="pulse-dot" style="width: 6px; height: 6px;"></span>
                ${p.systemStatus}
              </span>
            </div>
          </div>

          <div class="patient-card-details">
            <div class="patient-detail-line">
              <span>Phone (Keypad):</span>
              <strong>${p.phone}</strong>
            </div>
            <div class="patient-detail-line">
              <span>Next Medicine:</span>
              <strong>${p.nextMedicine}</strong>
            </div>
            <div class="patient-detail-line">
              <span>Last Reported:</span>
              <strong>${p.lastResponse}</strong>
            </div>
            <div class="patient-detail-line">
              <span>Helpline PIN:</span>
              <strong style="color: var(--peach-primary);">${p.helplinePin}</strong>
            </div>
          </div>
        </div>

        <div class="patient-card-actions">
          <button class="btn btn-primary btn-sm" style="flex: 1;" onclick="window.dawaApp.openPatientDetail('${p.id}')">
            View Profile
          </button>
          <button class="btn btn-peach btn-sm" onclick="window.dawaIvr.openReminderCall({patientName: '${p.name}', patientId: '${p.id}', medicineName: 'Prescribed Routine', dose: '1 dose', id: 'SCH-P'})" title="Simulate Reminder Call">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
            Call
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.dawaModals.openAddMedicineModal('${p.id}')" title="Schedule Medicine">
            + Med
          </button>
        </div>
      </div>
    `).join('');
  }

  filterPatients(filterKey) {
    this.patientsFilter = filterKey;
    document.querySelectorAll('.patient-chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filterKey);
    });
    this.renderPatients();
  }

  // =========================================================================
  // VIEW 3: PATIENT DETAIL PAGE
  // =========================================================================
  async openPatientDetail(patientId) {
    this.selectedPatientId = patientId;
    this.currentPatientTab = 'timeline';
    window.location.hash = `patient-detail-${patientId}`;
    this.navigateTo('patient-detail', false);
  }

  async renderPatientDetail() {
    const patient = await window.dawaApi.getPatientById(this.selectedPatientId || 'P01');
    if (!patient) return;

    // Set Hero Data
    const nameEl = document.getElementById('pt-detail-name');
    const subEl = document.getElementById('pt-detail-sub');
    const avatarEl = document.getElementById('pt-detail-avatar');
    const phoneEl = document.getElementById('pt-detail-phone');
    const pinEl = document.getElementById('pt-detail-pin');
    const caregiverEl = document.getElementById('pt-detail-caregiver');
    const breadcrumbNameEl = document.getElementById('pt-breadcrumb-name');

    if (nameEl) nameEl.textContent = patient.name;
    if (subEl) subEl.textContent = `${patient.age} years old • ${patient.gender} • ${patient.address}`;
    if (avatarEl) avatarEl.src = patient.avatar;
    if (phoneEl) phoneEl.textContent = patient.phone;
    if (pinEl) pinEl.textContent = `PIN: ${patient.helplinePin}`;
    if (caregiverEl) caregiverEl.textContent = patient.caregiver;
    if (breadcrumbNameEl) breadcrumbNameEl.textContent = patient.name;

    // Render Active Tab
    this.renderPatientTabContent(patient);
  }

  switchPatientTab(tabName) {
    this.currentPatientTab = tabName;
    document.querySelectorAll('.pt-tab-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tabName);
    });
    document.querySelectorAll('.patient-tab-content').forEach(panel => {
      panel.classList.toggle('active', panel.id === `pt-tab-${tabName}`);
    });
    this.renderPatientDetail();
  }

  async renderPatientTabContent(patient) {
    // 1. Timeline Tab
    const timelineEl = document.getElementById('pt-timeline-list');
    if (timelineEl) {
      const schedule = await window.dawaApi.getSchedule();
      const patientSchedule = schedule.filter(s => s.patientId === patient.id);

      if (patientSchedule.length === 0) {
        timelineEl.innerHTML = `<div style="color: var(--text-muted); padding: 12px 0;">No reminders logged today for ${patient.name}.</div>`;
      } else {
        timelineEl.innerHTML = patientSchedule.map(s => {
          let nodeColor = 'green';
          if (s.status === 'Calling') nodeColor = 'amber';
          else if (s.status === 'No Response') nodeColor = 'red';
          else if (s.status === 'Upcoming') nodeColor = 'grey';

          return `
            <div class="timeline-item">
              <div class="timeline-node ${nodeColor}"></div>
              <div class="timeline-card">
                <div class="timeline-time-label">${s.time} • Attempt: ${s.attempts} of 2</div>
                <div class="timeline-title">${s.medicineName} (${s.dose})</div>
                <div style="font-size: 13px; color: var(--text-secondary);">
                  Habit cue: <em>"${s.habitCue}"</em> • ${s.notes}
                </div>
                <div style="margin-top: 8px; display: flex; align-items: center; justify-content: space-between;">
                  <span class="status-badge ${s.status === 'Reported Taken' ? 'status-green' : s.status === 'No Response' ? 'status-red' : 'status-amber'}">
                    ${s.status}
                  </span>
                  <button class="btn btn-peach btn-sm" onclick="window.dawaIvr.openReminderCall(${JSON.stringify(s).replace(/"/g, '&quot;')})">
                    Test Call
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // 2. Medication History Tab
    const medHistoryEl = document.getElementById('pt-med-history-list');
    if (medHistoryEl) {
      const allMeds = await window.dawaApi.getMedicines();
      const patientMeds = allMeds.filter(m => m.patientId === patient.id);

      medHistoryEl.innerHTML = `
        <div style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 14px; font-weight: 600;">Active Prescriptions Registered by Caregiver (${patientMeds.length})</div>
          <button class="btn btn-primary btn-sm" onclick="window.dawaModals.openAddMedicineModal('${patient.id}')">+ Add Medicine</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dose</th>
                <th>Schedule</th>
                <th>Habit Cue</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${patientMeds.map(m => `
                <tr>
                  <td><strong>${m.name}</strong></td>
                  <td>${m.dose}</td>
                  <td>${m.scheduleTime} (${m.frequency})</td>
                  <td>${m.habitCue}</td>
                  <td><span class="status-badge status-green">Active</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // 3. Call History Tab
    const callHistoryEl = document.getElementById('pt-call-history-list');
    if (callHistoryEl) {
      const calls = await window.dawaApi.getCallLogs();
      const patientCalls = calls.filter(c => c.patientId === patient.id);

      callHistoryEl.innerHTML = `
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Call Type</th>
                <th>Attempt</th>
                <th>Key Pressed</th>
                <th>Duration</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              ${patientCalls.map(c => `
                <tr>
                  <td><strong>${c.time}</strong></td>
                  <td>${c.callType}</td>
                  <td>${c.attempt}</td>
                  <td><span class="highlight" style="font-weight:700;">${c.keyPressed}</span></td>
                  <td>${c.duration}</td>
                  <td><span class="status-badge ${c.result === 'Reported Taken' ? 'status-green' : c.result === 'No Response' ? 'status-red' : 'status-amber'}">${c.result}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    // 4. Pattern Alerts Tab
    const patternAlertsEl = document.getElementById('pt-pattern-alerts-list');
    if (patternAlertsEl) {
      const alerts = await window.dawaApi.getAlerts();
      const ptAlerts = alerts.filter(a => a.patientId === patient.id);

      patternAlertsEl.innerHTML = `
        <div class="safety-advisory-box" style="margin-bottom: 16px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <strong>Pattern Analysis Safety Notice</strong>
            <p>This comparison uses this patient's own previous activity over the past 30 days. Pattern alerts are comparative observations and are <strong>NOT medical diagnoses</strong>.</p>
          </div>
        </div>
        ${ptAlerts.length === 0 ? '<div style="color: var(--text-muted);">No unusual pattern alerts recorded for this patient.</div>' :
          ptAlerts.map(a => `
            <div class="alert-card-item severity-medium" style="margin-bottom: 12px;">
              <div class="alert-icon-wrap">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <div class="alert-item-content">
                <div class="alert-item-header">
                  <span class="alert-item-title">${a.title}</span>
                  <span class="alert-item-time">${a.time}</span>
                </div>
                <p class="alert-item-desc">${a.description}</p>
                <span class="alert-safety-quote">${a.safetyNote}</span>
              </div>
            </div>
          `).join('')
        }
      `;
    }

    // 5. Family & Contacts Tab
    const familyEl = document.getElementById('pt-family-contacts-list');
    if (familyEl) {
      familyEl.innerHTML = `
        <div class="contact-cards-grid" style="grid-template-columns: repeat(2, 1fr);">
          <div class="contact-card">
            <div class="contact-card-header">
              <img src="assets/emma.jpg" alt="Emma Patel" class="contact-avatar" onerror="this.src='assets/anita.jpg'">
              <div>
                <strong style="font-size: 15px;">Emma Patel</strong>
                <div style="font-size: 12px; color: var(--text-secondary);">Primary Family Coordinator (Daughter)</div>
              </div>
            </div>
            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
              <div>📞 +91 98765 43210</div>
              <div>✉️ emma.patel@caregiver.dawadhwani.in</div>
              <div style="margin-top: 6px;"><span class="status-badge status-green">First Escalation Responder</span></div>
            </div>
          </div>

          <div class="contact-card">
            <div class="contact-card-header">
              <div style="width: 48px; height: 48px; border-radius: 999px; background: var(--peach-50); color: var(--peach-primary); display: flex; align-items: center; justify-content: center; font-weight: bold;">DR</div>
              <div>
                <strong style="font-size: 15px;">Dr. Ramesh Sharma</strong>
                <div style="font-size: 12px; color: var(--text-secondary);">Family Physician & Backup Neighbor</div>
              </div>
            </div>
            <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">
              <div>📞 +91 98450 11223</div>
              <div style="margin-top: 6px;"><span class="status-badge status-amber">Backup Contact (30m delay)</span></div>
            </div>
          </div>
        </div>
      `;
    }
  }

  // =========================================================================
  // VIEW 4: MEDICINES PAGE
  // =========================================================================
  async renderMedicines() {
    const medicines = await window.dawaApi.getMedicines();
    const tbody = document.getElementById('medicines-tbody');
    if (!tbody) return;

    if (medicines.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 24px; color: var(--text-muted);">No medicines registered. Click '+ Add Medicine' above.</td></tr>`;
      return;
    }

    tbody.innerHTML = medicines.map(m => `
      <tr>
        <td><strong>${m.name}</strong></td>
        <td>
          <span class="patient-table-link" onclick="window.dawaApp.openPatientDetail('${m.patientId}')" style="font-weight: 600; color: var(--green-primary); cursor: pointer;">
            ${m.patientName}
          </span>
        </td>
        <td><span class="table-dose-pill">${m.dose}</span></td>
        <td><strong>${m.scheduleTime}</strong> <span style="font-size:12px; color:var(--text-muted);">(${m.frequency})</span></td>
        <td>${m.habitCue}</td>
        <td>${m.reminderLanguage} IVR</td>
        <td>
          <div style="display: flex; gap: 6px;">
            <button class="btn btn-peach btn-sm" onclick="window.dawaIvr.openReminderCall({patientName: '${m.patientName}', patientId: '${m.patientId}', medicineName: '${m.name}', dose: '${m.dose}', habitCue: '${m.habitCue}', id: 'TEST'})" title="Simulate Reminder Call">
              Test Call
            </button>
            <button class="btn btn-outline-danger btn-sm" onclick="window.dawaApp.deleteMedicinePrompt('${m.id}', '${m.name}')" title="Delete Medicine">
              Delete
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  async deleteMedicinePrompt(medId, medName) {
    if (confirm(`Are you sure you want to remove ${medName}? Automated voice calls for this medicine will cease.`)) {
      await window.dawaApi.deleteMedicine(medId);
      window.dawaToast.show(`${medName} removed successfully`, 'info');
      this.renderMedicines();
    }
  }

  // =========================================================================
  // VIEW 5: CALL LOGS
  // =========================================================================
  async renderCallLogs() {
    const calls = await window.dawaApi.getCallLogs();
    const tbody = document.getElementById('call-logs-tbody');
    if (!tbody) return;

    let filtered = calls;
    if (this.callLogsFilter === 'outgoing') {
      filtered = calls.filter(c => c.direction === 'Outgoing');
    } else if (this.callLogsFilter === 'incoming') {
      filtered = calls.filter(c => c.direction === 'Incoming');
    } else if (this.callLogsFilter === 'missed') {
      filtered = calls.filter(c => c.result.includes('No Response'));
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding: 24px; color: var(--text-muted);">No call records found for selected filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(c => `
      <tr>
        <td><strong>${c.time}</strong></td>
        <td>
          <span style="font-weight:600; color:var(--green-primary); cursor:pointer;" onclick="window.dawaApp.openPatientDetail('${c.patientId}')">
            ${c.patientName}
          </span>
        </td>
        <td>
          <span class="pill-tag" style="background: ${c.direction === 'Outgoing' ? 'var(--green-tint)' : 'var(--peach-50)'};">
            ${c.direction === 'Outgoing' ? '↗ Outgoing' : '↙ Incoming Helpline'}
          </span>
        </td>
        <td>${c.callType}</td>
        <td>${c.attempt}</td>
        <td><strong style="color: ${c.keyPressed === '1' ? 'var(--green-primary)' : 'var(--text-muted)'};">[ ${c.keyPressed} ]</strong></td>
        <td>
          <span class="status-badge ${c.result === 'Reported Taken' ? 'status-green' : c.result === 'No Response' || c.result.includes('Escalated') ? 'status-red' : 'status-amber'}">
            ${c.result}
          </span>
        </td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="window.dawaModals.openCallTranscript(${JSON.stringify(c).replace(/"/g, '&quot;')})">
            Transcript
          </button>
        </td>
      </tr>
    `).join('');
  }

  filterCallLogs(filterKey) {
    this.callLogsFilter = filterKey;
    document.querySelectorAll('.call-chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filterKey);
    });
    this.renderCallLogs();
  }

  // =========================================================================
  // VIEW 6: ALERTS PAGE
  // =========================================================================
  async renderAlerts() {
    const alerts = await window.dawaApi.getAlerts();
    const container = document.getElementById('alerts-column-container');
    if (!container) return;

    let filtered = alerts;
    if (this.alertsFilter === 'attention') {
      filtered = alerts.filter(a => a.severity === 'high');
    } else if (this.alertsFilter === 'pattern') {
      filtered = alerts.filter(a => a.type === 'Unusual Response Pattern');
    } else if (this.alertsFilter === 'unresolved') {
      filtered = alerts.filter(a => a.status === 'Unresolved');
    }

    if (filtered.length === 0) {
      container.innerHTML = `<div style="text-align: center; padding: 40px; color: var(--text-muted);">No alerts matching this filter.</div>`;
      return;
    }

    container.innerHTML = filtered.map(a => `
      <div class="alert-card-item severity-${a.severity}">
        <div class="alert-icon-wrap">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </div>
        <div class="alert-item-content">
          <div class="alert-item-header">
            <span class="alert-item-title">${a.title}</span>
            <span class="alert-item-time">${a.time}</span>
          </div>
          <div style="font-size: 13px; font-weight: 600; color: var(--green-deep); margin-bottom: 4px;">
            Patient: ${a.patientName} • Escalation: ${a.escalationStep}
          </div>
          <p class="alert-item-desc">${a.description}</p>
          <span class="alert-safety-quote">${a.safetyNote}</span>
          
          <div class="alert-actions-row">
            <button class="btn btn-secondary btn-sm" onclick="window.dawaApp.openPatientDetail('${a.patientId}')">
              View Patient
            </button>
            <button class="btn btn-peach btn-sm" onclick="window.dawaIvr.openReminderCall({patientName: '${a.patientName}', patientId: '${a.patientId}', medicineName: 'Reminder Check', dose: '1 dose', id: 'TEST'})">
              Call Patient Now
            </button>
            ${a.status === 'Unresolved' ? `
              <button class="btn btn-primary btn-sm" onclick="window.dawaApp.resolveAlertAction('${a.id}')">
                Acknowledge & Resolve
              </button>
            ` : `
              <span class="status-badge status-green" style="font-size: 11px;">Resolved</span>
            `}
          </div>
        </div>
      </div>
    `).join('');
  }

  filterAlerts(filterKey) {
    this.alertsFilter = filterKey;
    document.querySelectorAll('.alert-chip-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filterKey);
    });
    this.renderAlerts();
  }

  async resolveAlertAction(alertId) {
    await window.dawaApi.resolveAlert(alertId);
    window.dawaToast.show('Alert acknowledged and marked resolved.', 'success');
    this.renderAlerts();
    this.updateNotificationBadge();
  }

  // =========================================================================
  // VIEW 7: CARE INSIGHTS & ANALYTICS
  // =========================================================================
  async renderInsights() {
    const insights = await window.dawaApi.getInsights();
    
    // Weekly Bar Chart
    const barsContainer = document.getElementById('insights-weekly-bars');
    if (barsContainer) {
      barsContainer.innerHTML = insights.weeklyTrend.map(d => {
        const heightPct = Math.min(100, Math.round((d.avgSeconds / 120) * 100));
        const isDelayed = d.avgSeconds > d.baseline + 20;

        return `
          <div class="chart-bar-col">
            <span class="bar-val-label">${d.avgSeconds}s</span>
            <div class="bar-pill ${isDelayed ? 'delayed' : ''}" style="height: ${heightPct}%;" title="${d.day}: ${d.avgSeconds}s (Baseline: ${d.baseline}s)"></div>
            <span class="bar-day-label">${d.day}</span>
          </div>
        `;
      }).join('');
    }
  }

  // =========================================================================
  // VIEW 8: FAMILY & ESCALATION PROTOCOL
  // =========================================================================
  async renderEscalation() {
    // Loaded from seed; static markup in HTML with interactive links
  }

  // =========================================================================
  // VIEW 9: SETTINGS
  // =========================================================================
  async renderSettings() {
    const settings = await window.dawaApi.getSettings();
    const nameInput = document.getElementById('set-name');
    const phoneInput = document.getElementById('set-phone');
    const emailInput = document.getElementById('set-email');
    const langSelect = document.getElementById('set-lang');

    if (nameInput) nameInput.value = settings.caregiverName;
    if (phoneInput) phoneInput.value = settings.caregiverPhone;
    if (emailInput) emailInput.value = settings.caregiverEmail;
    if (langSelect) langSelect.value = settings.defaultLanguage;
  }

  async saveSettings(e) {
    e.preventDefault();
    const updated = {
      caregiverName: document.getElementById('set-name').value,
      caregiverPhone: document.getElementById('set-phone').value,
      caregiverEmail: document.getElementById('set-email').value,
      defaultLanguage: document.getElementById('set-lang').value
    };
    await window.dawaApi.updateSettings(updated);
    window.dawaToast.show('Settings saved successfully', 'success');
  }

  resetAllDemoData() {
    if (confirm('Reset all demo data back to default initial state?')) {
      window.dawaApi.resetDemoData();
      window.dawaToast.show('Demo data reset to initial values.', 'info');
      this.refreshCurrentView();
    }
  }
}

// Global Startup
document.addEventListener('DOMContentLoaded', () => {
  window.dawaApp = new DawaApp();
  window.dawaApp.init();
});
