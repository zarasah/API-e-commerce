const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('database.db');
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { generateAccessToken } = require('../functions/generateAccessToken');
const { checkAdmin } = require('../functions/checkAdmin');

function getRoot(req, res) {
    db.all('SELECT * FROM products', [], (error, data) => {
        if (error) {
            res.send('Error');
        } else {
            res.send(data);
        }
    })
}

function getById(req, res) {
    const productId = req.params.id;
    db.get('SELECT * FROM products WHERE product_id = ?', [productId], (error, data) => {
        if (error) {
            res.send('Error');
        } else {
            res.send(data);
        }
    })
}

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

function addToCart(req, res) {
    const token = req.headers.authorization;
    const id = req.body.product_id;
    const decoded = jwt.decode(token);
    const { username } = decoded;

    db.get('SELECT * FROM users WHERE username = ?', [username], (error, row) => {
        if (error) {
            res.send(error);
        } else {
            db.get('SELECT * FROM carts WHERE user_id = ?', [row.user_id], (error, row) => {
                if (error) {
                    res.send(error);
                } else {
                    const cartId = row.cart_id;
                    
                    db.get('SELECT * FROM CartItems WHERE cart_id = ? AND product_id = ?', [cartId, id], (error, row) => {
                        if (error) {
                            res.send(error);
                        } else {                            
                            if (row) {
                                let newCount = row.count + 1;

                                db.run('UPDATE CartItems SET count = ? WHERE product_id = ?', [newCount, id], (error) => {
                                    if (error) {
                                        res.send(error);
                                    } else {
                                        res.send(JSON.stringify({ status:'Product added'}));
                                    }
                                })
                            } else {
                                db.run('INSERT INTO CartItems (cart_id, product_id, count) VALUES (?, ?, ?)', [cartId, id, 1], (error) => {
                                    if (error) {
                                    res.send(error);
                                    }
                                    res.send(JSON.stringify({ status:'Product added'}));
                                })
                            }
                        }
                    })
                }
            })
        }
    })
}

function showCart(req, res) {
    const token = req.headers.authorization;
    const decoded = jwt.decode(token);
    const { username } = decoded;

    // db.all(`SELECT productname, price, count
    // FROM CartItems
    // JOIN products ON products.product_id = CartItems.product_id
    // JOIN carts ON carts.cart_id = CartItems.cart_id
    // JOIN users ON users.user_id = carts.user_id
    // WHERE users.username = ?`, [username], (error, data) => {
    //     if (error) {
    //         res.send(error);
    //     } else {
    //         console.log(data)
    //         res.send(data);
    //     }
    // })

    db.all(`SELECT productname, price, count 
    FROM CartItems 
    JOIN products ON products.product_id = CartItems.product_id 
    WHERE cart_id IN 
    (SELECT cart_id FROM carts WHERE user_id IN 
    (SELECT user_id FROM users WHERE username = ?))`, [username], (error, data) => {
        if (error) {
            res.send(error);
        } else {
            res.send(data);
        }
    })
}

function createProduct(req, res) {
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
}

function updateProdut(req, res) {
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
}

function deleteProduct(req, res) {
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
}

module.exports = {
    getRoot,
    getById,
    register,
    login,
    addToCart,
    showCart,
    createProduct,
    updateProdut,
    deleteProduct
}