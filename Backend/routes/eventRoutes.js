
const express = require("express");
const router = express.Router();

const eventController = require("../controller/eventController");


router.get("/", eventController.getAllEvents);


router.post("/", eventController.createEvent);

module.exports = router;
