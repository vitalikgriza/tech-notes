const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');

//@desc     Get all notes
//@route    GET /api/notes
//@access   Private
const getAllNotes = asyncHandler(async (req, res) => {
  const notes = await Note.find().lean();
  if (!notes?.length) {
    return res.status(400).json({message: 'No notes found'});
  }

  const notesWithUser = await Promise.all(notes.map(async note => {
    const user = await User.findById(note.user).select('-password').lean();
    return {...note, username: user.username};
  }));

  res.json(notesWithUser);
});

// @desc    Create a note
// @route   POST /api/notes
// @access  Private
const createNote = asyncHandler(async (req, res) => {
  const {title, text, user} = req.body;

  // Confirm data
  if (!title || !text || !user) {
    return res.status(400).json({message: 'All fields are required'});
  }

  // Check for duplicates
  const duplicate = await Note.findOne({title}).lean().exec();
  if (duplicate) {
    return res.status(409).json({message: 'Note already exists'});
  }

  // Create note
  const note = await Note.create({title, text, user});

  if (note) {
    return res.status(201).json({message: 'Note created successfully'});
  } else {
    return res.status(400).json({message: 'Invalid note data'});
  }
});


// @desc    Update a note
// @route   PATCH /api/notes
// @access  Private
const updateNote = asyncHandler(async (req, res) => {
  const {id, title, text, user, completed} = req.body;

  // Confirm data
  if (!id || !title || !text || !user || typeof completed !== 'boolean') {
    return res.status(400).json({message: 'All fields are required'});
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(404).json({message: 'Note not found'});
  }

  // check for duplicates
  const duplicate = await Note.findOne({title}).lean().exec();
  if (duplicate) {
    return res.status(409).json({message: 'Note already with same title exists'});
  }

  const storedUser = await User.findById(user).exec();
  if (!storedUser) {
    return res.status(404).json({message: 'User not found'});
  }

  // Update note
  note.title = title;
  note.text = text;
  note.user = user;
  note.completed = completed;

  note.save();

  res.json({message: 'Note updated successfully'});
});

// @desc    Delete a note
// @route   DELETE /api/notes
// @access  Private
const deleteNote = asyncHandler(async (req, res) => {
  const {id} = req.body;

  if (!id) {
    return res.status(400).json({message: 'Note ID is required'});
  }

  const note = await Note.findById(id).exec();

  if (!note) {
    return res.status(404).json({message: 'Note not found'});
  }

  await note.deleteOne();

  res.json({message: 'Note deleted successfully'});
});


module.exports = {getAllNotes, createNote, updateNote, deleteNote};
