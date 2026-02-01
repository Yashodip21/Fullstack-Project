const express=require("express")
const app=express();
const mongoose=require("mongoose");
const path=require("path");
const methodOveride=require("method-override");
const ejsMate=require("ejs-mate")
const ExpressError=require("./utils/ExpressError.js");

const listings=require("./routes/listing.js");
const reviews=require("./routes/review.js");

const MONGO_URL= "mongodb://127.0.0.1:27017/wanderlust";
const Review = require("./models/review.js");
const review = require("./models/review.js");



/*
____________________________________________________________________________________________

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


app.get("/",(req,res)=>{
    res.send("Hi,I am root");
});




/*
____________________________________________________________________________________________
Express Router
_______________________________________________________________________________________________
*/


app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews)


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