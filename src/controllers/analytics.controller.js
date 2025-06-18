import Note from '../models/note.model.js';
import User from '../models/user.model.js';
import mongoose from 'mongoose';

export const getAnalytics = async (req, res) => {
  const mostActiveUsers = await Note.aggregate([
    { $group: { _id: '$owner', notes: { $sum: 1 } } },
    { $sort: { notes: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'owner' } },
    { $unwind: '$owner' },
    { $project: { name: '$owner.name', notes: 1 } }
  ]);

  const mostUsedTags = await Note.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 }
  ]);

  const notesPerDay = await Note.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: -1 } },
    { $limit: 7 }
  ]);

  res.json({ mostActiveUsers, mostUsedTags, notesPerDay });
};
