class App {
    constructor() {
        this.currentView = "dashboard";
        this.adminActiveViewRole = null;
        this.isNavigatingHistory = false;

        const now = new Date();
        this.calendarCurrentYear = now.getFullYear();
        this.calendarCurrentMonth = now.getMonth();
        this.selectedCalendarDate = null;
        this.calendarFilterScope = 'ALL';
        this.calendarActiveViewMode = 'grid';
        this.currentAlertFilterCategory = 'ALL';
    }

    init() {

        const savedTheme = localStorage.getItem("isms_theme") || "light";
        document.documentElement.setAttribute("data-theme", savedTheme);
        this.updateThemeIcon(savedTheme);


        this.startLiveClock();
        this.initSystemNavigation();


        this.clearAllForms();


        const dobInput = document.getElementById("st-dob");
        if (dobInput) {
            const todayStr = new Date().toISOString().split("T")[0];
            dobInput.setAttribute("max", todayStr);
        }


        const currentUser = store.getCurrentUser();
        if (currentUser) {
            this.initializeMainScreen();
        } else {

            const preloadStyle = document.getElementById("auth-state-override-style");
            if (preloadStyle) preloadStyle.remove();
            document.getElementById("auth-screen").classList.remove("hidden");
            document.getElementById("main-screen").classList.add("hidden");
            authView.switchAuthTab('login');
            authView.updateLoginPlaceholder();
        }
    }

    clearAllForms() {
        document.querySelectorAll("form").forEach(form => {
            try {

                if (form.id === "login-form" && store.getCurrentUser()) return;
                form.reset();
            } catch (e) { }
        });
    }

    initSystemNavigation() {

        window.addEventListener("popstate", (event) => {
            if (event.state && event.state.view) {
                this.isNavigatingHistory = true;
                this.navigateTo(event.state.view, true);
                this.isNavigatingHistory = false;
            }
        });


        document.addEventListener("keydown", (e) => {

            const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : '';
            const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select' || (document.activeElement && document.activeElement.isContentEditable);

            if (isInput) return;


            if ((e.altKey && e.key === 'ArrowLeft') || (e.ctrlKey && e.key === 'ArrowLeft') || (e.key === 'Backspace')) {
                e.preventDefault();
                window.history.back();
            }


            if ((e.altKey && e.key === 'ArrowRight') || (e.ctrlKey && e.key === 'ArrowRight')) {
                e.preventDefault();
                window.history.forward();
            }
        });
    }

    startLiveClock() {
        const update = () => {
            const timeEl = document.getElementById("live-clock-time");
            const dateEl = document.getElementById("live-clock-date");
            if (!timeEl || !dateEl) return;

            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
            const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

            timeEl.innerHTML = `<i class="fa-regular fa-clock"></i> ${timeStr}`;
            dateEl.innerText = dateStr;
        };

        update();
        setInterval(update, 1000);
    }

    toggleCalendarModal() {
        this.renderAcademicCalendarModal();
        document.getElementById("calendar-modal").classList.remove("hidden");
    }

    navigateCalendarMonth(delta) {
        let m = this.calendarCurrentMonth + delta;
        let y = this.calendarCurrentYear;
        if (m < 0) {
            m = 11;
            y--;
        } else if (m > 11) {
            m = 0;
            y++;
        }
        this.calendarCurrentMonth = m;
        this.calendarCurrentYear = y;
        this.renderAcademicCalendarModal();
    }

    resetCalendarMonth() {
        const now = new Date();
        this.calendarCurrentYear = now.getFullYear();
        this.calendarCurrentMonth = now.getMonth();
        const yr = now.getFullYear();
        const mo = String(now.getMonth() + 1).padStart(2, '0');
        const dy = String(now.getDate()).padStart(2, '0');
        this.selectedCalendarDate = `${yr}-${mo}-${dy}`;
        this.renderAcademicCalendarModal();
    }

    selectCalendarDate(dateStr) {
        this.selectedCalendarDate = dateStr;
        this.renderAcademicCalendarModal();
    }

    switchCalendarViewMode(mode) {
        this.calendarActiveViewMode = mode;
        this.renderAcademicCalendarModal();
    }

    renderAcademicCalendarModal(filterScope = null) {
        const modalBody = document.getElementById("calendar-modal-body");
        if (!modalBody) return;

        if (filterScope) {
            this.calendarFilterScope = filterScope;
        }

        const events = store.get("academic_events") || store.get("academic_calendar") || [];
        const activeSession = store.getCurrentAcademicSession ? store.getCurrentAcademicSession() : { full_label: "2026/2027 - Semester 1" };
        const activeSemester = activeSession.full_label;

        let filteredEvents = events;
        if (this.calendarFilterScope !== 'ALL') {
            filteredEvents = events.filter(e => e.scope === this.calendarFilterScope || e.scope === 'All Students & Faculty');
        }

        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];
        const monthTitle = `${monthNames[this.calendarCurrentMonth]} ${this.calendarCurrentYear}`;

        const year = this.calendarCurrentYear;
        const month = this.calendarCurrentMonth;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayIndex = new Date(year, month, 1).getDay();

        const todayObj = new Date();
        const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`;

        if (!this.selectedCalendarDate) {
            this.selectedCalendarDate = todayStr;
        }

        let gridCellsHtml = '';
        for (let i = 0; i < firstDayIndex; i++) {
            gridCellsHtml += `<div class="calendar-day empty"></div>`;
        }

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

            const dayEvents = events.filter(e => {
                const s = e.start_date || e.date;
                const end = e.end_date || s;
                return s && dateStr >= s && dateStr <= end;
            });

            const isToday = (dateStr === todayStr);
            const isSelected = (dateStr === this.selectedCalendarDate);
            const hasEvent = dayEvents.length > 0;

            let dayClasses = 'calendar-day';
            if (isToday) dayClasses += ' today-day';
            if (hasEvent) dayClasses += ' event-day';
            if (isSelected) dayClasses += ' selected-day';

            const tooltipText = hasEvent ? dayEvents.map(ev => ev.title).join(' | ') : `Date: ${dateStr}`;

            gridCellsHtml += `
                <div class="${dayClasses}" onclick="app.selectCalendarDate('${dateStr}')" title="${tooltipText}">
                    ${d}
                    ${hasEvent ? `<span class="event-dot" title="${dayEvents.length} event(s)"></span>` : ''}
                </div>
            `;
        }

        const selectedDateEvents = events.filter(e => {
            const s = e.start_date || e.date;
            const end = e.end_date || s;
            return s && this.selectedCalendarDate >= s && this.selectedCalendarDate <= end;
        });

        modalBody.innerHTML = `
            <div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 16px; border-radius: var(--radius-md); margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;">
                <div>
                    <h4 style="color: white; margin: 0; font-size: 1.15rem;"><i class="fa-solid fa-calendar-check" style="color: #60a5fa;"></i> Published Institution Academic Calendar</h4>
                    <p style="color: #94a3b8; font-size: 0.85rem; margin: 4px 0 0 0;">Official schedules for Semester Registration, Examinations, Breaks, and Deadlines.</p>
                </div>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <span class="badge badge-info" style="font-size: 0.85rem; padding: 6px 12px;"><i class="fa-solid fa-graduation-cap"></i> ${activeSemester}</span>
                    <span class="badge badge-success" style="font-size: 0.85rem; padding: 6px 12px;"><i class="fa-solid fa-circle-check"></i> Status: Published</span>
                </div>
            </div>

            
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 16px;">
                <div class="role-selector-pills" style="gap: 6px; flex-wrap: wrap;">
                    <button type="button" class="pill-btn ${this.calendarActiveViewMode === 'grid' ? 'active' : ''}" onclick="app.switchCalendarViewMode('grid')"><i class="fa-solid fa-calendar-days"></i> Month Grid View</button>
                    <button type="button" class="pill-btn ${this.calendarActiveViewMode === 'list' ? 'active' : ''}" onclick="app.switchCalendarViewMode('list')"><i class="fa-solid fa-list-check"></i> Agenda List View</button>
                </div>
                
