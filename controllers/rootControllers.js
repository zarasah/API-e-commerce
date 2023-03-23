const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('database.db');

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

module.exports = {
    getRoot,
    getById
}