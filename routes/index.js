const express = require('express');
const authController = require('../controller/authController');
const auth = require('../middleware/auth');

const router = express.Router();


// user


// login
router.post('/login', authController.login);

// register
router.post('/register', authController.register);

// logout
router.post('/logout', auth, authController.logout);

// refresh
router.get('/refresh', authController.refresh);

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