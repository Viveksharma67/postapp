const express = require("express")
const app = express();
const path = require("path")
const usermodel = require("./model/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")
const cookieParser = require("cookie-parser");
const user = require("./model/user");
const postmodel = require("./model/post")

app.use(cookieParser());

app.set("view engine","ejs");
app.use(express.json());
app.use(express.urlencoded( {extended:true}))
app.use(express.static(path.join(__dirname,"public")));

app.get("/",(req,res)=>{
    res.render("signup")
})
app.get("/login",(req,res)=>{
    res.render("login")
})
app.get("/dash",isloggedin, async(req,res)=>{
  let user = await usermodel.findOne({email:req.user.email}).populate("posts");
    res.render("dashboard",{user})
})

app.post("/post",isloggedin, async(req,res)=>{
  let user = await usermodel.findOne({email:req.user.email}) 
  let {content} = req.body;
  let post = await postmodel.create({
    user:user._id,
    content:content
  });
  user.posts.push(post._id)
  await user.save();
  res.redirect("/dash")
})
app.post("/create", async (req, res) => {
    let { name, email, password} = req.body;

    let user = await usermodel.findOne({email});
    if(user) return res.send("user already register...")
    else 
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        let user = await usermodel.create({
          name,
          email,
          password: hash,
        });
        
        let token = jwt.sign({email},"shh")
        res.cookie("token",token)
        res.redirect("/login");
      });
    });
  });

app.post("/login",async (req,res)=>{
    let { email, password} = req.body;
    let user = await usermodel.findOne({email})
    if(!user) return res.send("registration to kar pahle bhai")

    bcrypt.compare(password,user.password ,(err , result)=>{
        if(result) {
          let token = jwt.sign({email},"shh")
          res.cookie("token",token)
          res.redirect("/dash")}
        else res.redirect("/login")
    })
})

app.get("/delete/:id",async(req,res)=>{
  let deleteduser = await postmodel.findOneAndDelete({_id : req.params.id})
  res.redirect("/dash");
});

app.get("/logout",(req,res)=>{
  res.cookie("token","");
  res.redirect("/login")
})
function isloggedin(req,res,next){
    if(req.cookies.token === "") res.send("you need to logged in..")
      else{
        let data = jwt.verify(req.cookies.token,"shh");
        req.user = data;
      }
      next();
}

app.listen("3000",()=>{
    console.log("server started....")
})