
import mongoose from 'mongoose';

// userModel.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: String,
  email: String,
  // Other fields
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Listing' }],
});

module.exports = mongoose.model('User', userSchema);
