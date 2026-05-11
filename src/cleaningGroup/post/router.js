const express = require('express');
const router = express.Router();
const controller = require('./controller');
const { validateToken } = require('../../api').jwtApi;

router.get('/', controller.getPosts);
router.post('/', controller.createPost);
router.post('/like', controller.toggleLike);
router.post('/comment', controller.addComment);
router.get('/:postId/comments', controller.getComments);

module.exports = router;
