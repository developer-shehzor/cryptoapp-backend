const express = require('express');
const user = require('../models/user');
const authController = require('../controller/authController')

const router = express.Router();

// testing
router.get('/test', (req, res) => res.json({msg: 'Working!'}))
// user


// login
router.post('/login', authController.login);
// register
router.post('/register', authController.register);
// logout
// refresh

// blog
// CRUD
// create
// read all blogs
// read blog by id
// update 
// delete

// comment
// create comment
// read comments by blog id

module.exports = router;