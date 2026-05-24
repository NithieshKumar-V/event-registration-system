const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// DB connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "sql123$",
    database: "event_db"
});

db.connect(err => {
    if (err) {
        console.log("Database connection failed");
        throw err;
    }
    console.log("MySQL Connected...");
});

// HOME PAGE
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// LOGIN PAGE
app.get("/login", (req, res) => {
    res.sendFile(path.join(__dirname, "login.html"));
});

// SIGNUP PAGE
app.get("/signup", (req, res) => {
    res.sendFile(path.join(__dirname, "signup.html"));
});

// GET EVENTS
app.get("/events", (req, res) => {
    db.query("SELECT * FROM events", (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: "Database error" });
        }

        res.json(result);
    });
});

// REGISTER USER FOR EVENT
app.post("/register", (req, res) => {
    const { name, email, event_id } = req.body;

    db.query(
        "INSERT INTO users (name, email) VALUES (?, ?)",
        [name, email],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).json({ message: "User insert failed" });
            }

            const user_id = result.insertId;

            db.query(
                "INSERT INTO registrations (user_id, event_id) VALUES (?, ?)",
                [user_id, event_id],
                (err) => {

                    if (err) {
                        console.log(err);
                        return res.status(500).json({ message: "Registration failed" });
                    }

                    res.json({ message: "Registration successful!" });
                }
            );
        }
    );
});

// SIGNUP API
app.post("/signup", (req, res) => {

    const { name, email, password } = req.body;

    db.query(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, password],
        (err) => {

            if (err) {
                console.log(err);
                return res.json({
                    message: "User already exists or error"
                });
            }

            res.json({
                message: "Signup successful!"
            });
        }
    );
});

// LOGIN API
app.post("/login", (req, res) => {

    const { email, password } = req.body;

    db.query(
        "SELECT * FROM users WHERE email = ? AND password = ?",
        [email, password],
        (err, result) => {

            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Server error"
                });
            }

            if (result.length > 0) {

                res.json({
                    message: "Login successful!"
                });

            } else {

                res.json({
                    message: "Invalid credentials"
                });
            }
        }
    );
});

// START SERVER
app.listen(5000, () => {
    console.log("Server running on port 5000");
});