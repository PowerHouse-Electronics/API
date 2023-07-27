const {Schema, model} = require('mongoose');

const computerSchema = new Schema({
    brand: {
      type: String,
      required: true
    },
    model: {
      type: String,
      required: true
    },
    processor: {
      type: String,
      required: true
    },
    ram: {
      type: Number,
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
    operatingSystem: {
      type: String,
      required: true
    },
    graphicsCard: {
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

  module.exports = model('Computer', computerSchema, 'computer');