const express = require('express')
require("dotenv").config();
require("./config/database").connect();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require("./middleware/auth");
const User = require('./model/user')


const app = express();
app.use(express.json());
app.use(cookieParser());
app.get("/", (req, res) =>{
    res.send("<h1>Hello from Auth system</h1>")
});

app.post("/register", async (req, res) =>{
    try {
        const { firstname, lastname, email, password } = req.body

    if( !(email && password && firstname && lastname)){
       return res.status(400).send('All feilds are required')
    }

    const existingUser = await User.findOne({email}).exec()  // promise

    if (existingUser){
       return res.status(401).send('User already exists')
    }

const myEncPassword = await bcrypt.hash(password, 10)

const user = await User.create({
    firstname: firstname,
    lastname: lastname,
    email: email.toLowerCase(),
    password: myEncPassword
});

//token
const token = jwt.sign(
    { user_id: user._id, email }, //user is refering to const user, and ._id is property in db  //._ syntax is weired so passed(alias) it to user_id
    process.env.SECRET_KEY, 
    {
        expiresIn: "2h"
    }
)
user.token = token;
// update or not in db

// todo: handle pw situation
user.password = undefined

return res.status(201).json(user);
} catch (error){
console.log("EEEEEEEEE-", error)
return res.send({error:"something went wrong"})

}
});
// get all information, check mandatory fields, get user from db, compare and verify password, give token or other info to the user
app.post("/login", async (req,res)=>{
    try {
      const { email, password } = req.body  

      if(!(email && password)){
        res.status(400).send("feild is missing")
      }

      const user = await User.findOne({email})

      if(!user){
        res.status(400).send("you are not registered user")
      }


if(user && await bcrypt.compare(password, user.password)){
    const token = jwt.sign(
        {user_id: user._id, email},
        process.env.SECRET_KEY,
        {
            expiresIn: '2h'
        }
    )

    user.token = token
    user.password= undefined
    // res.status(200).json(user)

    // if you want to use cookies
    const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
    };

    res.status(200).cookie('token', token, options).json({
        success: true,
        token,
        user
    })
}
res.send(400).send("email or password is incorrect")
    } catch (error) {
        console.log(error);
    }
     
})

//16 video lco pro backend web vs mobile
app.get("/dashboard", auth, (req, res)=>{
    res.send('welcome to secret information')
});

module.exports = app;
