// Dependencies
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const path = require("path");
const PUBLIC_DIR = path.resolve("public");
const JsonDb = require("./JsonDb.js");

// Sets up the Express app to handle data parsing
app.use('/', express.static(PUBLIC_DIR));
app.use('/assets/css', express.static(PUBLIC_DIR));
app.use('/assets/js', express.static(PUBLIC_DIR));

// app.use(express.static('public/assets/css'))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Helper functions & objects
const jsonDb = new JsonDb(path.join(__dirname, "db/db.json"));

function getPathToFile(fileName) {
    return path.join(PUBLIC_DIR, fileName);
}

function buildHtmlSend(pageName) {
    return [`${getPathToFile(pageName)}.html`, {
        headers: {
            "Content-Type": "text/html"
        }
    }];
}

const foo = {"one": 1, "two": 2, "three": 3};

function buildJsonSend() {
    return [JSON.stringify(foo), {
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    }];
}
// Routes

// Static HTML Files
app.get("/", (req, res) => {
    return res.sendFile(...buildHtmlSend("index"));
});

app.get("/notes", (req, res) => {
    return res.sendFile(...buildHtmlSend("notes"));
});

// Endpoints
app.get("/api/notes", (req, res) => {
    return res.json(jsonDb.selectAll());
});

app.post("/api/notes", (req, res) => {
    let note = req.body;
    try {
        return res.json(jsonDb.insert(note));
    } catch (err) {
        return res.status(400).send(err.toString());
    }
});

app.delete("/api/notes/:id", (req, res) => {
    console.log(req.params);
    try {
        jsonDb.delete(req.params.id);
    } catch (err) {
        return res.status(400).send(err.toString());
    }
    return res.status(204).send();
});

// Adding this last so it doesn't ruin everything -_-

app.get("*", (req, res) => {
    return res.sendFile(...buildHtmlSend("index"));
});

// Attach to port to listen for requests
app.listen(PORT, () => {
    console.log(`App listening on http://localhost:${PORT}`);
});