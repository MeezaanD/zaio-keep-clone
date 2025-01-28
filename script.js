class Note {
	constructor(id, title, text, archived = false) {
		this.id = id;
		this.title = title;
		this.text = text;
		this.archived = archived;
	}
}

class App {
	constructor() {
		this.notes = JSON.parse(localStorage.getItem('notes')) || [];
		this.selectedNoteId = '';
		this.showArchived = false;

		this.$activeForm = document.querySelector('.active-form');
		this.$inactiveForm = document.querySelector('.inactive-form');
		this.$noteTitle = document.querySelector('#note-title');
		this.$noteText = document.querySelector('#note-text');
		this.$notes = document.querySelector('.notes');
		this.$form = document.querySelector('#form');
		this.$modal = document.querySelector('.modal');
		this.$modalForm = document.querySelector('#modal-form');
		this.$modalTitle = document.querySelector('#modal-title');
		this.$modalText = document.querySelector('#modal-text');
		this.$closeModalForm = document.querySelector('#modal-btn');
		this.$sidebar = document.querySelector('.sidebar');
		this.$sidebarItems = document.querySelectorAll('.sidebar-item');

		this.addEventListeners();
		this.displayNotes();
	}

	addEventListeners() {
		document.body.addEventListener('click', (event) => {
			this.handleFormClick(event);
			this.closeModal(event);
			this.openModal(event);
			this.handleArchiveIconClick(event);
		});

		this.$form.addEventListener('submit', (event) => {
			event.preventDefault();
			const title = this.$noteTitle.value;
			const text = this.$noteText.value;
			this.addNote({ title, text });
			this.closeActiveForm();
		});

		this.$modalForm.addEventListener('submit', (event) => {
			event.preventDefault();
		});

		this.$sidebar.addEventListener('mouseover', () => {
			this.handleToggleSidebar();
		});

		this.$sidebar.addEventListener('mouseout', () => {
			this.handleToggleSidebar();
		});

		this.$sidebarItems.forEach(item => {
			item.addEventListener('click', (event) => {
				this.handleSidebarClick(event);
			});
		});
	}

	handleToggleSidebar() {
		// Implement sidebar toggle functionality if needed
	}

	handleFormClick(event) {
		const isActiveFormClickedOn = this.$activeForm && this.$activeForm.contains(event.target);
		const isInactiveFormClickedOn = this.$inactiveForm && this.$inactiveForm.contains(event.target);
		const title = this.$noteTitle ? this.$noteTitle.value : '';
		const text = this.$noteText ? this.$noteText.value : '';

		if (isInactiveFormClickedOn) {
			this.openActiveForm();
		} else if (!isInactiveFormClickedOn && !isActiveFormClickedOn && (title || text)) {
			this.addNote({ title, text });
			this.closeActiveForm();
		}
	}

	openActiveForm() {
		if (this.$inactiveForm) this.$inactiveForm.style.display = 'none';
		if (this.$activeForm) this.$activeForm.style.display = 'block';
		if (this.$noteText) this.$noteText.focus();
	}

	closeActiveForm() {
		if (this.$inactiveForm) this.$inactiveForm.style.display = 'block';
		if (this.$activeForm) this.$activeForm.style.display = 'none';
		if (this.$noteText) this.$noteText.value = '';
		if (this.$noteTitle) this.$noteTitle.value = '';
	}

	openModal(event) {
		const $selectedNote = event.target.closest('.note');
		if ($selectedNote) {
			this.selectedNoteId = $selectedNote.id;
			const note = this.notes.find(note => note.id === this.selectedNoteId);
			console.log('Opening modal with note details:', note); // Debugging log

			this.$modalTitle.value = note.title;
			this.$modalText.value = note.text;
			this.$modal.classList.add('open-modal');
		}
	}

	closeModal(event) {
		const isModalFormClickedOn = this.$modalForm && this.$modalForm.contains(event.target);
		const isCloseModalBtnClickedOn = this.$closeModalForm && this.$closeModalForm.contains(event.target);
		if (
			(!isModalFormClickedOn || isCloseModalBtnClickedOn) &&
			this.$modal.classList.contains('open-modal')
		) {
			this.editNote(this.selectedNoteId, {
				title: this.$modalTitle.value,
				text: this.$modalText.value,
			});
			this.$modal.classList.remove('open-modal');
		}
	}

