const sql = 'CREATE TABLE IF NOT EXISTS users (user_id INTEGER PRIMARY KEY, username TEXT, password TEXT, role INTEGER)';

function createUsersTable(db) {
    db.run(sql);
}

module.exports = { createUsersTable }