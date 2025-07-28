const express = require('express');
const authrouter = express.Router();
const authMiddleware = require('../middleware/authMiddleware');

authrouter.get('/protected', authMiddleware, (req, res) => {
  return res.status(200).json({
    message: `Hello user ${req.user.userId}, this is a protected route.`,
    loggedIn: true,
    user: req.user
  });
});

module.exports = authrouter;
