const mongoose = require("mongoose");

// Define the Coupon schema
const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique:true
  },
  couponName:{
    type:String
  },
  discount: {
    type: Number,
    required: true,
  },
  maxdiscount: {
    type: Number,
    required: true,
  },
  expirationDate: {
    type: Date,
    required: true,
  },
  usedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create and export the Coupon model
const Coupon = mongoose.model("Coupon", couponSchema);

module.exports = Coupon;
