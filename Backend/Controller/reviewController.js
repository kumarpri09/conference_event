


const { validationResult } = require('express-validator');


let reviews = [];
let nextId = 1;



exports.getAllReviews = (req, res) => {
    res.status(200).json({ success: true, data: reviews });
};



exports.getReviewById = (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    const review = reviews.find(r => r.id === id);
    if (!review) {
        return res.status(404).json({ success: false, message: "Review not found" });
    }

    res.status(200).json({ success: true, data: review });
};



exports.createReview = (req, res) => {
 
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { user, rating, comment } = req.body;

    const newReview = {
        id: nextId++,
        user,
        rating,
        comment,
        createdAt: new Date()
    };

    reviews.push(newReview);
    res.status(201).json({ success: true, data: newReview });
};



exports.updateReview = (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    const reviewIndex = reviews.findIndex(r => r.id === id);
    if (reviewIndex === -1) {
        return res.status(404).json({ success: false, message: "Review not found" });
    }

    const { user, rating, comment } = req.body;
    reviews[reviewIndex] = {
        ...reviews[reviewIndex],
        user: user ?? reviews[reviewIndex].user,
        rating: rating ?? reviews[reviewIndex].rating,
        comment: comment ?? reviews[reviewIndex].comment,
        updatedAt: new Date()
    };

    res.status(200).json({ success: true, data: reviews[reviewIndex] });
};



exports.deleteReview = (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    const reviewIndex = reviews.findIndex(r => r.id === id);
    if (reviewIndex === -1) {
        return res.status(404).json({ success: false, message: "Review not found" });
    }

    reviews.splice(reviewIndex, 1);
    res.status(200).json({ success: true, message: "Review deleted successfully" });
};
