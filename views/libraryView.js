const libraryView = {
    currentCategory: 'All',

    renderLibrary(user) {
        const materials = store.get("elibrary") || [];
        const filtered = this.currentCategory === 'All'
            ? materials
            : materials.filter(m => m.category === this.currentCategory);

        const isTeacherOrAdmin = user.role === 'teacher' || user.role === 'admin' || app.adminActiveViewRole === 'teacher';

        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <h3><i class="fa-solid fa-book-bookmark" style="color: var(--brand-primary);"></i> Digital E-Library & Past Questions Repository</h3>
                        <p style="font-size: 0.85rem; color: var(--text-secondary);">Access academic e-books, course materials, handouts, and past examination papers.</p>
                    </div>
                    ${isTeacherOrAdmin ? `
                        <button class="btn btn-success" onclick="libraryView.openUploadModal()">
                            <i class="fa-solid fa-upload"></i> Upload New E-Material / Past Question
                        </button>
                    ` : ''}
                </div>

                
                <div style="display: flex; gap: 12px; margin-bottom: 24px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
                    <div class="role-selector-pills" style="margin-bottom: 0;">
                        <button type="button" class="pill-btn ${this.currentCategory === 'All' ? 'active' : ''}" onclick="libraryView.setCategory('All')">All Materials</button>
                        <button type="button" class="pill-btn ${this.currentCategory === 'E-Book' ? 'active' : ''}" onclick="libraryView.setCategory('E-Book')">E-Books</button>
                        <button type="button" class="pill-btn ${this.currentCategory === 'Past Questions' ? 'active' : ''}" onclick="libraryView.setCategory('Past Questions')">Past Questions</button>
                        <button type="button" class="pill-btn ${this.currentCategory === 'Lecture Notes' ? 'active' : ''}" onclick="libraryView.setCategory('Lecture Notes')">Lecture Notes</button>
                    </div>

                    <div style="max-width: 300px; width: 100%;">
                        <input type="text" id="lib-search-input" class="form-control form-control-sm" placeholder="🔍 Search title or course..." onkeyup="libraryView.filterSearch(this.value)">
                    </div>
                </div>

                
                <div class="stats-grid" id="lib-materials-grid" style="grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));">
                    ${filtered.map(item => `
                        <div class="stat-card" style="flex-direction: column; align-items: flex-start; padding: 20px; gap: 14px; position: relative;">
                            <div style="display: flex; justify-content: space-between; width: 100%; align-items: center;">
                                <span class="badge ${item.category === 'Past Questions' ? 'badge-warning' : item.category === 'E-Book' ? 'badge-info' : 'badge-success'}">${item.category}</span>
                                <span style="font-size: 0.75rem; color: var(--text-muted);">${item.date}</span>
                            </div>

                            <div>
                                <h4 style="font-size: 1.05rem; margin-bottom: 4px; color: var(--text-primary);">${item.title}</h4>
                                <p style="font-size: 0.82rem; color: var(--brand-primary); font-weight: 600;">${item.course_code} - ${item.course_title || 'General'}</p>
                                <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 6px;">${item.description || 'No description provided.'}</p>
                                <small style="font-size: 0.75rem; color: var(--text-muted); display: block; margin-top: 4px;">Uploaded by: ${item.uploaded_by}</small>
                            </div>

                            <div style="display: flex; gap: 8px; width: 100%; margin-top: auto; padding-top: 12px; border-top: 1px solid var(--border-color);">
                                <a href="${item.file_url}" target="_blank" class="btn btn-sm btn-primary" style="flex: 1;">
                                    <i class="fa-solid fa-download"></i> Access PDF
                                </a>
                                ${(user.role === 'admin' || user.role === 'teacher') ? `
                                    <button class="btn btn-sm btn-outline-primary" onclick="libraryView.openEditModal('${item.id}')" title="Edit Item">
                                        <i class="fa-solid fa-pen"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="libraryView.deleteMaterial('${item.id}')" title="Delete Item">
                                        <i class="fa-solid fa-trash"></i>
                                    </button>
                                ` : ''}
                            </div>
                        </div>
                    `).join('') || '<div style="grid-column: 1/-1;" class="text-muted text-center">No e-library materials found in this category.</div>'}
                </div>
            </div>
        `;
    },

    setCategory(cat) {
        this.currentCategory = cat;
        app.navigateTo('e-library');
    },

    filterSearch(query) {
        const q = query.toLowerCase();
        const cards = document.querySelectorAll("#lib-materials-grid .stat-card");
        cards.forEach(card => {
            const text = card.innerText.toLowerCase();
            card.style.display = text.includes(q) ? "flex" : "none";
        });
    },

    openUploadModal() {
        document.getElementById("elib-modal-title").innerText = "Upload New E-Material / Past Question";
        document.getElementById("elib-item-id").value = "";
        document.getElementById("elib-item-title").value = "";
        document.getElementById("elib-item-category").value = "E-Book";
        document.getElementById("elib-item-course").value = "CS301";
        document.getElementById("elib-item-url").value = "";
        document.getElementById("elib-item-desc").value = "";
        document.getElementById("elib-modal").classList.remove("hidden");
    },

    openEditModal(id) {
        const materials = store.get("elibrary") || [];
        const target = materials.find(m => m.id === id);
        if (!target) return;

        document.getElementById("elib-modal-title").innerText = "Edit E-Library Material (Admin/Teacher)";
        document.getElementById("elib-item-id").value = target.id;
        document.getElementById("elib-item-title").value = target.title;
        document.getElementById("elib-item-category").value = target.category;
        document.getElementById("elib-item-course").value = target.course_code;
        document.getElementById("elib-item-url").value = target.file_url;
        document.getElementById("elib-item-desc").value = target.description || "";
        document.getElementById("elib-modal").classList.remove("hidden");
    },

    saveMaterial(event) {
        event.preventDefault();
        const id = document.getElementById("elib-item-id").value;
        const title = document.getElementById("elib-item-title").value.trim();
        const category = document.getElementById("elib-item-category").value;
        const courseCode = document.getElementById("elib-item-course").value;
        const fileUrl = document.getElementById("elib-item-url").value.trim();
        const desc = document.getElementById("elib-item-desc").value.trim();

        const user = store.getCurrentUser();
        const uploaderName = user ? (user.full_name || user.email) : "Faculty";

        let materials = store.get("elibrary") || [];

        if (id) {

            const target = materials.find(m => m.id === id);
            if (target) {
                target.title = title;
                target.category = category;
                target.course_code = courseCode;
                target.file_url = fileUrl;
                target.description = desc;
            }
            app.showToast("E-Library material updated successfully!", "success");
        } else {

            const newItem = {
                id: "elib-" + Date.now(),
                title: title,
                category: category,
                course_code: courseCode,
                course_title: courseCode === 'CS301' ? 'Database Management Systems' : courseCode === 'CS303' ? 'Web Technologies & Frameworks' : 'Artificial Intelligence',
                file_url: fileUrl || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
                description: desc,
                date: new Date().toLocaleDateString(),
                uploaded_by: uploaderName
            };
            materials.unshift(newItem);
            app.showToast("New E-Material uploaded! Now visible in Student E-Library.", "success");
        }

        store.set("elibrary", materials);
        app.closeModal("elib-modal");
        app.navigateTo("e-library");
    },

    deleteMaterial(id) {
        if (confirm("Are you sure you want to remove this E-Library resource?")) {
            let materials = store.get("elibrary") || [];
            materials = materials.filter(m => m.id !== id);
            store.set("elibrary", materials);
            app.showToast("E-Library item deleted successfully.", "info");
            app.navigateTo("e-library");
        }
    }
};
