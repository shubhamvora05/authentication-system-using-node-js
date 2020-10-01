//jshint esversion:6
require('dotenv').config();
const express=require("express");
const bodyParser=require("body-parser");
const ejs=require("ejs");
const mongoose=require("mongoose");
const session=require("express-session");
const passport=require("passport");
const passportLocalMongoose=require("passport-local-mongoose");
//var encrypt = require('mongoose-encryption');
//const md5=require("md5");
//const bcrypt=require("bcrypt");
//const saltrounds=10;

const app=express();


app.use(express.static("public"));
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));

app.use(session({
  secret: "here, you can write any long string.",
  resave: false,
  saveUninitialized: true,
}));
//initializing passport session and use for session npm
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://localhost:27017/userDB",{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.set("useCreateIndex",true)

const userSchema=new mongoose.Schema({
  Email:String,
  Password:String,
  secret:String
});
//enabling passportLocalMongoose package
userSchema.plugin(passportLocalMongoose);

//using mongoose encryption plugin to encrypt the password and we get encrytion key from .env file

//userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields: ['Password'] });
//mongoose model for users
const User=new mongoose.model("User",userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/",function(req,res){
  res.render("home");
});

app.get("/login",function(req,res){
  res.render("login");
});

app.get("/register",function(req,res){
  res.render("register");
});
//checking user is authenticated or not
app.get("/secrets",function(req,res){
User.find({"secret":{$ne:null}},function(err,foundUser){
  if(err){
    console.log(err);
  }else{
    if(foundUser){
      res.render("secrets",{usersWWithSecrets:foundUser});
    }
  }
});
});

app.get("/logout",function(req,res){
  req.logout();
  res.redirect("/");
});

app.get("/submit",function(req,res){
  if(req.isAuthenticated()){
    res.render("submit");
  }else{
    res.redirect("/login");
  }
});

app.post("/submit",function(req,res){
  const submit=req.body.secret;
  User.findById(req.user.id,function(err,foundUser){
    if(foundUser){
      foundUser.secrets=submit;
      foundUser.save(function(){
        res.redirect("/secrets");
      });
    }else{console.log(err);}
  });
});

//register page
app.post("/register",function(req,res){
//use of bcrypt npm
// bcrypt.hash(req.body.password,saltrounds,function(err,hash){
//   const newUser=new User({
//     Email:req.body.username,
//     Password:hash
//   });
// newUser.save(function(err){
//   if(err){
//     console.log(err);
//   }else{
//     res.render("secrets");
//   }
// });
// });

//using level 5 security with passport.js
User.register({username:req.body.username},req.body.password,function(err,user){
  if(err){
    console.log(err);
    res.redirect("/register");
  }else{
    passport.authenticate("local")(req,res,function(){
      res.redirect("/secrets");
    });
  }
});
});

// login page
app.post("/login",function(req,res){
  // const Username=req.body.username;
  // const Password=req.body.password;
  // User.findOne({Email:Username},function(err,founduser){
  //   if(err){
  //     console.log(err);
  //   }else{
  //     if(founduser){
  //       //use of bcrypt to use more rounds of hash function
  //       bcrypt.compare(Password, founduser.Password, function(err, result) {
  //         if(result===true){
  //           res.render("secrets");}
  // });
  //     }
  //   }
  // });

  //using level 5 security with passport.js

  const user=new User({
    username:req.body.username,
    password:req.body.password
  });
  req.login(user,function(err){
    if(err){
      console.log(err);
    }else{
      passport.authenticate("local")(req,res,function(){
        res.redirect("/secrets");
      });
    }
  });
});




app.listen(3000,function(){
  console.log("server started on port 3000");
});
