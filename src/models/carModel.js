const mongoose = require("mongoose");
const CarSchema = new mongoose.Schema({
  model: {
    type: String,
    required: [true, "the model of the car is required"],
  },
  color: {
    type: String,
    required: [true, "the color of the car is required"],
  },
  quantity: {
    type: Number,
    required: [true, "please specify a quantity"],
  },
});

const Car = mongoose.model("Car", CarSchema);
module.exports = Car;
