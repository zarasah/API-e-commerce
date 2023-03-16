const sql = 'CREATE TABLE IF NOT EXISTS CartItems (CartItem_id INTEGER PRIMARY KEY, cart_id INTEGER NOT NULL, product_id INTEGER NOT NULL, FOREIGN KEY (cart_id) REFERENCES carts(cart_id),FOREIGN KEY (product_id) REFERENCES products(product_id))';

function createCartItemsTable(db) {
    db.run(sql);
}

module.exports = { createCartItemsTable }