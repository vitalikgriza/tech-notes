const router = require('express').Router();
const User = require('../models/User');
const userController = require('../controllers/userController');

router.route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
