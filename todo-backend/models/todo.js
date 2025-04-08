const mongoose = require("mongoose")

const todoSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ["work", "personal", "study", "shopping", "other"], // You can customize these
    default: "other"
  },  deadline: { type: Date },
  status: { type: String, enum: ["pending", "success"], default: "pending" },
  tags : {type : [String] , default:[]}
}, { timestamps: true });

module.exports =  mongoose.model("Todo",todoSchema)