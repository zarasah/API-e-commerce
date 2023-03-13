const express = require('express');
const sqlite = require('sqlite3').verbose();
const app = express();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.SECRET;
app.use(express.json());

const db = new sqlite.Database("database.db");

app.get('/', (req, res) => {
    db.all('SELECT * FROM products', [], (error, data) => {
        if (error) {
            res.send('Error');
        } else {
            res.send(data);
        }
    })
})

app.get('/:id', (req, res) => {
    const productId = req.params.id;
    db.get('SELECT * FROM products WHERE product_id = ?', [productId], (error, data) => {
        if (error) {
            res.send('Error');
        } else {
            res.send(data);
        }
    })
})

app.post('/register', (req, res) => {
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
})

app.post('/login', (req, res) => {
    const {username, password } =req.body;
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
})

app.post('/addtocart', authenticateToken, async (req, res) => {
    const token = req.headers.authorization;
    const decoded = jwt.decode(token);
    const { username } = decoded;

    db.get('SELECT * FROM users WHERE username = ?', [username], (error, row) => {
        if (error) {
            res.send('Error');
        } else {
            db.get('SELECT * FROM carts WHERE user_id = ?', [row.user_id], (error, row) => {
                if (error) {
                    res.send('Error');
                } else {
                    db.run('INSERT INTO CartItems (cart_id, product_id) VALUES (?, ?)', [row.cart_id, req.body.id], (error) => {
                        if (error) {
                            res.send('Error');
                        } else {
                            res.send(JSON.stringify({ status:'Product added'}));
                        }
                    })
                }
            })
        }
    })
})

app.post('/createproduct', authenticateToken, (req, res) => {
    const isAdmin = checkAdmin(req, res);
    if (isAdmin) {
        const { productname, price, total } = req.body;
  
        db.run('INSERT INTO products (productname, price, total) VALUES (?, ?, ?)', [productname, price, total], (error, data) => {
            if (error) {
                res.send(error);
            } else {
                res.send(JSON.stringify({ status: "Product added" }));
            }
        })
    } else {
        res.send(JSON.stringify({ status: "Denied Access" }));
    }
})

app.put('/updateproduct', authenticateToken, (req, res) => {
    const isAdmin = checkAdmin(req, res);
    if (isAdmin) {
        const { product_id, productname, price, total } = req.body;
  
        db.run('UPDATE products SET productname = ?, price = ?, total = ? WHERE product_id = ?', [productname, price, total, product_id], (error, data) => {
            if (error) {
                res.send(error);
            } else {
                res.send(JSON.stringify({ status: "Product updated" }));
            }
        })
    } else {
        res.send(JSON.stringify({ status: "Denied Access" }));
    }
})

app.delete('/deleteproduct', authenticateToken, (req, res) => {
    const isAdmin = checkAdmin(req, res);
    if (isAdmin) {
        const { product_id } = req.body;
  
        db.run('DELETE FROM products WHERE product_id = ?', [product_id], (error, data) => {
            if (error) {
                res.send(error);
            } else {
                res.send(JSON.stringify({ status: "Product deleted" }));
            }
        })
    } else {
        res.send(JSON.stringify({ status: "Denied Access" }));
    }
})

function generateAccessToken(username, role) {
    return jwt.sign({ username, role }, SECRET, { expiresIn: "36000s" });
}

function authenticateToken(req, res, next) {
    const token = req.headers.authorization;
    
    if (token == null){
        return res.sendStatus(401);
    } 
    
    jwt.verify(token, SECRET, (err, decoded) => {
      if (err) {
        return res.sendStatus(403);
      }    
      next();
    })
  }

  function checkAdmin(req, res) {
    const token = req.headers.authorization;
    const decoded = jwt.decode(token);

    if (decoded.role === 0) {
        return true
    }
    return false;
  }


app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`)
})