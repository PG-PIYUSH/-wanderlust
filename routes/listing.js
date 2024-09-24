const express= require("express");
const router= express.Router();
const wrapAsync= require("../utils/wrapAsync.js");
const Listing= require("../models/listing.js");
const {isLoggedIn}= require("../middleware.js");
const {isOwner,validateListing}= require("../middleware.js");
const listingController=require("../controllers/listing.js");
const multer  = require('multer');
const {storage}=require("../cloudConfig.js");
const upload = multer({ storage });//multer store the image at cloudinary storage



router.route("/")
//index route
.get( wrapAsync(listingController.index))//index path defined in controller listing.js
 //create Route
.post( isLoggedIn,upload.single("listing[image]"),validateListing,wrapAsync( listingController.createListing)
);


//New Route (we put new route above show route because otherwise it think /new as id and give error
router.get("/new", isLoggedIn, wrapAsync(listingController.renderNewForm)
);

router.route("/:id")
//show route
.get(wrapAsync(listingController.showListing))
//Update Route
.put(isLoggedIn,isOwner,upload.single("listing[image]"),validateListing,wrapAsync (listingController.updateListings))
//Delete Route
.delete( isLoggedIn,isOwner,wrapAsync( listingController.deleteListings));

//Edit Route
router.get("/:id/edit", isLoggedIn, wrapAsync(listingController.renderEditForm));

module.exports= router;