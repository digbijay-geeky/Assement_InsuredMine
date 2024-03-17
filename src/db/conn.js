const mongoose=require("mongoose")
require("dotenv").config()
mongoose.connect(process.env.DB_URL,{
})
.then(()=>{
    console.log("connection is successful")
})