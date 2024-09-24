const Listing=require("../models/listing");
const Review=require("../models/reviews");

module.exports.createReview=async(req,res)=>{
    let listing=  await Listing.findById(req.params.id);
    let newReview= new Review(req.body.review);
    newReview.author= req.user._id;
    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();
    req.flash("success","New review Created!");

    res.redirect(`/listings/${listing._id}`);
  };

  module.exports.deleteReview=async (req,res)=>{
    let{id,reviewId}= req.params;
    await Listing.findByIdAndUpdate(id,{$pull:{review:reviewId}});//pull is used to find id matches with reviewid and delete from array
    await Review.findByIdAndDelete(reviewId);
    req.flash("success","Review deleated");
    res.redirect(`/listings/${id}`);
  };