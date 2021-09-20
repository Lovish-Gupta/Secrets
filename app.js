//jshint esversion:6
require('dotenv').config()
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");
const app = express();

mongoose.connect("mongodb://localhost:27017/userDB");
app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended: true}));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
});

const secret = process.env.SECRET;
userSchema.plugin(encrypt, { secret: secret, encryptedFields: ["password"] });
const Users = new mongoose.model("User", userSchema);

app.route("/")
    .get(function(req, res){
        res.render("home");
    });

app.route("/login")
    .get(function(req,res){
        res.render("login");
    })
    .post(function(req,res){
        Users.findOne({email: req.body.username}, function(err,user){
            if(err)
                console.log(err);
            else{
                if(user && user.password === req.body.password)
                    res.render("secrets");
                else
                    res.render("login");
            }
        });
    });

app.route("/register")
    .get(function(req,res){
        res.render("register");
    })
    .post(function(req,res){
        if(Users.findOne({email: req.body.username}, function(err, user){
            if(err)
                console.log(err);
            else{ 
                if(!user){
                    const newUser = new Users({
                        email: req.body.username,
                        password: req.body.password
                    });
                    newUser.save();
                    res.render("login");
                }
                else{
                    if(user.password === req.body.password)
                        res.render("secrets");
                    else
                        res.render("login");
                }
            }
        }));
    });

app.listen(3000, function(){
    console.log("server has started and is running on port 3000");
})