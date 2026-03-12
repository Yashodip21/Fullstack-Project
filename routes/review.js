const express=require("express");
const router=express.Router({mergeParams:true});
const wrapAsync=require("../utils/wrapAsync.js");
const ExpressError=require("../utils/ExpressError.js");
const{ reviewSchema}=require("../schema.js");
const Listing = require("../models/listing.js"); // path adjust if needed
const { validateReview, isLoggedIn } = require("../middleware.js");
const Review = require("../models/review.js");

const reviewController=require("../controllers/reviews.js"); 


/*
____________________________________________________________________________________________
vALIDATION
_______________________________________________________________________________________________
*/


/*
____________________________________________________________________________________________
//REVIEW ROUTES
_______________________________________________________________________________________________
*/

//post Rout
router.post("/",isLoggedIn, validateReview,
     wrapAsync(reviewController.createReview));


//delete review route
router.delete("/:reviewId",isLoggedIn, 
    wrapAsync(reviewController.deleteReview));


module.exports = router;
