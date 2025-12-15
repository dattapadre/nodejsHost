const express = require("express");
const bodyparser = require("body-parser");
const user_route = require('./Router/user');
const admin_route = require("./Router/admin");
const upload = require("express-fileupload");
const url = require("url");
const session = require("express-session");
require("dotenv").config();



const app = express();
app.use(express.static("public/"));
app.use(bodyparser.urlencoded({extended:true}));
app.use(upload());

app.use(session({
    resave:true,
    saveUninitialized:true,
    secret:"a2zithub"
}));

app.use("/",user_route);
app.use("/admin",admin_route)


app.listen(process.env.PORT  || 1000);