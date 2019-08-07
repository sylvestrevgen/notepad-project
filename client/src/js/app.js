import { NOTIFICATION_MESSAGES } from "./utils/constants";
import initialNotes from "../assets/notes.json";
import Notepad from "./notepad-model";
import {
  domRefs,
  findParentNode,
  createNoteListItems,
  sortNotes
} from "./view";
import storage from "./storage";
import MicroModal from "micromodal";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import SlimSelect from "slim-select";
import "slim-select/dist/slimselect.css";

// INIT NOTEPAD
const notepad = new Notepad(initialNotes);

// INIT NOTYF
const notyf = new Notyf();

// INIT SLIM SELECT
const select = new SlimSelect({
  select: "#single",
  showContent: "up",
  showSearch: false,
  selected: true,
  data: [
    { value: Notepad.Priority.LOW, text: "0" },
    { value: Notepad.Priority.NORMAL, text: "1" },
    { value: Notepad.Priority.HIGH, text: "2" }
  ]
});

// HANDLERS
const handleFormSubmit = async event => {
  try {
    event.preventDefault();
    const noteObj = {};

    if (
      domRefs.formTitleInput.value === "" ||
      domRefs.formBodyInput.value === ""
    ) {
      return notyf.error(`${NOTIFICATION_MESSAGES.EDITOR_FIELDS_EMPTY}`);
    }

    noteObj.title = domRefs.formTitleInput.value;
    noteObj.body = domRefs.formBodyInput.value;
    noteObj.priority = Number(select.selected());

    // SUBMIT EDITED NOTE
    if (domRefs.form.dataset.editedNoteId) {
      const updatedNote = await notepad.updateNoteContent(
        domRefs.form.dataset.editedNoteId,
        noteObj
      );

      storage.remove("new-note-title");
      storage.remove("new-note-body");
      domRefs.form.reset();
      domRefs.form.removeAttribute("data-edited-note-id");
      
      // SORTING
      const sortedNotes = sortNotes(notepad.notes);
      //
      const markup = createNoteListItems(sortedNotes);
      domRefs.noteList.innerHTML = markup;
        // NOTYF
      notyf.success(`${NOTIFICATION_MESSAGES.NOTE_EDITED_SUCCESS}`);
      // MICROMODAL
      MicroModal.close("note-editor-modal");
      return;
    }
    //

    await notepad.saveNote(noteObj);
    storage.remove("new-note-title");
    storage.remove("new-note-body");
    domRefs.form.reset();

    // SORTING
    const sortedNotes = sortNotes(notepad.notes);
    //
    const markup = createNoteListItems(sortedNotes);
    domRefs.noteList.innerHTML = markup;

    // NOTYF
    notyf.success(`${NOTIFICATION_MESSAGES.NOTE_ADDED_SUCCESS}`);
    // MICROMODAL
    MicroModal.close("note-editor-modal");
  } catch (error) {
    notyf.error(`${error}`);
  }
};

const handleDeleteNote = async event => {
  try {
    if (
      event.target.nodeName === "I" &&
      event.target.closest("button").dataset.action === "delete-note"
    ) {
      const parentNode = findParentNode(event.target);

      await notepad.deleteNote(parentNode.dataset.id);

      // SORTING
      const sortedNotes = sortNotes(notepad.notes);
      //
      const markup = createNoteListItems(sortedNotes);
      domRefs.noteList.innerHTML = markup;

      notyf.success(`${NOTIFICATION_MESSAGES.NOTE_DELETED_SUCCESS}`);
    }
  } catch (error) {
    notyf.error(`${error}`);
  }
};

const handleFilterNotes = event => {
  const input = event.target;

  notepad.filterNotesByQuery(input.value.trim()).then(filteredItems => {
    const markup = createNoteListItems(filteredItems);
    domRefs.noteList.innerHTML = markup;
  });
};

const handleOpenModal = () => {
  domRefs.form.reset();
  select.setSelected(0);

  MicroModal.show("note-editor-modal");
};

const handleKeyNewNote = event => {
  const [title, body] = domRefs.form.elements;
  if (event.target === title) {
    storage.save("new-note-title", title.value);
  }

  if (event.target === body) {
    storage.save("new-note-body", body.value);
  }
};

