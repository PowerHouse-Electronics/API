const {Schema, model} = require('mongoose');


const cellphoneSchema = new Schema({
  brand: {
    type: String, 
    required: true
  },
  model: {
    type: String,
    required: true
  },
  color: {
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
  screenResolution: {
    type: String,
    required: true
  },
  cameraResolution: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});


module.exports = model('CellPhone', cellphoneSchema, 'cellPhone' );

