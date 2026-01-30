const express=require("express")
const app=express();
const mongoose=require("mongoose");
const Listing = require("./models/listing.js"); // path adjust if needed
const path=require("path");
const methodOveride=require("method-override");
const ejsMate=require("ejs-mate")
const wrapAsync=require("./utils/wrapAsync.js");
const ExpressError=require("./utils/ExpressError.js");
const{listingSchema, reviewSchema}=require("./schema.js")
const MONGO_URL= "mongodb://127.0.0.1:27017/wanderlust";
const Review = require("./models/review.js");


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

const validateListing=(req,res,next)=>{
    let{error}=listingSchema.validate(req.body);

    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);

    }else{
        next()
    }
}

app.get("/",(req,res)=>{
    res.send("Hi,I am root");
});

const validateReview=(req,res,next)=>{
    let{error}=reviewSchema.validate(req.body);

    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);

    }else{
        next()
    }
}



//index route
app.get("/listings",
    wrapAsync(async(req,res,next)=>{
   const allListings=await Listing.find({});
   res.render("listings/index.ejs",{allListings});
     
}));
//new route

app.get("/listings/new",(req,res,next)=>{
    res.render("listings/new.ejs")
});

//show rout
app.get("/listings/:id",
    wrapAsync(async(req,res,next)=>{
   let{id}=req.params;
   const listing=await Listing.findById(id).populate("reviews");
   res.render("listings/show.ejs",{listing});
}));
//create route
app.post("/listings",validateListing,
    wrapAsync(async(req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
    
 
}));
//EDIT ROUTE
app.get("/listings/:id/edit",
    wrapAsync(async(req,res,next)=>{
   let{id}=req.params;
   const listing=await Listing.findById(id);
   res.render("listings/edit.ejs",{ listing });
}));
//update Route
app.put("/listings/:id",
    validateListing,
    wrapAsync(async(req,res,next)=>{
    
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//delte
app.delete("/listings/:id",
    wrapAsync(async(req,res,next)=>{
     let{id}=req.params;
     let deletedListing=await  Listing.findByIdAndDelete(id);
     console.log(deletedListing);
     res.redirect("/listings");
}));


//Review
//post Rout
app.post("/listings/:id/reviews",validateReview,wrapAsync(async(req,res)=>{
    //  console.log(req.body); 
    let listing=await Listing.findById(req.params.id);
    let newReview=new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved");
    // res.send("new review saved");
    res.redirect(`/listings/${listing._id}`);
}));

//delete review route
app.delete("/listings/:id/reviews/:reviewId",
    wrapAsync(async(req,res)=>{
        let {id,reviewId}=req.params;

        await Listing.findByIdAndUpdate(id,{$pull:{review:reviewId}})
        await Review.findByIdAndDelete(reviewId);

         res.redirect(`/listings/${id}`)
    })
)





// app.get("/testListing",async(req,res)=>{
//     let sampleListing=new Listing({
//         title:"My New Villa",
//         description:"By the beach",
//         price:1200,
//         location:"Nashik,Punr",
//         country:"India",
//     });
//      await sampleListing.save();
//      console.log("Sample was saved");
//      res.send("Succesfull testing");
// });


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