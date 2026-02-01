const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const{ reviewSchema}=require("../schema.js");
const Listing = require("../models/listing.js"); // path adjust if needed
const Review = require("../models/review.js");

/*
____________________________________________________________________________________________
vALIDATION
_______________________________________________________________________________________________
*/
const validateReview=(req,res,next)=>{
    let{error}=reviewSchema.validate(req.body);

    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);

    }else{
        next()
    }
}

/*
____________________________________________________________________________________________
//REVIEW ROUTES
_______________________________________________________________________________________________
*/

//post Rout
router.post("/",validateReview,wrapAsync(async(req,res)=>{
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
router.delete("/:reviewId",
    wrapAsync(async(req,res)=>{
        let {id,reviewId}=req.params;

        await Listing.findByIdAndUpdate(id,{$pull:{review:reviewId}})
        await Review.findByIdAndDelete(reviewId);

         res.redirect(`/listings/${id}`)
    })
)

module.exports = router;
