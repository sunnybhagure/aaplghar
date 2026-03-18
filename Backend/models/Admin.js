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
  companyName:{
    type:String
  },

  companyAddress:{
    type:String
  },
  createdAt:{
    type:Date,
    default:Date.now
  }
})

// hash password
adminSchema.pre("save", async function(next){
  if(!this.isModified("password")) return next()

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password,salt)
})

adminSchema.methods.matchPassword = async function(enteredPassword){
  return await bcrypt.compare(enteredPassword,this.password)
}

if (!mongoose.models.Admin) {
  mongoose.model("Admin", adminSchema);
}

module.exports = mongoose.model("Admin");