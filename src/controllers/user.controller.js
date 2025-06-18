import User from '../models/user.model.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.userId } }, 
      'name' 
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};