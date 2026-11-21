


const express = require("express");
const router = express.Router();

const { bookSession } = require("../controller/bookingController");
const authmiddleware = require("../middleware/authmiddleware");

router.post("/", authmiddleware, bookSession);

module.exports = router;
