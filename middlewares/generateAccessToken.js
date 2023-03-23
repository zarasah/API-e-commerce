const jwt = require("jsonwebtoken");
require('dotenv').config();
const SECRET = process.env.SECRET;

function generateAccessToken(username, role) {
    return jwt.sign({ username, role }, SECRET, { expiresIn: "36000s" });
}

module.exports = { generateAccessToken }