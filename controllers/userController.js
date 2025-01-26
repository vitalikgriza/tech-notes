const User = require('../models/User');
const Note = require('../models/Note');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');

//@desc     Get all users
//@route    GET /api/users
//@access   Private
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').lean();
  if (!users?.length) {
    return res.status(400).json({message: 'No users found'});
  }
  res.json(users);
});


// @desc    Create a user
// @route   POST /api/users
// @access  Private
const createUser = asyncHandler(async (req, res) => {
  const {username, password, roles} = req.body;

  // Confirm data
  if (!username || !password || !Array.isArray(roles) || !roles.length) {
    return res.status(400).json({message: 'All fields are required'});
  }

  // Check for duplicates
  const duplicate = await User.findOne({username}).lean().exec();
  if (duplicate) {
    return res.status(409).json({message: 'User already exists'});
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10); // salt rounds
  const userObject = {
    username,
    password: hashedPassword,
    roles,
  }

  // Create user
  const user = await User.create(userObject);

  if (user) {
    return res.status(201).json({message: 'User created successfully'});
  } else {
    return res.status(400).json({message: 'Invalid user data'});
  }
});

// @desc    Update a user
// @route   PATCH /api/users
// @access  Private
const updateUser = asyncHandler(async (req, res) => {
  const {id, username, password, active, roles} = req.body;

  // Confirm data
  if (!id || !username || !Array.isArray(roles) || !roles.length || typeof active !== 'boolean') {
    return res.status(400).json({message: 'All fields are required'});
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(404).json({message: 'User not found'});
  }

  // Check for duplicate
  const duplicate = await User.findOne({username}).lean().exec();

  if (duplicate && duplicate._id.toString() !== id) {
    return res.status(409).json({message: 'Username already exists'});
  }

  user.username = username;
  user.roles = roles;
  user.active = active;

  // Hash password
  if (password) {
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
  }

  const updatedUser = await user.save();

  res.json({message: `User ${updatedUser.username} has been updated`});

});

// @desc    Delete a user
// @route   DELETE /api/users
// @access  Private
const deleteUser = asyncHandler(async (req, res) => {
  const {id} = req.body;

  if (!id) {
    return res.status(400).json({message: 'User ID is required'});
  }

  const note = await Note.findOne({user: id}).lean().exec();

  if (note) {
    return res.status(400).json({message: 'User has assigned notes'});
  }

  const user = await User.findById(id).exec();

  if (!user) {
    return res.status(404).json({message: 'User not found'});
  }

  await user.deleteOne();
  const reply = `Username ${user.username} has been deleted`;

  res.json({message: reply});

});


module.exports = {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
}
