import mongoose from 'mongoose';
import validator from 'validator';

export const rentalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      default: 0
    },
    link: {
      type: String,
      required: true,
      validate: [v => validator.isURL(v), 'Not a valid link url'],
      unique: true
    },
    area: {
      type: Number,
      required: true,
      default: 0
    },
    type: {
      type: String,
      required: true,
    },
    // tag: {
    //   type: [String],
    //   required: true
    // }
  },
  { timestamps: true }
)

export const Rental = mongoose.model('rental', rentalSchema);