                <div class="role-selector-pills" style="gap: 6px; flex-wrap: wrap;">
                    <button type="button" class="pill-btn ${this.calendarFilterScope === 'ALL' ? 'active' : ''}" onclick="app.renderAcademicCalendarModal('ALL')">🗓️ All (${events.length})</button>
                    <button type="button" class="pill-btn ${this.calendarFilterScope === 'All Students & Faculty' ? 'active' : ''}" onclick="app.renderAcademicCalendarModal('All Students & Faculty')">👥 General</button>
                    <button type="button" class="pill-btn ${this.calendarFilterScope === 'Undergraduate Students' ? 'active' : ''}" onclick="app.renderAcademicCalendarModal('Undergraduate Students')">🎓 Students</button>
                    <button type="button" class="pill-btn ${this.calendarFilterScope === 'Faculty Members Only' ? 'active' : ''}" onclick="app.renderAcademicCalendarModal('Faculty Members Only')">👨‍🏫 Faculty</button>
                </div>
            </div>

            ${this.calendarActiveViewMode === 'grid' ? `
                <!-- INTERACTIVE MONTH CALENDAR GRID -->
                <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px;">
                    <!-- MONTH NAVIGATION TOOLBAR -->
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                        <button type="button" class="btn btn-xs btn-outline-primary" onclick="app.navigateCalendarMonth(-1)"><i class="fa-solid fa-chevron-left"></i> Previous Month</button>
                        <h4 style="margin: 0; color: var(--brand-primary); font-size: 1.15rem;"><i class="fa-regular fa-calendar-days"></i> ${monthTitle}</h4>
                        <div style="display: flex; gap: 8px;">
                            <button type="button" class="btn btn-xs btn-outline-secondary" onclick="app.resetCalendarMonth()"><i class="fa-solid fa-calendar-day"></i> Today</button>
                            <button type="button" class="btn btn-xs btn-outline-primary" onclick="app.navigateCalendarMonth(1)">Next Month <i class="fa-solid fa-chevron-right"></i></button>
                        </div>
                    </div>

                    
                    <div class="calendar-grid-wrapper">
                        <div class="calendar-day-header">Sun</div>
                        <div class="calendar-day-header">Mon</div>
                        <div class="calendar-day-header">Tue</div>
                        <div class="calendar-day-header">Wed</div>
                        <div class="calendar-day-header">Thu</div>
                        <div class="calendar-day-header">Fri</div>
                        <div class="calendar-day-header">Sat</div>
                        ${gridCellsHtml}
                    </div>
                </div>

                
                <div style="background: var(--bg-primary); border-radius: var(--radius-md); padding: 14px; border: 1px solid var(--border-color);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                        <h5 style="margin: 0; color: var(--brand-primary);"><i class="fa-solid fa-calendar-check"></i> Activities Scheduled for <strong>${this.selectedCalendarDate || 'Selected Date'}</strong></h5>
                        <small style="color: var(--text-secondary);">${selectedDateEvents.length} Event(s) Found</small>
                    </div>

                    ${selectedDateEvents.length === 0 ? `
                        <div style="text-align: center; padding: 16px; color: var(--text-secondary); font-size: 0.88rem;">
                            <p style="margin: 0;"><i class="fa-solid fa-circle-info"></i> No academic activity published for ${this.selectedCalendarDate}. Click any date cell with a dot indicator above to view activity details.</p>
                        </div>
                    ` : `
                        <div style="display: flex; flex-direction: column; gap: 10px;">
                            ${selectedDateEvents.map(evt => `
                                <div style="background: var(--bg-surface); padding: 12px; border-radius: var(--radius-sm); border-left: 4px solid var(--brand-primary); border-top: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                                        <h4 style="margin: 0; font-size: 0.98rem; color: var(--brand-primary);">${evt.title}</h4>
                                        <span class="badge badge-info" style="font-size: 0.75rem;">${evt.scope}</span>
                                    </div>
                                    <div style="font-size: 0.82rem; color: var(--text-secondary); margin-bottom: 6px;">
                                        <span><i class="fa-regular fa-calendar"></i> <strong>Start:</strong> ${evt.start_date}</span> | 
                                        <span><i class="fa-regular fa-calendar-check"></i> <strong>End:</strong> ${evt.end_date}</span>
                                    </div>
                                    <p style="margin: 0; font-size: 0.86rem; color: var(--text-main); line-height: 1.35;">${evt.description || 'No additional instructions.'}</p>
                                </div>
                            `).join('')}
                        </div>
                    `}
                </div>
            ` : `
                
                <div style="display: flex; flex-direction: column; gap: 12px; max-height: 440px; overflow-y: auto; padding-right: 4px;">
                    ${filteredEvents.length === 0 ? `
                        <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                            <i class="fa-solid fa-calendar-xmark" style="font-size: 2.2rem; margin-bottom: 8px;"></i>
                            <p>No published academic calendar activities under this filter scope.</p>
                        </div>
                    ` : filteredEvents.map(evt => `
                        <div style="background: var(--bg-surface); padding: 16px; border-radius: var(--radius-md); border: 1px solid var(--border-color); border-left: 5px solid var(--brand-primary);">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px; margin-bottom: 6px;">
                                <h4 style="color: var(--brand-primary); margin: 0; font-size: 1.05rem;"><i class="fa-solid fa-calendar-day"></i> ${evt.title}</h4>
                                <span class="badge badge-info" style="font-size: 0.8rem;"><i class="fa-solid fa-users"></i> ${evt.scope}</span>
                            </div>
                            <div style="display: flex; gap: 16px; font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 8px;">
                                <span><i class="fa-regular fa-calendar"></i> <strong>Start:</strong> ${evt.start_date}</span>
                                <span><i class="fa-regular fa-calendar-check"></i> <strong>End:</strong> ${evt.end_date}</span>
                            </div>
                            <p style="margin: 0; font-size: 0.88rem; color: var(--text-main); line-height: 1.4;">${evt.description || 'No additional instructions provided.'}</p>
                        </div>
                    `).join('')}
                </div>
            `}
        `;
    }


    initializeMainScreen() {
        const preloadStyle = document.getElementById("auth-state-override-style");
        if (preloadStyle) preloadStyle.remove();

        const authScreen = document.getElementById("auth-screen");
        const mainScreen = document.getElementById("main-screen");
        if (authScreen) authScreen.classList.add("hidden");
        if (mainScreen) mainScreen.classList.remove("hidden");

        const user = store.getCurrentUser();
        if (!user) return;
        const effectiveRole = (user.role === "admin" && this.adminActiveViewRole) ? this.adminActiveViewRole : user.role;


        document.getElementById("brief-name").innerText = user.full_name || "System User";
        document.getElementById("brief-sub").innerText = user.student_data ? `ID: ${user.student_data.student_id}` : user.teacher_data ? `ID: ${user.teacher_data.staff_id}` : user.email;
        document.getElementById("brief-avatar").src = user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
        const roleBadge = document.getElementById("role-badge");
        if (roleBadge) roleBadge.innerText = (user.admin_role_title || effectiveRole).toUpperCase();


        const notifWrapper = document.getElementById("topbar-notification-wrapper");
        const isSystemAdmin = user.role === "admin" && (!user.admin_role_title || user.admin_role_title === "System Admin" || user.admin_role_title === "Super Admin" || user.staff_id === "SUPER-001");
        if (notifWrapper) {
            notifWrapper.classList.toggle("hidden", !isSystemAdmin);
        }


        const adminSwitcher = document.getElementById("admin-view-switcher");
        if (adminSwitcher) {
            if (user.role === "admin") {
                adminSwitcher.classList.remove("hidden");
            } else {
                adminSwitcher.classList.add("hidden");
                this.adminActiveViewRole = null;
            }
        }

        this.renderNavMenu(effectiveRole);
        this.updateNotificationBadge();

        const activeSession = store.getCurrentAcademicSession ? store.getCurrentAcademicSession() : { full_label: "2026/2027 - Semester 1" };
        document.querySelectorAll(".active-academic-session-label").forEach(el => {
            el.textContent = activeSession.full_label;
        });


        if (this._alertInterval) clearInterval(this._alertInterval);
        this._alertInterval = setInterval(() => {
            this.updateNotificationBadge();
        }, 8000);

        if (!this._storageListenerBound) {
            window.addEventListener("storage", (e) => {
                if (e.key && (e.key.includes("system_alerts") || e.key.includes("audit_logs") || e.key.includes("reg_control") || e.key.includes("announcements"))) {
                    this.updateNotificationBadge();
                }
                if (e.key && (e.key.includes("courses") || e.key.includes("reg_control") || e.key.includes("system_settings") || e.key.includes("current_semester") || e.key.includes("enrollments") || e.key.includes("grades") || e.key.includes("attendance") || e.key.includes("fees") || e.key.includes("parents") || e.key.includes("students") || e.key.includes("announcements") || e.key.includes("quizzes"))) {
                    this.refreshActiveViews();
                }
            });
            this._storageListenerBound = true;
        }
        if (user.role === "admin") {
            const isSuperAdmin = !user.admin_role_title || user.admin_role_title === "Super Admin" || user.staff_id === "SUPER-001";
            if (isSuperAdmin) {

                const savedSection = sessionStorage.getItem("isms_admin_section") || (window.location.hash ? window.location.hash.substring(1) : "overview");
                this.navigateToAdminSection(savedSection);
            } else {

                const perms = user.permissions || [];
                const savedSec = sessionStorage.getItem("isms_admin_section") || (window.location.hash ? window.location.hash.substring(1) : null);
                const firstSec = savedSec || (perms.includes('users') ? 'users' : perms.includes('academic') ? 'academic' : perms.includes('reg_control') ? 'reg_control' : perms.includes('results') ? 'results' : perms.includes('attendance') ? 'attendance' : perms.includes('finance') ? 'finance' : perms.includes('audit') ? 'audit' : perms.includes('settings') ? 'settings' : perms.includes('backup') ? 'backup' : 'settings');
                this.navigateToAdminSection(firstSec);
            }
        } else {
            const savedView = sessionStorage.getItem("isms_current_view") || (window.location.hash ? window.location.hash.substring(1) : "dashboard");
            this.navigateTo(savedView);
        }
    }

    updateNotificationBadge() {
        const badge = document.getElementById("notification-badge");
        if (!badge) return;

        const user = store.getCurrentUser();
        if (!user) {
            badge.innerText = "0";
            badge.classList.add("hidden");
            return;
        }

        const isSystemAdmin = user.role === 'admin' && (!user.admin_role_title || user.admin_role_title === 'System Admin' || user.admin_role_title === 'Super Admin' || user.staff_id === 'SUPER-001');
        const allAlerts = store.get("system_alerts") || [];

        let roleAlerts = [];
        if (isSystemAdmin) {
            roleAlerts = allAlerts;
        } else {
            roleAlerts = allAlerts.filter(a => {
                const userStudentId = user.student_data ? user.student_data.student_id : null;
                const userStaffId = user.staff_id || (user.teacher_data ? user.teacher_data.staff_id : null);

                if (a.user_id && (a.user_id === user.id || a.user_id === userStudentId || a.user_id === userStaffId || a.user_id === user.email)) return true;
                if (a.target_user_id && (a.target_user_id === user.id || a.target_user_id === userStudentId || a.target_user_id === userStaffId || a.target_user_id === user.email)) return true;

                if (user.admin_role_title && a.target_audience === user.admin_role_title) return true;
                if (user.role && (a.target_audience === user.role || a.target_audience === (user.role.toLowerCase() + 's'))) return true;
                if (a.target_audience === 'ALL') return true;

                return false;
            });
        }

        const readKey = `isms_read_alerts_${user.id || user.email || user.role}`;
        const readAlertIds = JSON.parse(localStorage.getItem(readKey) || "[]");
        const unreadAlerts = roleAlerts.filter(a => !readAlertIds.includes(a.id));

        badge.innerText = unreadAlerts.length;
        if (unreadAlerts.length > 0) {
            badge.classList.remove("hidden");
        } else {
            badge.classList.add("hidden");
        }
    }

    refreshActiveViews() {
        if (this._refreshDebounce) clearTimeout(this._refreshDebounce);
        this._refreshDebounce = setTimeout(() => {
            this._doRefreshActiveViews();
        }, 30);
    }

    _doRefreshActiveViews() {
        const user = store.getCurrentUser();
        if (!user) return;

        const effectiveRole = (user.role === "admin" && this.adminActiveViewRole) ? this.adminActiveViewRole : user.role;
        const container = document.getElementById("view-container") || document.getElementById("view-content");
        if (!container && effectiveRole !== "admin") return;

        const currentView = this.currentView || "dashboard";

        // Real-time update of any live session labels in the DOM
        const activeSession = store.getCurrentAcademicSession ? store.getCurrentAcademicSession() : { full_label: "2026/2027 - Semester 1", academic_year: "2026/2027" };
        document.querySelectorAll(".active-academic-session-label").forEach(el => {
            el.textContent = activeSession.full_label;
        });
        // Update academic year labels across all user dashboards
        ["student-dashboard-acad-year", "teacher-dashboard-acad-year", "parent-dashboard-acad-year"].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = activeSession.academic_year;
        });
        const kpiSem = document.getElementById("kpi-semester");
        if (kpiSem) {
            kpiSem.textContent = activeSession.full_label;
        }
        const liveSem = document.getElementById("live-current-semester");
        if (liveSem) {
            liveSem.textContent = activeSession.full_label;
        }

        if (effectiveRole === "student") {
            const studentData = user.student_data || (store.get("students") || []).find(s => s.student_id === user.student_id) || user;
            if (currentView === "course-registration" && window.studentView && typeof studentView.renderCourseRegistration === "function") {
                container.innerHTML = studentView.renderCourseRegistration(studentData);
            } else if (currentView === "dashboard" && window.studentView && typeof studentView.renderDashboard === "function") {
                container.innerHTML = studentView.renderDashboard(studentData);
                if (typeof studentView.initDashboardChart === "function") {
                    studentView.initDashboardChart(studentData);
                }
            } else if (currentView === "results" && window.studentView && typeof studentView.renderResults === "function") {
                container.innerHTML = studentView.renderResults(studentData);
            } else if (currentView === "attendance" && window.studentView && typeof studentView.renderAttendance === "function") {
                container.innerHTML = studentView.renderAttendance(studentData);
            } else if (currentView === "fees" && window.studentView && typeof studentView.renderFees === "function") {
                container.innerHTML = studentView.renderFees(studentData);
            }
        } else if (effectiveRole === "parent") {
            const allParents = store.get("parents") || [];
            const parentData = user.parent_data || allParents.find(p => p.email === user.email || p.id === user.id) || allParents[0];

            if (currentView === "dashboard" && window.parentView && typeof parentView.renderDashboard === "function") {
                container.innerHTML = parentView.renderDashboard(user);
            } else if ((currentView === "academics" || currentView === "child-results") && window.parentView && typeof parentView.renderChildResults === "function") {
                container.innerHTML = parentView.renderChildResults();
            } else if ((currentView === "attendance" || currentView === "child-attendance") && window.parentView && typeof parentView.renderChildAttendance === "function") {
                container.innerHTML = parentView.renderChildAttendance();
            } else if ((currentView === "fees" || currentView === "child-fees") && window.parentView && typeof parentView.renderChildFees === "function") {
                container.innerHTML = parentView.renderChildFees();
            }
        } else if (effectiveRole === "teacher") {
            const allTeachers = store.get("teachers") || [];
            const teacherData = user.teacher_data || allTeachers.find(t => t.email === user.email || t.staff_id === user.staff_id || t.id === user.id) || allTeachers[0];

            if (currentView === "dashboard" && window.teacherView && typeof teacherView.renderDashboard === "function") {
                container.innerHTML = teacherView.renderDashboard(teacherData);
                if (typeof teacherView.initTeacherChart === "function") {
                    teacherView.initTeacherChart();
                }
            } else if (currentView === "course-entry" && window.teacherView && typeof teacherView.renderCourseEntry === "function") {
                container.innerHTML = teacherView.renderCourseEntry();
            } else if (currentView === "attendance" && window.teacherView && typeof teacherView.renderAttendanceManagement === "function") {
                container.innerHTML = teacherView.renderAttendanceManagement();
            } else if ((currentView === "grading" || currentView === "grade-entry") && window.teacherView && typeof teacherView.renderGradeEntry === "function") {
                container.innerHTML = teacherView.renderGradeEntry();
            }
        } else if (user.role === "admin" && !this.adminActiveViewRole && window.adminView) {
            const currentSection = sessionStorage.getItem("isms_admin_section") || adminView.currentTab || "overview";
            if (["overview", "users", "academic", "results", "attendance", "finance"].includes(currentSection)) {
                if (typeof adminView.switchSection === "function") {
                    adminView.switchSection(currentSection);
                }
            }
        }
    }

    switchAdminViewRole(role) {
        const user = store.getCurrentUser();
        if (user.role !== "admin") {
            this.showToast("Access Denied: Only administrators have permission to switch view context.", "danger");
            return;
        }

        this.adminActiveViewRole = role === "admin" ? null : role;
        const selectEl = document.getElementById("admin-role-select");
        if (selectEl) selectEl.value = role;
        this.showToast(`Admin switched workspace context to: ${role.toUpperCase()} View`, "info");
        this.initializeMainScreen();
    }

    renderNavMenu(role) {
        const menuContainer = document.getElementById("nav-menu");
        const user = store.getCurrentUser();
        let itemsHtml = "";

        if (role === "admin") {
            const isSystemAdmin = !user.admin_role_title || user.admin_role_title === "System Admin" || user.admin_role_title === "Super Admin" || user.staff_id === "SUPER-001";
            const perms = user.permissions || ["ALL"];

            if (isSystemAdmin) {

                itemsHtml = `
                    <a class="nav-item active" data-view="overview" onclick="app.navigateToAdminSection('overview')"><i class="fa-solid fa-chart-pie"></i> OVERVIEW & SUMMARY</a>
                    <a class="nav-item" data-view="users" onclick="app.navigateToAdminSection('users')"><i class="fa-solid fa-users-gear"></i> USER MANAGEMENT</a>
                    <a class="nav-item" data-view="rbac" onclick="app.navigateToAdminSection('rbac')"><i class="fa-solid fa-user-shield"></i> ADMIN & PERMISSIONS</a>
                    <a class="nav-item" data-view="academic" onclick="app.navigateToAdminSection('academic')"><i class="fa-solid fa-building-columns"></i> ACADEMIC MANAGEMENT</a>
                    <a class="nav-item" data-view="reg_control" onclick="app.navigateToAdminSection('reg_control')"><i class="fa-solid fa-pen-to-square"></i> REG CONTROL</a>
                    <a class="nav-item" data-view="results" onclick="app.navigateToAdminSection('results')"><i class="fa-solid fa-graduation-cap"></i> RESULTS AUDIT</a>
                    <a class="nav-item" data-view="attendance" onclick="app.navigateToAdminSection('attendance')"><i class="fa-solid fa-clipboard-user"></i> ATTENDANCE OVERSIGHT</a>
                    <a class="nav-item" data-view="finance" onclick="app.navigateToAdminSection('finance')"><i class="fa-solid fa-wallet"></i> FINANCE OVERSIGHT</a>
                    <a class="nav-item" data-view="audit" onclick="app.navigateToAdminSection('audit')"><i class="fa-solid fa-list-check"></i> AUDIT LOGS</a>
                    <a class="nav-item" data-view="announcements" onclick="app.navigateToAdminSection('announcements')"><i class="fa-solid fa-bullhorn"></i> ANNOUNCEMENTS</a>
                    <a class="nav-item" data-view="e-library" onclick="app.navigateToAdminSection('e-library')"><i class="fa-solid fa-book-bookmark"></i> E-LIBRARY MANAGEMENT</a>
                    <a class="nav-item" data-view="settings" onclick="app.navigateToAdminSection('settings')"><i class="fa-solid fa-sliders"></i> SYSTEM SETTINGS</a>
                    <a class="nav-item" data-view="backup" onclick="app.navigateToAdminSection('backup')"><i class="fa-solid fa-database"></i> DATABASE BACKUP</a>
                `;
            } else {

                itemsHtml = '';
                let hasFirst = false;

                if (perms.includes('users') || perms.includes('STUDENT_MANAGE')) {
                    itemsHtml += `<a class="nav-item ${!hasFirst ? 'active' : ''}" data-view="users" onclick="app.navigateToAdminSection('users')"><i class="fa-solid fa-users-gear"></i> USER MANAGEMENT</a>`;
                    hasFirst = true;
                }
                if (perms.includes('rbac')) {
                    itemsHtml += `<a class="nav-item ${!hasFirst ? 'active' : ''}" data-view="rbac" onclick="app.navigateToAdminSection('rbac')"><i class="fa-solid fa-user-shield"></i> ADMIN & PERMISSIONS</a>`;
                    hasFirst = true;
                }
                if (perms.includes('academic') || perms.includes('COURSE_MANAGE')) {
                    itemsHtml += `<a class="nav-item ${!hasFirst ? 'active' : ''}" data-view="academic" onclick="app.navigateToAdminSection('academic')"><i class="fa-solid fa-building-columns"></i> ACADEMIC MANAGEMENT</a>`;
                    hasFirst = true;
                }
                if (perms.includes('e-library')) {
                    itemsHtml += `<a class="nav-item ${!hasFirst ? 'active' : ''}" data-view="e-library" onclick="app.navigateToAdminSection('e-library')"><i class="fa-solid fa-book-bookmark"></i> E-LIBRARY MANAGEMENT</a>`;
                    hasFirst = true;
                }
                if (perms.includes('reg_control')) {
                    itemsHtml += `<a class="nav-item ${!hasFirst ? 'active' : ''}" data-view="reg_control" onclick="app.navigateToAdminSection('reg_control')"><i class="fa-solid fa-pen-to-square"></i> REG CONTROL</a>`;
                    hasFirst = true;
                }
                if (perms.includes('results') || perms.includes('GRADE_APPROVAL')) {
                    itemsHtml += `<a class="nav-item ${!hasFirst ? 'active' : ''}" data-view="results" onclick="app.navigateToAdminSection('results')"><i class="fa-solid fa-graduation-cap"></i> RESULTS AUDIT</a>`;
                    hasFirst = true;
                }
                if (perms.includes('attendance')) {
                    itemsHtml += `<a class="nav-item ${!hasFirst ? 'active' : ''}" data-view="attendance" onclick="app.navigateToAdminSection('attendance')"><i class="fa-solid fa-clipboard-user"></i> ATTENDANCE OVERSIGHT</a>`;
                    hasFirst = true;
                }
                if (perms.includes('finance') || perms.includes('FEE_MANAGE')) {
                    itemsHtml += `<a class="nav-item ${!hasFirst ? 'active' : ''}" data-view="finance" onclick="app.navigateToAdminSection('finance')"><i class="fa-solid fa-wallet"></i> FINANCE OVERSIGHT</a>`;
                    hasFirst = true;
                }
                if (perms.includes('audit')) {
                    itemsHtml += `<a class="nav-item ${!hasFirst ? 'active' : ''}" data-view="audit" onclick="app.navigateToAdminSection('audit')"><i class="fa-solid fa-list-check"></i> AUDIT LOGS</a>`;
                    hasFirst = true;
                }
                if (perms.includes('announcements')) {
                    itemsHtml += `<a class="nav-item ${!hasFirst ? 'active' : ''}" data-view="announcements" onclick="app.navigateToAdminSection('announcements')"><i class="fa-solid fa-bullhorn"></i> ANNOUNCEMENTS</a>`;
                    hasFirst = true;
                }
                if (perms.includes('settings') || perms.includes('CONFIG_MANAGE')) {
                    itemsHtml += `<a class="nav-item ${!hasFirst ? 'active' : ''}" data-view="settings" onclick="app.navigateToAdminSection('settings')"><i class="fa-solid fa-sliders"></i> SYSTEM SETTINGS</a>`;
                    hasFirst = true;
                }
                if (perms.includes('backup')) {
                    itemsHtml += `<a class="nav-item ${!hasFirst ? 'active' : ''}" data-view="backup" onclick="app.navigateToAdminSection('backup')"><i class="fa-solid fa-database"></i> DATABASE BACKUP</a>`;
                    hasFirst = true;
                }
            }
        } else if (role === "student") {
            itemsHtml = `
                <a class="nav-item active" data-view="dashboard" onclick="app.navigateTo('dashboard')"><i class="fa-solid fa-house"></i> Dashboard Overview</a>
                <a class="nav-item" data-view="course-registration" onclick="app.navigateTo('course-registration')"><i class="fa-solid fa-pen-to-square"></i> Course Registration</a>
                <a class="nav-item" data-view="e-library" onclick="app.navigateTo('e-library')"><i class="fa-solid fa-book-bookmark"></i> E-Library Portal</a>
                <a class="nav-item" data-view="results" onclick="app.navigateTo('results')"><i class="fa-solid fa-award"></i> Results & GPA</a>
                <a class="nav-item" data-view="attendance" onclick="app.navigateTo('attendance')"><i class="fa-solid fa-clipboard-user"></i> Attendance Portal</a>
                <a class="nav-item" data-view="fees" onclick="app.navigateTo('fees')"><i class="fa-solid fa-wallet"></i> Semester Fees</a>
                <a class="nav-item" data-view="notifications" onclick="app.navigateTo('notifications')"><i class="fa-solid fa-bell"></i> Alerts & Complaints</a>
                <a class="nav-item" data-view="settings" onclick="app.navigateTo('settings')"><i class="fa-solid fa-gear"></i> Settings</a>
                <a class="nav-item" data-view="ai-assistant" onclick="app.navigateTo('ai-assistant')"><i class="fa-solid fa-robot"></i> AI Academic Assistant</a>
            `;
        } else if (role === "teacher") {
            itemsHtml = `
                <a class="nav-item active" data-view="dashboard" onclick="app.navigateTo('dashboard')"><i class="fa-solid fa-house"></i> Overview & Classes</a>
                <a class="nav-item" data-view="grading" onclick="app.navigateTo('grading')"><i class="fa-solid fa-pen-nib"></i> Marks & Grade Entry</a>
                <a class="nav-item" data-view="attendance" onclick="app.navigateTo('attendance')"><i class="fa-solid fa-clipboard-user"></i> Class Attendance</a>
                <a class="nav-item" data-view="course-entry" onclick="app.navigateTo('course-entry')"><i class="fa-solid fa-book-open"></i> Assigned Courses</a>
                <a class="nav-item" data-view="announcements" onclick="app.navigateTo('announcements')"><i class="fa-solid fa-bullhorn"></i> Post Announcements</a>
                <a class="nav-item" data-view="e-library" onclick="app.navigateTo('e-library')"><i class="fa-solid fa-book-bookmark"></i> E-Library Uploads</a>
                <a class="nav-item" data-view="settings" onclick="app.navigateTo('settings')"><i class="fa-solid fa-gear"></i> Settings</a>
            `;
        } else if (role === "parent") {
            itemsHtml = `
                <a class="nav-item active" data-view="dashboard" onclick="app.navigateTo('dashboard')"><i class="fa-solid fa-house"></i> Ward Overview</a>
                <a class="nav-item" data-view="academics" onclick="app.navigateTo('academics')"><i class="fa-solid fa-graduation-cap"></i> Academic Results</a>
                <a class="nav-item" data-view="attendance" onclick="app.navigateTo('attendance')"><i class="fa-solid fa-clipboard-user"></i> Attendance Records</a>
                <a class="nav-item" data-view="fees" onclick="app.navigateTo('fees')"><i class="fa-solid fa-wallet"></i> Ward Fees & Payments</a>
                <a class="nav-item" data-view="settings" onclick="app.navigateTo('settings')"><i class="fa-solid fa-gear"></i> Settings</a>
            `;
        }

        menuContainer.innerHTML = itemsHtml;
    }

    navigateToAdminSection(sectionTab) {
        const user = store.getCurrentUser();
        const isSystemAdmin = !user.admin_role_title || user.admin_role_title === "System Admin" || user.admin_role_title === "Super Admin" || user.staff_id === "SUPER-001";
        const perms = user.permissions || ["ALL"];

        if (!sectionTab || sectionTab === "dashboard") {
            sectionTab = "overview";
        }


        if (!isSystemAdmin && !perms.includes('ALL')) {
            const allowedSectionMap = {
                'overview': true,
                'users': perms.includes('users') || perms.includes('STUDENT_MANAGE'),
                'rbac': perms.includes('rbac'),
                'academic': perms.includes('academic') || perms.includes('COURSE_MANAGE'),
                'reg_control': perms.includes('reg_control'),
                'results': perms.includes('results') || perms.includes('GRADE_APPROVAL'),
                'attendance': perms.includes('attendance'),
                'finance': perms.includes('finance') || perms.includes('FEE_MANAGE'),
                'audit': perms.includes('audit'),
                'announcements': perms.includes('announcements'),
                'settings': true, // Always allowed
                'backup': perms.includes('backup'),
                'e-library': perms.includes('e-library')
            };

            if (!allowedSectionMap[sectionTab]) {
                const firstAllowed = Object.keys(allowedSectionMap).find(k => allowedSectionMap[k]);
                if (firstAllowed) {
                    sectionTab = firstAllowed;
                }
            }
        }


        adminView.currentTab = sectionTab;


        document.querySelectorAll(".nav-item").forEach(item => {
            item.classList.toggle("active", item.getAttribute("data-view") === sectionTab);
        });


        sessionStorage.setItem("isms_admin_section", sectionTab);
        sessionStorage.setItem("isms_current_view", sectionTab);
        window.location.hash = sectionTab;


        const sidebar = document.getElementById("sidebar");
        if (sidebar) sidebar.classList.remove("open");
        const backdrop = document.getElementById("sidebar-backdrop");
        if (backdrop) backdrop.classList.remove("active");


        const pageTitle = document.getElementById("page-title");
        if (pageTitle) pageTitle.innerText = sectionTab.replace("-", " ").replace("_", " ").toUpperCase();

        if (sectionTab === "e-library") {
            const viewContainer = document.getElementById("view-container");
            if (viewContainer) viewContainer.innerHTML = libraryView.renderLibrary(user);
            return;
        }

        this.navigateTo("dashboard");
        adminView.switchSection(sectionTab);
    }

    toggleNotificationsModal() {
        this.openSystemMessagesModal();
    }

    openSystemMessagesModal(filterCategory = 'ALL') {
        this.renderSystemMessagesModal(filterCategory);
        document.getElementById("system-messages-modal").classList.remove("hidden");
    }

    renderSystemMessagesModal(filterCategory = 'ALL') {
        const modalBody = document.getElementById("system-messages-modal-body");
        if (!modalBody) return;

        this.currentAlertFilterCategory = filterCategory;

        const user = store.getCurrentUser();
        const isSystemAdmin = user && (user.role === 'admin' && (!user.admin_role_title || user.admin_role_title === 'System Admin' || user.admin_role_title === 'Super Admin' || user.staff_id === 'SUPER-001'));
        const allAlerts = store.get("system_alerts") || [];

        let roleAlerts = [];
        if (isSystemAdmin) {
            roleAlerts = allAlerts;
        } else {
            roleAlerts = allAlerts.filter(a => {
                if (!user) return false;
                const userStudentId = user.student_data ? user.student_data.student_id : null;
                const userStaffId = user.staff_id || (user.teacher_data ? user.teacher_data.staff_id : null);

                if (a.user_id && (a.user_id === user.id || a.user_id === userStudentId || a.user_id === userStaffId || a.user_id === user.email)) return true;
                if (a.target_user_id && (a.target_user_id === user.id || a.target_user_id === userStudentId || a.target_user_id === userStaffId || a.target_user_id === user.email)) return true;

                if (user.admin_role_title && a.target_audience === user.admin_role_title) return true;
                if (user.role && (a.target_audience === user.role || a.target_audience === (user.role.toLowerCase() + 's'))) return true;
                if (a.target_audience === 'ALL') return true;

                return false;
            });
        }

        const alerts = roleAlerts;

        let filteredAlerts = alerts;
        if (filterCategory !== 'ALL') {
            filteredAlerts = alerts.filter(a => (a.category || '').toLowerCase().includes(filterCategory.toLowerCase()));
        }

        modalBody.innerHTML = `
            <div style="background: linear-gradient(135deg, #0f172a, #1e293b); color: white; padding: 16px; border-radius: var(--radius-md); margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div>
                    <h4 style="color: white; margin: 0; font-size: 1.1rem;"><i class="fa-solid fa-bell" style="color: #60a5fa;"></i> System Alerts &amp; Security Notices</h4>
                    <p style="color: #94a3b8; font-size: 0.82rem; margin: 4px 0 0 0;">${isSystemAdmin ? 'Security, health, and compliance alerts for this institution.' : 'Your notifications and direct role notices.'}</p>
                </div>
                <button class="btn btn-xs btn-outline-light" onclick="app.markAllAlertsAsRead()"><i class="fa-solid fa-check-double"></i> Mark All Read</button>
            </div>

            
            <div class="role-selector-pills" style="margin-bottom: 14px; gap: 6px; flex-wrap: wrap;">
                <button type="button" class="pill-btn ${filterCategory === 'ALL' ? 'active' : ''}" onclick="app.openSystemMessagesModal('ALL')"><i class="fa-solid fa-bell"></i> All Alerts (${alerts.length})</button>
                <button type="button" class="pill-btn ${filterCategory === 'security' ? 'active' : ''}" onclick="app.openSystemMessagesModal('security')"><i class="fa-solid fa-shield-halved"></i> Security</button>
                <button type="button" class="pill-btn ${filterCategory === 'health' ? 'active' : ''}" onclick="app.openSystemMessagesModal('health')"><i class="fa-solid fa-heart-pulse"></i> Health</button>
                <button type="button" class="pill-btn ${filterCategory === 'user' ? 'active' : ''}" onclick="app.openSystemMessagesModal('user')"><i class="fa-solid fa-user"></i> User Actions</button>
                <button type="button" class="pill-btn ${filterCategory === 'compliance' ? 'active' : ''}" onclick="app.openSystemMessagesModal('compliance')"><i class="fa-solid fa-clipboard-list"></i> Compliance</button>
            </div>

            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; background: var(--bg-primary); padding: 8px 14px; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
                <label style="margin: 0; font-size: 0.85rem; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; font-weight: 600;">
                    <input type="checkbox" onchange="app.toggleAllSystemAlertsCheckboxes(this.checked)"> Select All Alerts
                </label>
                <button type="button" class="btn btn-xs btn-outline-danger" onclick="app.deleteSelectedSystemAlerts()">
                    <i class="fa-solid fa-trash-can"></i> Delete Selected Alerts
                </button>
            </div>

