import User from '../models/user.model.js';

export const getUsers = async (req, res) => {
  try {
    const users = await User.find(
      { _id: { $ne: req.userId } }, // exclude the current user
      'name' // fetch only name and email fields
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};