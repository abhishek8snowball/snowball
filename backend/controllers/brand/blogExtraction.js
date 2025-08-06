const { findOrCreateBrandProfile } = require("./brandProfile");
const { extractAndSaveBlogs } = require("./blogAnalysis");

exports.extractBlogs = async (req, res) => {
  console.log("=== 📝 Starting Blog Extraction ===");
  const { domain, brandName } = req.body;
  const userId = req.user.id;

  if (!domain) return res.status(400).json({ msg: "Domain is required" });

  try {
    // 1. Get or create brand profile
    console.log("📝 Step 1: Getting brand profile...");
    const brand = await findOrCreateBrandProfile({ domain, brandName, userId });
    console.log("✅ Brand profile found:", brand.brandName);

    // 2. Extract and analyze blogs
    console.log("📝 Step 2: Extracting and analyzing blogs...");
    const blogAnalysis = await extractAndSaveBlogs(brand);
    console.log("✅ Blog extraction completed:", blogAnalysis.blogs.length, "blogs");

    console.log("=== 🎉 Blog Extraction Complete ===");
    console.log("📊 Results Summary:");
    console.log("   - Brand:", brand.brandName);
    console.log("   - Blogs Extracted:", blogAnalysis.blogs.length);
    console.log("   - Total GEO Score:", blogAnalysis.blogs.reduce((sum, blog) => sum + (blog.geoScore || 0), 0));

    res.json({
      brand: brand.brandName,
      domain: brand.domain,
      brandId: brand._id,
      blogAnalysis,
      status: "Blog extraction complete."
    });
  } catch (err) {
    console.error("=== 💥 Blog Extraction Error ===");
    console.error("❌ Error details:", err);
    console.error("📚 Stack trace:", err.stack);
    res.status(500).json({ 
      msg: "Blog extraction failed", 
      error: err.message, 
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
    });
  }
}; 