            <div class="alerts-list-container" style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 4px;">
                ${filteredAlerts.length === 0 ? `
                    <div style="text-align: center; padding: 30px; color: var(--text-secondary);">
                        <i class="fa-solid fa-bell-slash" style="font-size: 2.2rem; margin-bottom: 8px;"></i>
                        <p>No system alerts found under this category.</p>
                    </div>
                ` : filteredAlerts.map(alert => `
                    <div style="background: var(--bg-surface); padding: 14px 16px; border-radius: var(--radius-md); border-left: 4px solid ${alert.level === 'danger' ? 'var(--status-danger)' : alert.level === 'warning' ? 'var(--status-warning)' : alert.level === 'success' ? 'var(--status-success)' : 'var(--brand-primary)'}; border-top: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                            <div style="display: flex; align-items: center; gap: 10px;">
                                <input type="checkbox" class="sys-alert-cb" data-id="${alert.id}" style="cursor: pointer;">
                                <span class="badge ${alert.level === 'danger' ? 'badge-danger' : alert.level === 'warning' ? 'badge-warning' : alert.level === 'success' ? 'badge-success' : 'badge-info'}" style="font-size: 0.75rem;">
                                    ${alert.category}
                                </span>
                            </div>
                            <small style="color: var(--text-secondary); font-size: 0.78rem;"><i class="fa-regular fa-clock"></i> ${alert.date}</small>
                        </div>
                        <p style="margin: 4px 0 0 28px; font-size: 0.9rem; color: var(--text-main); line-height: 1.4;">${alert.message}</p>
                    </div>
                `).join('')}
            </div>
        `;
    }

    toggleAllSystemAlertsCheckboxes(checked) {
        document.querySelectorAll(".sys-alert-cb").forEach(cb => cb.checked = checked);
    }

    deleteSelectedSystemAlerts() {
        const checkboxes = document.querySelectorAll(".sys-alert-cb:checked");
        if (checkboxes.length === 0) {
            this.showToast("Please select at least one system alert to delete.", "warning");
            return;
        }
        if (!confirm(`Are you sure you want to delete ${checkboxes.length} selected system alert(s)?`)) return;

        const toDeleteIds = Array.from(checkboxes).map(cb => cb.getAttribute("data-id"));
        let allAlerts = store.get("system_alerts") || [];
        allAlerts = allAlerts.filter(a => !toDeleteIds.includes(a.id));

        store.set("system_alerts", allAlerts);

        const badge = document.getElementById("notification-badge");
        if (badge) {
            badge.innerText = allAlerts.length;
            if (allAlerts.length === 0) badge.classList.add("hidden");
        }

        this.showToast(`Deleted ${checkboxes.length} system alert(s)!`, "success");
        this.renderSystemMessagesModal(this.currentAlertFilterCategory || 'ALL');
    }

    markAllAlertsAsRead() {
        const user = store.getCurrentUser();
        if (user) {
            const allAlerts = store.get("system_alerts") || [];
            const readKey = `isms_read_alerts_${user.id || user.email || user.role}`;
            localStorage.setItem(readKey, JSON.stringify(allAlerts.map(a => a.id)));
        }
        const badge = document.getElementById("notification-badge");
        if (badge) {
            badge.innerText = "0";
            badge.classList.add("hidden");
        }
        this.showToast("All system messages & alerts marked as read.", "success");
        if (this.currentAlertFilterCategory) {
            this.renderSystemMessagesModal(this.currentAlertFilterCategory);
        }
    }

    navigateTo(viewName, isPopState = false) {
        this.currentView = viewName;
        const user = store.getCurrentUser();
        const role = (user.role === "admin" && this.adminActiveViewRole) ? this.adminActiveViewRole : user.role;


        sessionStorage.setItem("isms_current_view", viewName);
        if (!isPopState && !this.isNavigatingHistory) {
            window.history.pushState({ view: viewName }, '', `#${viewName}`);
        }


        const sidebar = document.getElementById("sidebar");
        if (sidebar) {
            sidebar.classList.remove("open");
            const backdrop = document.getElementById("sidebar-backdrop");
            if (backdrop) backdrop.classList.remove("active");
        }


        if (viewName === "admin" && user.role !== "admin") {
            this.showToast("Access Denied: Only administrators have access to this section.", "danger");
            return;
        }


        document.querySelectorAll(".nav-item").forEach(item => {
            item.classList.toggle("active", item.getAttribute("data-view") === viewName);
        });


        const pageTitle = document.getElementById("page-title");
        pageTitle.innerText = viewName.replace("-", " ").toUpperCase();

        const viewContainer = document.getElementById("view-container");

        if (viewName === "e-library") {
            viewContainer.innerHTML = libraryView.renderLibrary(user);
            return;
        }

        if (role === "admin" && !this.adminActiveViewRole && viewName === "dashboard") {
            viewContainer.innerHTML = adminView.renderDashboard();
            adminView.initAdminChart();
            adminView.startOverviewRealTimePolling();
            return;
        }

        if (role === "student") {
            const allStudents = store.get("students") || [];
            const studentData = user.student_data ||
                allStudents.find(s => s.email === user.email || s.student_id === user.student_id || s.id === user.id) ||
                allStudents[0] ||
                { student_id: "4211260001", first_name: "Abena", surname: "Appiah", programme: "BSc Computer Science", level: "300" };
            if (!user.student_data) {
                user.student_data = studentData;
                store.setCurrentUser(user);
            }

            if (viewName === "dashboard") {
                viewContainer.innerHTML = studentView.renderDashboard(studentData);
                studentView.initDashboardChart(studentData);
            } else if (viewName === "course-registration") {
                viewContainer.innerHTML = studentView.renderCourseRegistration(studentData);
            } else if (viewName === "results") {
                viewContainer.innerHTML = studentView.renderResults(studentData);
            } else if (viewName === "attendance") {
                viewContainer.innerHTML = studentView.renderAttendance(studentData);
            } else if (viewName === "fees") {
                viewContainer.innerHTML = studentView.renderFees(studentData);
            } else if (viewName === "notifications") {
                viewContainer.innerHTML = studentView.renderNotifications(studentData);
            } else if (viewName === "settings") {
                viewContainer.innerHTML = studentView.renderSettings(studentData);
            } else if (viewName === "ai-assistant") {
                aiAssistant.renderChatView("view-container");
            }
        } else if (role === "teacher") {
            const allTeachers = store.get("teachers") || [];
            const teacherData = user.teacher_data ||
                allTeachers.find(t => t.email === user.email || t.staff_id === user.staff_id || t.id === user.id) ||
                allTeachers[0];
            if (!user.teacher_data && teacherData) {
                user.teacher_data = teacherData;
                store.setCurrentUser(user);
            }

            if (viewName === "dashboard") {
                viewContainer.innerHTML = teacherView.renderDashboard(teacherData);
                teacherView.initTeacherChart();
            } else if (viewName === "course-entry") {
                viewContainer.innerHTML = teacherView.renderCourseEntry();
            } else if (viewName === "students-list") {
                viewContainer.innerHTML = teacherView.renderStudentList();
            } else if (viewName === "attendance") {
                viewContainer.innerHTML = teacherView.renderAttendanceManagement();
            } else if (viewName === "grading" || viewName === "grade-entry") {
                viewContainer.innerHTML = teacherView.renderGradeEntry();
            } else if (viewName === "announcements") {
                viewContainer.innerHTML = teacherView.renderAnnouncements();
            } else if (viewName === "settings") {
                viewContainer.innerHTML = teacherView.renderSettings(teacherData);
            } else if (viewName === "ai-assistant") {
                aiAssistant.renderChatView("view-container");
            }
        } else if (role === "parent") {
            const allParents = store.get("parents") || [];
            const parentData = user.parent_data ||
                allParents.find(p => p.email === user.email || p.id === user.id) ||
                allParents[0];
            if (!user.parent_data && parentData) {
                user.parent_data = parentData;
                store.setCurrentUser(user);
            }

            if (viewName === "dashboard") {
                viewContainer.innerHTML = parentView.renderDashboard(user);
            } else if (viewName === "academics" || viewName === "child-results") {
                viewContainer.innerHTML = parentView.renderChildResults();
            } else if (viewName === "attendance" || viewName === "child-attendance") {
                viewContainer.innerHTML = parentView.renderChildAttendance();
            } else if (viewName === "fees" || viewName === "child-fees") {
                viewContainer.innerHTML = parentView.renderChildFees();
            } else if (viewName === "settings") {
                viewContainer.innerHTML = parentView.renderSettings(parentData);
            }
        }
    }

    openProfileModal() {
        const user = store.getCurrentUser();
        document.getElementById("modal-full-name").value = user.full_name;
        document.getElementById("modal-email").value = user.email;
        document.getElementById("modal-phone").value = user.phone_number;
        document.getElementById("modal-avatar-preview").src = user.avatar_url || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
        document.getElementById("profile-modal").classList.remove("hidden");
    }

    handleAvatarUpload(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imgDataUrl = e.target.result;
                document.getElementById("modal-avatar-preview").src = imgDataUrl;

                const user = store.getCurrentUser();
                user.avatar_url = imgDataUrl;
                store.setCurrentUser(user);
                document.getElementById("brief-avatar").src = imgDataUrl;
                this.showToast("Profile photo uploaded successfully!", "success");
            };
            reader.readAsDataURL(file);
        }
    }

    deleteAvatarPhoto() {
        const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150";
        document.getElementById("modal-avatar-preview").src = defaultAvatar;
        const user = store.getCurrentUser();
        user.avatar_url = defaultAvatar;
        store.setCurrentUser(user);
        document.getElementById("brief-avatar").src = defaultAvatar;
        this.showToast("Profile photo removed.", "info");
    }

    saveProfileChanges(event) {
        event.preventDefault();
        const user = store.getCurrentUser();
        user.full_name = document.getElementById("modal-full-name").value.trim();
        user.phone_number = document.getElementById("modal-phone").value.trim();

        store.setCurrentUser(user);
        document.getElementById("brief-name").innerText = user.full_name;
        this.closeModal("profile-modal");
        this.showToast("Profile details updated successfully!", "success");
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.add("hidden");
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
        localStorage.setItem("isms_theme", newTheme);
        this.updateThemeIcon(newTheme);
        this.showToast(`Switched to ${newTheme.toUpperCase()} theme mode.`, "info");
    }

    updateThemeIcon(theme) {
        const icon = document.getElementById("theme-icon");
        if (icon) {
            icon.className = theme === "dark" ? "fa-solid fa-sun" : "fa-solid fa-moon";
        }
    }

    toggleSidebar() {
        const sidebar = document.getElementById("sidebar");
        const backdrop = document.getElementById("sidebar-backdrop");
        sidebar.classList.toggle("open");
        if (backdrop) backdrop.classList.toggle("active", sidebar.classList.contains("open"));
    }

    closeSidebar() {
        const sidebar = document.getElementById("sidebar");
        const backdrop = document.getElementById("sidebar-backdrop");
        if (sidebar) sidebar.classList.remove("open");
        if (backdrop) backdrop.classList.remove("active");
    }

    logout() {
        authView.logout();
    }

    showToast(message, type = "info") {
        const container = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <i class="fa-solid ${type === 'success' ? 'fa-circle-check' : type === 'danger' ? 'fa-circle-exclamation' : type === 'warning' ? 'fa-triangle-exclamation' : 'fa-circle-info'}"></i>
            <span>${message}</span>
        `;
        container.appendChild(toast);
        setTimeout(() => {
            toast.remove();
        }, 4000);
    }
}


const app = new App();
if (typeof window !== "undefined") {
    window.app = app;
}
document.addEventListener("DOMContentLoaded", () => app.init());
