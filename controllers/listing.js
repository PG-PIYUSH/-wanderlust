const Listing=require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken=process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index=async (req,res)=>{
    const allListings= await  Listing.find({});
    res.render("listings/index.ejs",{allListings});  
 };

 module.exports.renderNewForm= async (req,res)=>{
    res.render("listings/new.ejs");
};

module.exports.showListing=async (req,res)=>{
    let {id}= req.params;
     const listing= await  Listing.findById(id)
     .populate(
        {path:"reviews",
            populate:{
                path:"author",
            },
        })
     .populate("owner");
     if(!listing){
        req.flash("error","Lisitng you requested for does not exist");
        res.redirect("/listings");
     };
    res.render("listings/show.ejs",{listing}); 
 };

 module.exports.createListing=async (req,res,next)=>{
    let response= await geocodingClient.forwardGeocode({
        query: req.body.listing.location,
        limit: 2
      })
        .send()
    
   let url= req.file.path;
   let filename=req.file.filename;
    // let{title,description,image,price,country,location}=req.body;
  const newListing= new Listing(req.body.listing);
//validation for schema(means error for request send by hopschotch or postman)
newListing.owner= req.user._id;
newListing.image={url,filename};
newListing.geometry=response.body.features[0].geometry;//store coordinates in database
let  savedListing=await newListing.save();
console.log(savedListing);
req.flash("success","New Listing Created");
res.redirect("/listings");
};

module.exports.renderEditForm=async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error","Lisitng you requested for does not exist");
        res.redirect("/listings");
     };
     let originalImageUrl=listing.image.url;
     originalImageUrl= originalImageUrl.replace("/upload","/upload/h_300,w_250");//cloudary feature for image formatting
    res.render("listings/edit.ejs", { listing, originalImageUrl});
    };

module.exports.updateListings=async (req, res) => {
    if(!req.body.listing){
        throw new ExpressError(404,"send valid data for listing");
    }
    let { id } = req.params;
    let listing=await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    if(typeof req.file !=="undefined"){
    let url= req.file.path;
   let filename=req.file.filename;
   listing.image={url,filename};
   await listing.save();
    }
    
    req.flash("success"," Listing Updated");
    res.redirect(`/listings/${id}`);
    };

module.exports.deleteListings=async (req, res) => {
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    req.flash("success","New Listing Deleated");
    res.redirect("/listings");
    };