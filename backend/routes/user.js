const express = require("express");
const router = express.Router();
const authenticationMiddleware = require("../middleware/auth");

// Import authentication controllers
const { login, register, dashboard, getAllUsers, googleAuth } = require("../controllers/user");

// Import brand settings controllers
const { getBrandSettings, saveBrandSettings, refreshBrandVoice } = require("../controllers/user/brandSettings");

// Authentication routes
router.post("/login", login);
router.post("/register", register);
router.post("/auth/google", googleAuth);
router.get("/dashboard", authenticationMiddleware, dashboard);
router.get("/users", authenticationMiddleware, getAllUsers);

// Brand settings routes
router.get("/brand-settings", authenticationMiddleware, getBrandSettings);
router.post("/brand-settings", authenticationMiddleware, saveBrandSettings);
router.post("/brand-settings/refresh", authenticationMiddleware, refreshBrandVoice);

module.exports = router;