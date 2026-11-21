const express = require("express");
const router = express.Router();

router.get("/org-data", (req, res) => {
    res.json({
        success: true,
        organization: {
            organizationId: req.organizationId,
            name: req.organization?.name,
            description: req.organization?.description,
            email: req.organization?.email
        }
    });
});

module.exports = router;