
const Booking = require("../Models/bookingModel");

exports.bookSession = async (req, res) => {
    try {
        const { sessionId, date } = req.body;

        // Use the authenticated user, not a userId supplied by the client.
        const userId = req.user?._id || req.user?.id;

        if (!userId || !sessionId || !date) {
            return res.status(400).json({
                success: false,
                message: "Session ID and date are required"
            });
        }

        const booking = await Booking.create({
            userId,
            sessionId,
            date
        });

        return res.status(201).json({
            success: true,
            message: "Session booked successfully",
            booking
        });
    } catch (error) {
        console.error("Booking error:", error);
        return res.status(500).json({
            success: false,
            message: "Unable to book session"
        });
    }
};
