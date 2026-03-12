if(process.env.NODE_ENV !== "production"){
    require('dotenv').config();
}

const express=require("express")
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOveride=require("method-override");
const ejsMate=require("ejs-mate")
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");
const MongoStore = require('connect-mongo').default;


const reviews=require("./routes/review.js");

// const Review = require("./models/review.js");

const { connect } = require("http2");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingsRouter=require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter=require("./routes/user.js");


const db_url= process.env.ATLASDB_URL;





/*
____________________________________________________________________________________________
Cathch & throw err methods
_______________________________________________________________________________________________
*/

main()
 .then(()=>{
    console.log("Connected to dbs");
 })
 .catch((err)=>{
    console.log(err);
 })
async function main() {
    await mongoose.connect(db_url);
    
}
app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.json());  
app.use(express.urlencoded({extended:true}));
app.use(methodOveride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

/*
____________________________________________________________________________________________
Session Object
_______________________________________________________________________________
*/

const store=MongoStore.create({
    mongoUrl:db_url,
    crypto:{
        secret:process.env.SECRECT,
    },
    touchAfter:24*3600,
});

store.on("error", (err) => {
    console.log("SESSION STORE ERROR", err);
});

const sessionOptions={
    store,
    secret:process.env.SECRECT,
    resave:false,
    saveUninitialized:true,
    cookie:{//login expiry -> time or days for this this 7 days
        expires:Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7* 24 * 60 * 60 * 1000,
        httpOnly:true,
    },
};
/*
____________________________________________________________________________________________

_______________________________________________________________________________
*/








app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




app.use((req,res,next)=>{
 res.locals.success=req.flash("success");
 res.locals.error=req.flash("error");
 res.locals.currUser=req.user;
//  console.log(success);
 next();
});


// app.get("/demouser",async(req,res)=>{
//     let fakeUser=new User({
//         email:"student@gmail.com",
//         username:"delta-student"
//     });
//     let registredUser =await User.register(fakeUser,"helloworld");
//     res.send(registredUser);

// }) 


app.use("/listings",listingsRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


/*
____________________________________________________________________________________________
Error Routes
_____________________________________________________________________________________________*/

app.use((req,res,next)=>{
    next(new ExpressError(404,"Page Not Found!"));
});

app.use((err,req,res,next)=>{
    let{statusCode=500,message="Something went wrong"}=err;;
    //res.status(statusCode).send(message)
    res.status(statusCode).render("error.ejs",{err})
    //res.send("Something wennt Wrong!");
});

const port = process.env.PORT || 8080;

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
