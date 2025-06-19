import User from '../models/user.model.js';
import Note from '../models/note.model.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.userId } }, 
      'name email role' 
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

export const updateSharePermission = async (req, res) => {
  const noteId = req.params.id;
  const { userId, permission } = req.body;

  try {
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    const sharedUser = note.sharedWith.find(
      (share) => share.user.toString() === userId
    );
    if (!sharedUser) return res.status(404).json({ message: 'User not shared' });

    sharedUser.permission = permission;
    await note.save();

    res.json({ message: 'Permission updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  
};

export const updateUserRole = async (req, res) => {
  const { userId, newRole } = req.body;

  if (req.userRole !== 'admin') {
    return res.status(403).json({ message: 'Only admins can update user roles' });
  }

  const user = await User.findByIdAndUpdate(userId, { role: newRole }, { new: true });
  if (!user) return res.status(404).json({ message: 'User not found' });

  res.json({ message: 'Role updated successfully', user });
};