	handleArchiveIconClick(event) {
		const $archiveIcon = event.target.closest('.tooltip.archive');
		if ($archiveIcon) {
			console.log('Archive icon clicked'); // Debugging log
			const $selectedNote = $archiveIcon.closest('.note'); // Directly identify the note element
			if ($selectedNote) {
				const noteId = $selectedNote.id;
				console.log(`Found note with ID: ${noteId}`); // Debugging log
				this.toggleArchiveNoteById(noteId);
			} else {
				console.log('No note found'); // Debugging log
			}
		} else {
			console.log('Archive icon not clicked'); // Debugging log
		}
	}

	handleSidebarClick(event) {
		const $clickedItem = event.target.closest('.sidebar-item');
		if ($clickedItem) {
			this.$sidebarItems.forEach(item => item.classList.remove('active-item'));
			$clickedItem.classList.add('active-item');

			const iconText = $clickedItem.querySelector('.material-symbols-outlined').innerText;
			this.showArchived = (iconText === 'archive');
			this.render();
		}
	}

	toggleArchiveNoteById(noteId) {
		let noteFound = false;
		this.notes = this.notes.map((note) => {
			if (note.id === noteId) {
				note.archived = !note.archived; // Toggle the archived status
				noteFound = true;
				console.log(`Note with ID ${noteId} archived status toggled to:`, note.archived); // Debugging log
			}
			return note;
		});
		if (noteFound) {
			this.saveNotes();
			this.render();
		} else {
			console.error(`Note with ID ${noteId} not found`); // Debugging log
		}
	}

	addNote({ title, text }) {
		if (text !== '') {
			const newNote = new Note(this.generateId(), title, text);
			this.notes = [...this.notes, newNote];
			this.saveNotes();
			this.render();
		}
	}

	editNote(id, { title, text }) {
		this.notes = this.notes.map((note) => {
			if (note.id === id) {
				note.title = title;
				note.text = text;
			}
			return note;
		});
		this.saveNotes();
		this.render();
	}

	generateId() {
		return '_' + Math.random().toString(36).substr(2, 9);
	}

	saveNotes() {
		console.log('Saving notes to localStorage:', this.notes); // Debugging log
		localStorage.setItem('notes', JSON.stringify(this.notes));
	}

	render() {
		this.displayNotes();
	}

	displayNotes() {
		const notesToDisplay = this.showArchived ? this.notes.filter(note => note.archived) : this.notes.filter(note => !note.archived);

		this.$notes.innerHTML = notesToDisplay
			.map(
				(note) =>
					`
          <div class="note" id="${note.id}">
            <span class="material-symbols-outlined check-circle">check_circle</span>
            <div class="title">${note.title}</div>
            <div class="text">${note.text}</div>
            <div class="note-footer">
              <div class="tooltip">
                <span class="material-symbols-outlined hover small-icon">add_alert</span>
                <span class="tooltip-text">Remind me</span>
              </div>
              <div class="tooltip">
                <span class="material-symbols-outlined hover small-icon">person_add</span>
                <span class="tooltip-text">Collaborator</span>
              </div>
              <div class="tooltip">
                <span class="material-symbols-outlined hover small-icon">palette</span>
                <span class="tooltip-text">Change Color</span>
              </div>
              <div class="tooltip">
                <span class="material-symbols-outlined hover small-icon">image</span>
                <span class="tooltip-text">Add Image</span>
              </div>
              <div class="tooltip archive">
                <span class="material-symbols-outlined hover small-icon">${note.archived ? 'unarchive' : 'archive'}</span>
                <span class="tooltip-text">${note.archived ? 'Unarchive' : 'Archive'}</span>
              </div>
              <div class="tooltip">
                <span class="material-symbols-outlined hover small-icon">more_vert</span>
                <span class="tooltip-text">More</span>
              </div>
            </div>
          </div>
          `
			)
			.join('');
	}
}

const app = new App();
