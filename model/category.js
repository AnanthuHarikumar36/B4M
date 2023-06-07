

const mongoose = require("mongoose")

const categoryschema= new mongoose.Schema({
    CategoryName:{
        type:String,
    },
    categoryDiscription:{
        type:String
    },
    isListed:{
        type:Boolean,
        default:true
    }
})

const Category = mongoose.model("category",categoryschema)

module.exports=Category