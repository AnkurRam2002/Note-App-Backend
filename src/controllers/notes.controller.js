import Note from '../models/note.model.js';

export const createNote = async (req, res) => {
  const note = new Note({ ...req.body, owner: req.userId });
  await note.save();
  res.status(201).json(note);
};

export const getNotes = async (req, res) => {
  const { search = '' } = req.query;

  let query = {
    $and: [
      { $or: [{ owner: req.userId }, { 'sharedWith.user': req.userId }] },
      {
        $or: [
          { title: new RegExp(search, 'i') },
          { content: new RegExp(search, 'i') },
          { tags: new RegExp(search, 'i') }
        ]
      }
    ]
  };

  if (req.userRole === 'admin') {
    query = {}; 
  }

  try {
    const notes = await Note.find(query)
      .populate('owner', 'name email') 
      .exec();

    const total = await Note.countDocuments(query);
    res.json(notes);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err });
  }
};

export const updateNote = async (req, res) => {
  let query = {
      _id: req.params.id,
      $or: [
        { owner: req.userId },
        { 'sharedWith.user': req.userId }
      ]
    };

    if (req.userRole === 'admin') {
      query = { _id: req.params.id };
    }

    const note = await Note.findOneAndUpdate(
      query,
      req.body,
      { new: true }
    );
  if (!note) return res.status(404).json({ message: 'Note not found' });
  res.json(note);
};

export const deleteNote = async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id});
  if (!note) return res.status(404).json({ message: 'Note not found or Unauthorized' });
  res.json({ message: 'Deleted' });
};

export const shareNote = async (req, res) => {
  const { noteId, userId, permission } = req.body;

  const note = await Note.findById(noteId);
  if (!note) return res.status(404).json({ message: 'Note not found' });

  // only owner can share
  if (note.owner.toString() !== req.userId && req.userRole !== 'admin')
    return res.status(403).json({ message: 'Unauthorized' });

  // Check if already shared with this user
  const alreadyShared = note.sharedWith.some(
    (share) => share.user.toString() === userId
  );

  if (alreadyShared) {
    return res.status(400).json({ message: 'Note already shared with this user' });
  }

  note.sharedWith.push({ user: userId, permission });
  await note.save();

  res.json({ message: 'Note shared successfully' });
};

export const getNote = async (req, res) => {

  const query = { _id: req.params.id };
  
  if (req.userRole !== 'admin') {
    query.$or = [
      { owner: req.userId },
      { 'sharedWith.user': req.userId }
    ];
  }

  const note = await Note.findOne(query)
  .populate('owner', 'name email')
  .populate('sharedWith.user', 'name email');

  if (!note) return res.status(404).json({ message: 'Note not found' });

  res.json(note);
}

export const getSharedUsers = async (req, res) => {
  const noteId = req.params.id;
  console.log('Fetching shared users for note:', noteId);
  console.log('User ID:', req.userId);

  try {
    const note = await Note.findById(noteId).populate('sharedWith.user', 'name email');
    console.log('Note owner:', note.owner);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Only owner can view
    if (note.owner.toString() !== req.userId)
      return res.status(403).json({ message: 'Not authorized' });

    const sharedUsers = note.sharedWith.map(sw => ({
      _id: sw.user._id,
      name: sw.user.name,
      email: sw.user.email,
      permission: sw.permission
    }));

    res.json(sharedUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const revokeShare = async (req, res) => {
  const noteId = req.params.id;
  const targetUserId = req.params.userId;

  try {
    const note = await Note.findById(noteId);
    if (!note) return res.status(404).json({ message: 'Note not found' });

    // Only owner can revoke
    if (note.owner.toString() !== req.userId)
      return res.status(403).json({ message: 'Not authorized' });

    note.sharedWith = note.sharedWith.filter(
      (share) => share.user.toString() !== targetUserId
    );

    await note.save();
    res.json({ message: 'Access revoked successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getNoteById = async (req, res) => {
  await Note.findById(req.params.id)
  .populate('owner', 'name email')
  .populate('sharedWith.user', 'name email')
  .then(note => {
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  })  
  .catch(err => {
    res.status(500).json({ message: 'Server error', error: err });
  });
};

