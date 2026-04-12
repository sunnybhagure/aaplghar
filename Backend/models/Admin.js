const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
      type: String,
      required: true,
      match: [/^[0-9]{10}$/, "Please add a valid 10-digit phone number"],
    },
  role: {
    type: String,
    enum: ['admin', 'builder'],
    default: 'builder'
  },
  companyName:{
    type:String
  },
  companyAddress:{
    type:String
  },
  about: {
    type: String,
    default: ""
  },
  coverImage: {
    type: String,
    default: ""
  },
  since: {
    type: String,
    default: ""
  },
  faqs: [
    {
      question: {
        type: String,
        default: ""
      },
      answer: {
        type: String,
        default: ""
      }
    }
  ],
  createdAt:{
    type:Date,
    default:Date.now
  }
})

// hash password before saving
adminSchema.pre("save", async function() {
  // Only hash password if it has been modified
  if (!this.isModified("password")) {
    return
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

adminSchema.methods.matchPassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword,this.password)
}

module.exports = mongoose.model("Admin", adminSchema);

