const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

// Connect to MongoDB once when the server starts
const url = 'mongodb://127.0.0.1:27017/Login'; // Specify the database name in the URL
const client = new MongoClient(url);

async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Connected to the database');
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
}

connectToDatabase();

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());




app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/signin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});


app.post('/signin', async (req, res) => {
    try {
        const db = client.db(); 
        const collection = db.collection('user');

        const { username, password } = req.body;
        console.log(username  + " " + password);
        const user = await collection.findOne({ username, password });

        if (user) {
            res.status(200).json({ message: 'Login successful' });
            res.end();
        } else {
            res.status(401).json({ message: 'Invalid username or password' });
        }
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).json({ error: 'An error occurred during authentication' });
    }
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.post('/signup', async (req, res) => {
    try {
        const db = client.db(); // Specify the database name
        const collection = db.collection('user');

        const { username, password } = req.body;
        console.log(username  + " " + password);

        // Check if the username already exists in the database
        const existingUser = await collection.findOne({ username });

        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

        // If the username doesn't exist, insert the new user into the database
        await collection.insertOne({ username, password });

        res.status(201).json({ message: 'Signup successful' });
    } catch (error) {
        console.error('Error during signup:', error);
        res.status(500).json({ error: 'An error occurred during signup' });
    }
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
