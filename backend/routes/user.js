const express = require("express");
const router = express.Router();

const { login, register, dashboard, getAllUsers, analyzeLink, suggestImprovements, getAnalysisHistory, deleteAnalysis } = require("../controllers/user");
const authMiddleware = require('../middleware/auth')

router.route("/login").post(login);
router.route("/register").post(register);
router.route("/dashboard").get(authMiddleware, dashboard);
router.route("/users").get(getAllUsers);
router.route("/analyze").post(authMiddleware, analyzeLink);
router.route("/suggest").post(authMiddleware, suggestImprovements);
router.route("/history").get(authMiddleware, getAnalysisHistory);
router.route("/history/:id").delete(authMiddleware, deleteAnalysis);


module.exports = router;