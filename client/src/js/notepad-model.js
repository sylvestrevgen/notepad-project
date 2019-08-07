import * as api from "./services/api";

export default class Notepad {
  static Priority = {
    LOW: 0,
    NORMAL: 1,
    HIGH: 2
  };

  constructor(notes = []) {
    this._notes = notes;
  }

  async getNotes() {
    try {
      const notes = await api.getNotes();
      this._notes = notes;

      return this._notes;
    } catch (error) {
      throw error;
    }
  }

  findNoteById(id) {
    for (const note of this._notes) {
      if (note.id === id) return note;
    }
  }

  async saveNote(note) {
    try {
      const savedNote = await api.saveNote(note);
      this._notes.push(savedNote);

      return savedNote;
    } catch (error) {
      throw error;
    }
  }

  async deleteNote(id) {
    try {
      await api.deleteNote(id);
      this._notes = this._notes.filter(note => note.id !== id);

      return id;
    } catch (error) {
      throw error;
    }
  }

  async updateNoteContent(id, updatedContent) {
    try {
      const updatedNote = await api.updateNote(id, updatedContent);
      const note = this.findNoteById(id);
      Object.assign(note, updatedNote);

      return updatedNote;
    } catch (error) {
      throw error;
    }
  }

  async updateNotePriority(id, newPriority) {
    try {
      const updatedNote = await api.updateNote(id, newPriority);
      const note = this.findNoteById(id);
      note.priority = updatedNote.priority;

      return note;
    } catch (error) {
      throw error;
    }
  }

  filterNotesByQuery(query) {
    return new Promise(resolve => {
      setTimeout(() => {
        query = query.toLowerCase();
        const notesFilteredByQuery = [];
        for (const note of this._notes) {
          if (
            note.title.toLowerCase().includes(query) ||
            note.body.toLowerCase().includes(query)
          ) {
            notesFilteredByQuery.push(note);
          }
        }
        resolve(notesFilteredByQuery);
      }, 300);
    });
  }

  filterNotesByPriority(priority) {
    const notesFilteredByPriority = [];
    for (const note of this._notes) {
      if (note.priority === priority) {
        notesFilteredByPriority.push(note);
      }
    }
    return notesFilteredByPriority;
  }

  get notes() {
    return this._notes;
  }
}
