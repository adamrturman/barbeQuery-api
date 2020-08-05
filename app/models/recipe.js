const mongoose = require('mongoose')

const recipeSchema = new mongoose.Schema({
  ingredient: {
    type: String,
    required: true
  },
  temperature: {
    type: Number,
    required: true,
    min: 180,
    max: 350
  },
  time: {
    type: Number,
    required: true,
    min: 2,
    max: 24
  },
  fuel: {
    type: String,
    required: true
  },
  directions: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('Recipe', recipeSchema)
