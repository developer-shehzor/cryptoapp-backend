const express = require('express');
const authController = require('../controller/authController');
const blogController = require('../controller/blogController');
const auth = require('../middleware/auth');
const commentController = require('../controller/commentController');

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

// create
router.post('/blog', auth, blogController.create);

// get all
router.get('/blog/all', auth, blogController.getAll);

// get blog by id
router.get('/blog/:id', auth, blogController.getById);

// update 
router.put('/blog', auth, blogController.update);

// delete
router.delete('/blog/:id', auth, blogController.delete);

// comment

// create comment
router.post('/comment', auth, commentController.create);

// get comments by blog id
router.get('/comment/:id', auth, commentController.getById);

module.exports = router;