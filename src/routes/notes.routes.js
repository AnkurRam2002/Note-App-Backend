import express from 'express';
import { createNote, getNotes, updateNote, deleteNote, shareNote, getNote, getSharedUsers, revokeShare } from '../controllers/notes.controller.js';
import { getUsers, updateSharePermission } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.post('/', createNote);
router.get('/', getNotes);
router.get('/users', getUsers);
router.get('/:id', getNote); 
router.put('/edit/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/share/:id', shareNote);
router.get('/:id/shared-users/:id', getSharedUsers);
router.delete('/:id/share/:userId', revokeShare);
router.post('/:id/update-share-permission', updateSharePermission);



export default router;
