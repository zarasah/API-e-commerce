const jwt = require("jsonwebtoken");

function checkAdmin(req, res) {
    const token = req.headers.authorization;
    const decoded = jwt.decode(token);

    if (decoded.role === 0) {
        return true
    }
    return false;
}

module.exports = { checkAdmin }