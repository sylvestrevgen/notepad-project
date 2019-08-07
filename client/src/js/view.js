import noteTemplate from "../templates/note.hbs";

// DOM ELEMENTS REFS
export const domRefs = {
  noteList: document.querySelector(".note-list"),
  form: document.querySelector(".note-editor"),
  searchForm: document.querySelector(".search-form"),
  formTitleInput: document.querySelector('input[name="note_title"]'),
  formBodyInput: document.querySelector('textarea[name="note_body"]'),
  openModalButton: document.querySelector('button[data-action="open-editor"]'),
};

// FIND PARENT NODE FUNCTION
export const findParentNode = el => el.closest("li");

// CREATE NOTES FUNCTION WITH HANDLEBARS
export const createNoteListItems = notes => {
  const markup = notes.map(note => noteTemplate(note)).join('');

  return markup;
};

// CREATE SORTING NOTES IN UI FUCTION
export const sortNotes = unsortedNotes => {
  const sortedNotes = [...unsortedNotes];
  sortedNotes.sort((a, b) => b.priority - a.priority);

  return sortedNotes;
}