const mongoose=require("mongoose")
const { required } = require("nodemon/lib/config")
const validator=require("validator")
const messagePostSchema=new mongoose.Schema({
   message:{
    type:String,
    require:true
   },
   day: {
     type: String, required: true 
    },
   time: {
     type: String, 
     
     required:true
    }
   

})
const messageSchema=new mongoose.model("messageSchema",messagePostSchema)
module.exports=messageSchema