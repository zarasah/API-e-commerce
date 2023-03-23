const sqlite = require('sqlite3').verbose();
const db = new sqlite.Database('database.db');
const { checkAdmin } = require('../functions/checkAdmin');

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
    createProduct,
    updateProdut,
    deleteProduct
}