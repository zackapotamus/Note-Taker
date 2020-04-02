var $noteTitle = $(".note-title");
var $noteText = $(".note-textarea");
var $saveNoteBtn = $(".save-note");
var $newNoteBtn = $(".new-note");
var $noteList = $(".list-container .list-group");

// activeNote is used to keep track of the note in the textarea
var activeNote = {};
var draftNote = {
  text: "",
  title: ""
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
  console.log("renderActiveNote", activeNote, draftNote);
  
    // $saveNoteBtn.hide();
    handleRenderSaveBtn();


  if (activeNote.id) {
    $noteTitle.attr("readonly", true);
    $noteText.attr("readonly", true);
    $noteTitle.val(activeNote.title);
    $noteText.val(activeNote.text);
  } else {
    $noteTitle.attr("readonly", false);
    $noteText.attr("readonly", false);
    // $noteTitle.val("");
    $noteTitle.val(draftNote.title)
    // $noteText.val("");
    $noteText.val(draftNote.text);
  }
};

// Get the note data from the inputs, save it to the db and update the view
var handleNoteSave = function () {
  var newNote = {
    title: $noteTitle.val(),
    text: $noteText.val()
  };

  saveNote(newNote).then(function (data) {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Delete the clicked note
var handleNoteDelete = function (event) {
  // prevents the click listener for the list from being called when the button inside of it is clicked
  event.stopPropagation();
  var $thisNote = $(this).parent(".list-group-item")
  var note = $thisNote.data();

  if (!note.id) {
    draftNote = {
      "title": "",
      "text": ""
    };
    $thisNote.data(draftNote);
    $thisNote.hide();
    return;
  }

  if (activeNote.id === note.id) {
    activeNote = {};
  }

  deleteNote(note.id).then(function () {
    getAndRenderNotes();
    renderActiveNote();
  });
};

// Sets the activeNote and displays it
var handleNoteView = function () {
  $this = $(this);
  if ($this.hasClass("draft")) {
    draftNote = $this.data();
    activeNote = {};
  } else {
    activeNote = $this.data();
  }
  if (!$this.hasClass("active")) {
    $("li.list-group-item.list-group-item-action.active").removeClass("active");
    $this.addClass("active");
  }
  if ($this.hasClass("draft")) {

  }
  renderActiveNote();
};

// Sets the activeNote to and empty object and allows the user to enter a new note
var handleNewNoteView = function () {
  $draftNote = $("li.list-group-item.list-group-item-action.draft").show();
  if (!$draftNote.hasClass("active")) {
    $("li.list-group-item.list-group-item-action.active").removeClass("active");
    $draftNote.addClass("active");
  }
  draftNote = {"title": "", "text": ""};
  activeNote = {};
  $draftNote.children("span").text = "Draft";
  renderActiveNote();
};

// If a note's title or text are empty, hide the save button
// Or else show it
var handleRenderSaveBtn = function () {
  if (!$.isEmptyObject(activeNote) || !$noteTitle.val().trim() || !$noteText.val().trim()) {
    $saveNoteBtn.hide();
  } else {
    $saveNoteBtn.show();
    $draft = 
    $("li.list-group-item.list-group-item-action.draft").show();
    draftNote.title = $noteTitle.val();
    // activeNote.title = $noteTitle.val();
    draftNote.text = $noteText.val();
    // activeNote.text = $noteText.val();
    $draft.data(draftNote);
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
    $delBtn = $(
      "<i class='fas fa-trash-alt float-right text-danger delete-note'>"
    );

    $li.append($span, $delBtn);
    noteListItems.push($li);
  }

  $li = $("<li class='list-group-item list-group-item-action text-danger draft'>").data(draftNote).hide();
  $span = $("<span>").text("Draft");
  $delBtn = $("<i class='fas fa-trash-alt float-right text-danger delete-note'>");
  $li.append($span, $delBtn);
  noteListItems.push($li);

  $noteList.append(noteListItems);

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