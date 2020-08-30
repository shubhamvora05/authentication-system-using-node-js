//jshint esversion:6
require('dotenv').config();
const express=require("express");
const ejs=require("ejs");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
var encrypt = require('mongoose-encryption');

const app=express();
console.log(process.env.API_KEY);

app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology:true});

const userSchema=new mongoose.Schema({
  Email:String,
  Password:String
});

//using mongoose encryption plugin to encrypt the password and we get encrytion key from .env file

userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ['Password'] });
//mongoose model for users
const User=new mongoose.model("User",userSchema);

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});
//register page
app.post("/register",function(req,res){
  const newUser=new User({
    Email:req.body.username,
    Password: req.body.password
  });
newUser.save(function(err){
  if(err){
    console.log(err);
  }else{
    res.render("secrets");
  }
});
});
// login page
app.post("/login",function(req,res){
  const Username=req.body.username;
  const Password=req.body.password;
  User.findOne({Email:Username},function(err,founduser){
    if(err){
      console.log(err);
    }else{
      if(founduser){
        if(founduser.Password===Password){
          res.render("secrets");
        }
      }
    }
  });
});




app.listen(3000,function(){
  console.log("server started on port 3000");
});
