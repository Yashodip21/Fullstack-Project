const express= require("express");
const router=express.Router();
const Listing = require("../models/listing.js"); // path adjust if needed

const wrapAsync=require("../utils/wrapAsync.js");

const {isLoggedIn,isOwner,validateListing}=require("../middleware.js")
const listiingController=require("../controllers/listings.js");
const multer  = require('multer');
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage })
/*
____________________________________________________________________________________________
//VALIDATIONS
_______________________________________________________________________________________________
____________________________________________________________________________________________
LISTINGS ROUTES
_______________________________________________________________________________________________
*/
router.route("/")
.get(wrapAsync(listiingController.index))
.post(
    isLoggedIn,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listiingController.createListing)
);

// SEARCH ROUTE 
router.get("/search", async (req, res) => {

    let { q } = req.query;

    const listings = await Listing.find({
        $or: [
            { title: { $regex: q, $options: "i" } },
            { location: { $regex: q, $options: "i" } },
            { country: { $regex: q, $options: "i" } }
        ]
    });

    res.render("listings/index.ejs", { allListings: listings });

});
// NEW ROUTE
router.get("/new", isLoggedIn, listiingController.renderNewForm);


// ID ROUTES 
router.route("/:id")
.get(wrapAsync(listiingController.showListing))
.put(
    isLoggedIn,
    isOwner,
    upload.single('listing[image]'),
    validateListing,
    wrapAsync(listiingController.updateListing)
)
.delete(
    isLoggedIn,
    isOwner,
    wrapAsync(listiingController.deleteListing)
);

// EDIT ROUTE
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listiingController.renderEditForm)
);

module.exports = router;





