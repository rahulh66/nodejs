const express  = require('express')
const morgan   = require('morgan')
const mongoose = require('mongoose')
const app      = express()
app.use(express.json())
app.use(morgan('dev'))

//db connection 
const dbconnect = async () =>{
    try{
        await mongoose.connect("mongodb://localhost/27017/maydb")
        console.log("DB connected successfully");
    }catch(error){
        console.error("some issue",error);
    }
}
dbconnect();

// connection code end

const userSchema = new mongoose.Schema({
    name: String,
    lname: String,
    email: String,
    age: Number
})

const User = mongoose.model('users',userSchema)
//const data = User.find()
const users = await User.find().lean();
console.log(users);


app.get('/test', (req,res,next) =>{
    try{
        res.json({
            statuscode:200,
            data:"successfull done"
        })

    }catch(error){
        res.status(500).json({
            message: "some issue occur",
            error:console.error("Issue",error)
        })
    }
})
app.listen(3000, () => {
    console.log("Server is running port")
})