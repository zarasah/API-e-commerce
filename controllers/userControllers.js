const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('database.db');
const jwt = require("jsonwebtoken");

function addToCart(req, res) {
    const token = req.headers.authorization;
    const id = req.body.product_id;
    const decoded = jwt.decode(token);
    const { username } = decoded;

    db.get(`SELECT * FROM CartItems WHERE cart_id = 
    (SELECT cart_id FROM carts WHERE user_id = 
        (SELECT user_id FROM users WHERE username = ?)) 
        AND product_id = ?`, [username, id], (error, row) => {
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
                    db.run(`INSERT INTO CartItems (cart_id, product_id, count) 
                    SELECT cart_id, ?, ? FROM carts WHERE user_id = 
                    (SELECT user_id FROM users WHERE username = ?)`, 
                    [id, 1, username], (error) => {
                        if (error) {
                        res.send(error);
                        }
                        res.send(JSON.stringify({ status:'Product added'}));
                    })
                }
            }
    })
}

function showCart(req, res) {
    const token = req.headers.authorization;
    const decoded = jwt.decode(token);
    const { username } = decoded;
    
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

module.exports = {
    addToCart,
    showCart
}