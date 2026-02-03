const express= require("express");
const router=express.Router();
const Listing = require("../models/listing.js"); // path adjust if needed

const wrapAsync=require("../utils/wrapAsync.js");
const{listingSchema}=require("../schema.js")
const ExpressError=require("../utils/ExpressError.js");
/*
____________________________________________________________________________________________
//VALIDATIONS
_______________________________________________________________________________________________
*/
const validateListing=(req,res,next)=>{
    let{error}=listingSchema.validate(req.body);

    if(error){
        let errMsg=error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400,errMsg);

    }else{
        next()
    }
}


/*
____________________________________________________________________________________________
LISTINGS ROUTES
_______________________________________________________________________________________________
*/
router.get("/",
    wrapAsync(async(req,res,next)=>{
   const allListings=await Listing.find({});
   res.render("listings/index.ejs",{allListings});
     
}));
//new route

router.get("/new",(req,res,next)=>{
    res.render("listings/new.ejs")
});

//show rout
router.get("/:id",
    wrapAsync(async(req,res,next)=>{
   let{id}=req.params;
   const listing=await Listing.findById(id).populate("reviews");
   if(!listing){
      req.flash("error","listing you requested does not existed");
       return res.redirect("/listings");
   }
   res.render("listings/show.ejs",{listing});
}));
//create route
router.post("/",validateListing,
    wrapAsync(async(req,res,next)=>{
    const newListing=new Listing(req.body.listing);
    req.flash("success","New Listing Added Succesfully");
    await newListing.save();
    res.redirect("/listings");
    
 
}));
//EDIT ROUTE
router.get("/:id/edit",
    wrapAsync(async(req,res,next)=>{
   let{id}=req.params;
   const listing=await Listing.findById(id);
     if(!listing){
      req.flash("error","listing you requested does not existed");
       return res.redirect("/listings");
   }
   res.render("listings/edit.ejs",{ listing });
}));
//update Route
router.put("/:id",
    validateListing,
    wrapAsync(async(req,res,next)=>{
    
    let {id}=req.params;
    await Listing.findByIdAndUpdate(id,{...req.body.listing});
    req.flash("success","Listing Updated Succesfully")

    res.redirect(`/listings/${id}`);
}));

//delete
router.delete("/:id",
    wrapAsync(async(req,res,next)=>{
     let{id}=req.params;
     let deletedListing=await  Listing.findByIdAndDelete(id);
     console.log(deletedListing);
     req.flash("success"," Listing deleted Succesfully")

     res.redirect("/listings");
}));
module.exports = router;
