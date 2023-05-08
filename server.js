// pull in all of the needed modules and utilities
const express = require('express');
const PORT = process.env.PORT || 3001;
const path = require('path');
const app = express();
const { readFromFile, readAndAppend, writeToFile } = require('./helpers/utils');
const { v4: uuidv4 } = require('uuid');

// middleware for the project
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));

// * HTML ROUTES *

// route for the notes.html file
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/notes.html'));
});

// * API ROUTES *

// this app.get route will return the db.json notes 
app.get('/api/notes', async(req, res) => {
    try {
        const rawNotes = await readFromFile('./db/db.json');

        const data = JSON.parse(rawNotes);

        res.json(data);
    } catch(err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// this app.get route will add new notes to the list
app.post('/api/notes', async(req, res) => {
    try {

        const { title, text} = req.body;

        const newNote = {
            id: uuidv4(),
            title,
            text
        }

        await readAndAppend(newNote, './db/db.json');

        res.json('success');
    } catch(err) {
        console.log(err);
        res.status(500).json(err);
    }
});

// app.delete rout to delete notes based off of the generated id
app.delete('/api/notes/:id', async(req, res) => {
    try {

        const noteToDelete = req.params.id;

        const rawFile = await readFromFile('./db/db.json');
        const data = JSON.parse(rawFile);

        const removedNote = data.filter((id) => {
            return id.id !== noteToDelete;
        });

        await writeToFile('./db/db.json', removedNote);

        res.json(removedNote);
    } catch(err) {
        res.json(err);
    }
});

// route for the index.html file
app.get('/*', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});




app.listen(PORT, (err) => {
    if (err) console.log(err);
    console.log(`App listening on Port: ${PORT}`);
})