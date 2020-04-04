const $noteTitle = $(".note-title");
const $noteText = $(".note-textarea");
const $saveNoteBtn = $(".save-note");
const $newNoteBtn = $(".new-note");
const $noteList = $(".list-container .list-group");

// activeNote is used to keep track of the note in the textarea
var activeNote = {};
var draftNote = {};
var $selectedListItem;

// a function to tell me if the actieNote is a draft
var activeNoteIsADraft = () => {
  // return (!activeNote.id && ((activeNote.title && activeNote.title.trim()) || (activeNote.text && activeNote.text.trim())))
  return (!activeNote.id);
};

var activeNoteHasContent = () => {
  return ((activeNote.title && activeNote.title.trim()) || (activeNote.text && activeNote.text.trim()))
};

// a function to return the current active list group item
var getActiveListItem = () => {
  return $noteList.children(".active");
}

var getDraftListItem = () => {
  return $noteList.children(".draft");
}

var toggleSelected = ($currentSelection) => {
  getActiveListItem().removeClass("active");
  $currentSelection.addClass("active");
};

// A function for getting all notes from the db
var getNotes = function () {
  return $.ajax({
    url: "/api/notes",
    method: "GET"
  });
};

// A function for saving a note to the db
var saveNote = function (note) {
  return $.ajax({
    url: "/api/notes",
    data: note,
    method: "POST"
  });
};

// A function for deleting a note from the db
var deleteNote = function (id) {
  return $.ajax({
    url: "api/notes/" + id,
    method: "DELETE"
  });
};

// If there is an activeNote, display it, otherwise render empty inputs
var renderActiveNote = function () {
  console.log("renderActiveNote", activeNote);
  let isDraft = activeNoteIsADraft();
  let hasContent = activeNoteHasContent();
  if (isDraft && hasContent) {
    console.log("activeNote is a draft and it has content");
    $saveNoteBtn.show();
    getDraftListItem().show();
    $noteTitle.val(activeNote.title || "");
    $noteText.val(activeNote.text || "")
  } else {
    $saveNoteBtn.hide();
  }
  if (!isDraft) {
    console.log("activeNote has an id")
    $noteTitle.attr("readonly", true);
    $noteText.attr("readonly", true);
    $noteTitle.val(activeNote.title);
    $noteText.val(activeNote.text);
  } else {
    console.log("activeNote doesn't have an id");
    $noteTitle.attr("readonly", false);
    $noteText.attr("readonly", false);
    if (!hasContent) {
      $noteTitle.val("");
      $noteText.val("");
    }
  }
};

// Get the note data from the inputs, save it to the db and update the view
var handleNoteSave = function () {
  var newNote = {
    title: $noteTitle.val(),
    text: $noteText.val()
  };
  draftNote = {};
  getDraftListItem().removeData().addClass("disabled");
  saveNote(newNote).then(function (data) {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Delete the clicked note
var handleNoteDelete = function (event) {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();
  var $thisNote = $(this).parent(".list-group-item");
  var note = $thisNote.data();

  if (activeNote.id === note.id) {
    activeNote = {};
  }
  if ($thisNote.hasClass("draft")) {
    console.log("this note is a draft");
    $thisNote.hide();
    $thisNote.removeData();
    if (!$thisNote.hasClass("active")) {
      let activeListItem = getActiveListItem();
      if (activeListItem.length == 1) {
        activeNote = activeListItem.data();
      }
    }
    // activeNote = {}
    renderActiveNote();
    return;
  }
  deleteNote(note.id).then(function () {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
var handleNoteView = function () {
  $this = $(this);
  if (activeNoteIsADraft()) {
    draftNote = {
      title: $noteTitle.val(),
      text: $noteText.val()
    }
    getDraftListItem().data(draftNote);
  }
  toggleSelected($this);
  activeNote = $this.data();
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
var handleNewNoteView = function () {
  var $draftListItem = getDraftListItem();
  toggleSelected($draftListItem);
  $draftListItem.show();
  if (!$.isEmptyObject($draftListItem.data())) {
    activeNote = $draftListItem.data();
  } else {
    activeNote = {};
  }
  renderActiveNote();
};

// If a note's title or text are empty, hide the save button
// Or else show it
var handleRenderSaveBtn = () => {
  let $draftListItem = getDraftListItem();
  if (!$noteTitle.val().trim() && !$noteText.val().trim()) {
    $saveNoteBtn.hide();
    $draftListItem.addClass("disabled");
  } else {
    $saveNoteBtn.show();
    $draftListItem.removeClass("disabled");
  }
};

// Render's the list of note titles
var renderNoteList = function (notes) {
  $noteList.empty();

  var noteListItems = [];
  var $li, $span, $delBtn;
  for (var i = 0; i < notes.length; i++) {
    var note = notes[i];

    $li = $("<li class='list-group-item list-group-item-action'>").data(note);
    $span = $("<span>").text(note.title);
    $delBtn = $("<i class='fas fa-trash-alt float-right text-danger delete-note'>");
    $li.append($span, $delBtn);
    noteListItems.push($li);
  }
  if ((draftNote.text && draftNote.text.trim()) || (draftNote.title && draftNote.title.trim())) {
      $li = $("<li class='list-group-item list-group-item-action text-danger draft'>").data(draftNote)
  }
  else {
      $li = $("<li class='list-group-item list-group-item-action text-danger draft disabled'>").data(draftNote)

  }
  $span = $("<span>").text("Draft");
  $delBtn = $("<i class='fas fa-trash-alt float-right text-danger delete-note'>");
  $li.append($span, $delBtn);
  noteListItems.push($li);
  $noteList.append(noteListItems);
  console.log("draft item data:", $li.data());
};

// Gets notes from the db and renders them to the sidebar
var getAndRenderNotes = function () {
  return getNotes().then(function (data) {
    renderNoteList(data);
  });
};

$saveNoteBtn.on("click", handleNoteSave);
$noteList.on("click", ".list-group-item", handleNoteView);
$newNoteBtn.on("click", handleNewNoteView);
$noteList.on("click", ".delete-note", handleNoteDelete);
$noteTitle.on("keyup", handleRenderSaveBtn);
$noteText.on("keyup", handleRenderSaveBtn);

// Gets and renders the initial list of notes
getAndRenderNotes();