const handleClickEditBtn = event => {
  if (
    event.target.nodeName === "I" &&
    event.target.closest("button").dataset.action === "edit-note"
  ) {
    MicroModal.show("note-editor-modal");
    const editedNote = notepad.findNoteById(
      event.target.closest("li").dataset.id
    );
    domRefs.form.elements[0].value = editedNote.title;
    domRefs.form.elements[1].value = editedNote.body;
    select.setSelected(editedNote.priority);

    // TO HAVE ABILITY TO SUBMIT EDITED NOTE TO NOTEPAD.NOTES, ADD to FORM DATA ID EDITED NOTE
    domRefs.form.dataset.editedNoteId = editedNote.id;
  }
};

const handleEditPriority = async event => {
  try {
    if (event.target.nodeName !== "I") return;

    const editedPriorNote = notepad.findNoteById(
      event.target.closest("li").dataset.id
    );

    switch (event.target.closest("button").dataset.action) {
      case "decrease-priority":
        if (editedPriorNote.priority === 0) return;
        if (editedPriorNote.priority === 1) {
          await notepad.updateNotePriority(editedPriorNote.id, {
            priority: Notepad.Priority.LOW
          });
          const sortedNotes = sortNotes(notepad.notes);
          const markup = createNoteListItems(sortedNotes);
          domRefs.noteList.innerHTML = markup;
        }
        if (editedPriorNote.priority === 2) {
          await notepad.updateNotePriority(editedPriorNote.id, {
            priority: Notepad.Priority.NORMAL
          });
          const sortedNotes = sortNotes(notepad.notes);
          const markup = createNoteListItems(sortedNotes);
          domRefs.noteList.innerHTML = markup;
        }
        break;

      case "increase-priority":
        if (editedPriorNote.priority === 2) return;
        if (editedPriorNote.priority === 1) {
          await notepad.updateNotePriority(editedPriorNote.id, {
            priority: Notepad.Priority.HIGH
          });
          const sortedNotes = sortNotes(notepad.notes);
          const markup = createNoteListItems(sortedNotes);
          domRefs.noteList.innerHTML = markup;
        }
        if (editedPriorNote.priority === 0) {
          await notepad.updateNotePriority(editedPriorNote.id, {
            priority: Notepad.Priority.NORMAL
          });
          const sortedNotes = sortNotes(notepad.notes);
          const markup = createNoteListItems(sortedNotes);
          domRefs.noteList.innerHTML = markup;
        }
        break;

      default:
        return;
    }
  } catch (error) {
    notyf.error(error);
  }
};

// EVENT LISTENERS
domRefs.form.addEventListener("submit", handleFormSubmit);
domRefs.noteList.addEventListener("click", handleDeleteNote);
domRefs.searchForm.addEventListener("input", handleFilterNotes);
domRefs.openModalButton.addEventListener("click", handleOpenModal);
domRefs.form.addEventListener("keyup", handleKeyNewNote);
domRefs.noteList.addEventListener("click", handleClickEditBtn);
domRefs.noteList.addEventListener("click", handleEditPriority);
// Remove edited note id attribute from form when we close form and anything submit
document.addEventListener("click", event => {
  if (event.target !== document.querySelector("[data-micromodal-close]"))
    return;

  domRefs.form.removeAttribute("data-edited-note-id");
});

// RENDER NOTES FROM BACKEND AND SORTED BY PRIORITY FROM HIGH TO LOW
notepad
  .getNotes()
  .then(notes => {
    // SORTING
    const sortedNotes = sortNotes(notes);
    //

    const markup = createNoteListItems(sortedNotes);
    domRefs.noteList.innerHTML = markup;
  })
  .catch(error => {
    notyf.error(`${error}`);
  });

// RENDER FORM VALUES WITH STORAGE DATA
const storageNoteTitle = storage.load("new-note-title");
const storageNoteBody = storage.load("new-note-body");

if (storageNoteTitle || storageNoteBody) {
  domRefs.form.elements[0].value = storageNoteTitle;
  domRefs.form.elements[1].value = storageNoteBody;
}
