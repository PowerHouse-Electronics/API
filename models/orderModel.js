const {Schema, model} = require('mongoose');

const orderSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    products: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        price: {
          type: Number,
          required: true
        }
      }
    ],
    total: {
      type: Number,
      required: true
    },
    shippingAddress: {
      type: String,
      required: true
    },
    status: {
      type: String,
      required: true,
      default: 'pending'
    },
    createdAt: {
      type: Date,
      default: Date.now,
      required: true
    }
  });
  

module.exports = model('Order', orderSchema, 'order')