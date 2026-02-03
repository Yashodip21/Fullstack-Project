const express=require("express")
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOveride=require("method-override");
const ejsMate=require("ejs-mate")
const ExpressError=require("./utils/ExpressError.js");
const session=require("express-session");

const reviews=require("./routes/review.js");
const MONGO_URL= "mongodb://127.0.0.1:27017/wanderlust";
// const Review = require("./models/review.js");

const { connect } = require("http2");
const flash=require("connect-flash");
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");

const listingsRouter=require("./routes/listing.js");
const reviewRouter = require("./models/review.js");
const userRouter=require("./routes/user.js");



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
async function main(params) {
    await mongoose.connect(MONGO_URL);
    
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

const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{//login expiry -> time or days for this this 7 days
        expires:Date.now() + 7 * 24 * 70 * 60 * 1000,
        maxAge: 7* 24 * 60 * 60 * 1000,
        httpOnly:true,
    },
};
/*
____________________________________________________________________________________________

_______________________________________________________________________________
*/


app.get("/",(req,res)=>{
    res.send("Hi,I am root");
});



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

app.listen(8080,()=>{
    console.log("Server is listing on port 8080");
});