const {Schema, model} = require('mongoose');

const gameConsoleSchema = new Schema({
    brand: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    storage: {
      type: Number,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    features: {
        type: [String],
        required: true
      },
    color: {
      type: String,
      required: true
    },
    stock: {
      type: Number,
      required: true
    },
    image: {
      type: String,
      required: true
    }
  });

  module.exports = model('gConsole', gameConsoleSchema, 'gConsole');