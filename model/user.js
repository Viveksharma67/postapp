const mongoose = require("mongoose");

mongoose.connect(`mongodb://127.0.0.1:27017/postapp`);

const userSchema = mongoose.Schema({
    name:String,
    email:String,
    password:String,
    posts : [{ type: mongoose.Schema.Types.ObjectId ,ref:"post"}],
})

module.exports = mongoose.model("user",userSchema)