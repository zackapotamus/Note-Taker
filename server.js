// Dependencies
const express = require("express");
const app = express();
const PORT = 3000;
const path = require("path");
const PUBLIC_DIR = path.resolve("public")
// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Helper functions
function getPathToFile(fileName) {
    return path.join(PUBLIC_DIR, fileName);
}

// Routes
app.get("/", (req,res) => {
    return res.sendFile(getPathToFile("index.html"));
});