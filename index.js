const express = require("express");
const db = require("./data/db");
const cors = require("cors");
const server = express();
require('dotenv').config();

const corsOptions = {
  origin: "http://localhost:3000"
};

server.use(express.json());
server.use(cors(corsOptions));

server.get("/notes", async (req, res) => {
  try {
    const notes = await db.select().from("notes");
    res.status(200).json(notes);
  } catch (err) {
    console.log("/notes GET error:", err);
    res
      .status(500)
      .send({ error: "Unable to retrieve notes. Please try again later." });
  }
});

server.get("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const note = await db("notes").where({ id });
    if (note.length === 0) {
      res.status(404).send({ error: "This note does not exist" });
    } else {
      res.status(200).json(note);
    }
  } catch (err) {
    console.log("/notes GET error:", err);
    res
      .status(500)
      .send({ error: "Unable to retrieve this note. Please try again later." });
  }
});

server.post("/notes", async (req, res) => {
  let note = req.body;
  if (!"title" in note) {
    res.status(400).send({ error: "Your note must have a title." });
  } else if (note.title.length > 40) {
    res
      .status(400)
      .send({ error: "Titles must be shorter than 40 characters." });
  }
  try {
    await db.insert(note).into("notes");
    res.status(201).json({ msg: "Your note was successfully saved." });
  } catch (err) {
    console.log("/notes POST error:", err);
    res
      .status(500)
      .send({ error: "Your note could not be saved. Please try again later." });
  }
});

server.put("/notes/edit/:id", async (req, res) => {
  const changes = req.body;
  const { id } = req.params;
  const { title, content } = changes;
  try {
    const count = await db("notes")
      .where({ id })
      .update(changes);

    if (count === 0) {
      res.status(404).send({ error: "This note does not exist" });
    } else {
      res.status(200).json({
        msg: `Note ${id} has successfully been updated as:`,
        title,
        content
      });
    }
  } catch (err) {
    console.log("/notes PUT error:", err);
    res.status(500).send({
      error: "Your note could not be updated. Please try again later."
    });
  }
});

server.delete("/notes/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const count = await db("notes")
      .where({ id })
      .del();

    if (count === 0) {
      res.status(404).send({ error: "This note does not exist" });
    } else {
      res.status(200).json({ msg: `Note #${id} has been deleted.` });
    }
  } catch (err) {
    console.log("/notes DELETE error:", err);
    res.status(500).send({ error: "Your note could not be deleted." });
  }
});

let port = process.env.PORT;
 if (port == null || port == "") {
   port = 8000;
 }
 server.listen(port);
