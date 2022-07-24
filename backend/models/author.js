const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 4
  },
  born: {
    type: Number
  },
  books: [{ type: String }]
})

authorSchema.plugin(uniqueValidator)

module.exports = mongoose.model('Author', authorSchema)
