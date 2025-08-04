const BrandProfile = require("../../models/BrandProfile");

exports.findOrCreateBrandProfile = async ({ domain, brandName, userId }) => {
  let brand = await BrandProfile.findOne({ domain, ownerUserId: userId });
  if (!brand) {
    brand = await BrandProfile.create({ ownerUserId: userId, brandName: brandName || domain, domain });
    console.log("BrandProfile created:", brand);
  } else {
    console.log("BrandProfile found:", brand);
  }
  return brand;
};