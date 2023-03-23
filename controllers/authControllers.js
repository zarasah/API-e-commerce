const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('database.db');
const CryptoJS = require("crypto-js");
const { generateAccessToken } = require('../middlewares/generateAccessToken');

function register(req, res) {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], (error, row) => {
        if (error) {
            res.send('Error from username check');
        }
        if (row) {
            res.send(JSON.stringify({ status: 'Username Already Exists'}));
        } else {
            const sql = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
            const hashed_password = CryptoJS.SHA256(password).toString();

            db.run(sql, [username, hashed_password, 1], (error) => {
                if (error) {
                    res.send('Error 1');
                }
                db.get('SELECT * FROM users WHERE username = ?', [username], (error, row) => {
                    if (error) {
                        res.send('Error2');
                    } else {
                        db.run('INSERT INTO carts (user_id) VALUES (?)', [row.user_id], (error) => {
                            if (error) {
                                res.send('Error3');
                            } else {
                                res.send(JSON.stringify({ status:'User created' }));
                            }
                        })
                    }
                })
            })
        }
    })
}

function login(req, res) {
    const {username, password } = req.body;
    const hashed_password = CryptoJS.SHA256(password).toString();

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.get(sql, [username], (error, row) => {
        if (error) {
            res.send('Error');
        }

        if (!row) {
            res.send(JSON.stringify({ status:'No Such User' }));
        } else if(username === row.username && hashed_password === row.password) {
            const token = generateAccessToken(row.username, row.role);
            res.send(JSON.stringify({status:'Logged in', jwt: token}));
        } else {
            res.send(JSON.stringify({ status:'Wrong Password' }));
        }
    })
}

module.exports = {
    register,
    login
}