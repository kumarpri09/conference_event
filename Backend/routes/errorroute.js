

const express = require("express");
const router = express.Router();

router.get("/data", (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            message: "Backend API working successfully",
            data: {
                project: "Conference Event Management",
                server: "Express",
                status: "Running"
            }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;