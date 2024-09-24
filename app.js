if(process.env.NODE_ENV !="production"){
  require("dotenv").config();
}

const express= require("express");
const app = express();
const mongoose= require("mongoose");
const path= require("path");
const methodOverride = require("method-override");
const ejsMate=require("ejs-mate");
const ExpressError= require("./utils/ExpressError.js");
const listingRouter= require("./routes/listing.js");
const reviewRouter= require("./routes/review.js");
const userRouter= require("./routes/user.js");

const session= require("express-session");
const MongoStore = require('connect-mongo');//for mongo session store (always write below and iclude express session)
const flash=require("connect-flash");
const passport= require("passport");
const LocalStrategy= require("passport-local");
const User= require("./models/user.js");

const dbUrls=process.env.ATLASDB_URL;
// const Mongo_URL=mongodb://127.0.0.1:27017/wanderlust;

const store=MongoStore.create({
  mongoUrl:dbUrls,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600//24hours and it prevent us to auto logout when refresh and make logout after 24 hours of inactivity
});

store.on("error",()=>{
  console.log("ERROR in MONGO SESSION STORE",err)
});

const sessionOptions={
  store,
  secret:process.env.SECRET,
      resave:false,
      saveUninitialized:true,
      cookie:{
        expire: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge:7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
      },

};


app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

app.listen(8080,()=>{
    console.log("server is listening to port 8080");
});

// app.get("/",(req,res)=>{
//     res.send("this path belong to root");
// });


async function main(){
    await mongoose.connect(dbUrls);
    
}

main().then(()=>{
    console.log("connected to DB");
})
.catch((err)=>{
    console.log(err)
});



app.use(session(sessionOptions));
app.use(flash());

//initializing passport
app.use(passport.initialize());
app.use(passport.session());

// use static authenticate method of model in LocalStrategy
passport.use(new LocalStrategy(User.authenticate()));
// use static serialize and deserialize of model for passport session support
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.success= req.flash("success");
  res.locals.error= req.flash("error");
  res.locals.currUser=req.user;
  next();

});

// app.get("/demouser",async (req,res)=>{
//   let fakeUser= new User({
//     email:"student@gmail.com",
//     username:"badass-student",

//   });
//   let registeredUser=await User.register(fakeUser,"helloworld");
//   res.send(registeredUser);
// })

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter)
  

  app.all("*",(req,res,next)=>{// error for if user searches for page which is not available
    next(new ExpressError(404,"page not found!"));
  });

  app.use((err,req,res,next)=>{
    let{statusCode=500,message="something went wrong!"}= err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
  });


  
