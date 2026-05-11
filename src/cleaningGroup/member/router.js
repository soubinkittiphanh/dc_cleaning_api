const express = require('express');
const router = express.Router();
const MemberController = require('./controller'); // Adjust path as needed

// GET /api/member - Get all active members
router.get('/', MemberController.getAllMembers);

// GET /api/member/pending - Get all pending members for approval
router.get('/pending', MemberController.getPendingMembers);

// PUT /api/member/:id/approve - Approve member
router.put('/:id/approve', MemberController.approveMember);

// PUT /api/member/:id/reject - Reject member
router.put('/:id/reject', MemberController.rejectMember);

// GET /api/member/:id - Get member by ID
router.get('/:id', MemberController.getMemberById);

// POST /api/member - Create new member
router.post('/', MemberController.createMember);

// POST /api/member/login - Member login
router.post('/login', MemberController.login);

// POST /api/member/social-login - Social login
router.post('/social-login', MemberController.socialLogin);

// PUT /api/member/:id - Update member
router.put('/:id', MemberController.updateMember);

// DELETE /api/member/:id - Delete member (soft delete)
router.delete('/:id', MemberController.deleteMember);

module.exports = router;
