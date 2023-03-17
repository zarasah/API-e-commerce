const jwt = require('jsonwebtoken');
require('dotenv').config();
const SECRET = process.env.SECRET;

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

module.exports = { authenticateToken }