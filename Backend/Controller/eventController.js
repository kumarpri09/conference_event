
const Event = require("../Models/eventModel");


exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find();

        res.status(200).json({
            success: true,
            events
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


exports.createEvent = async (req, res) => {
    try {
        const { title, date, organizer, capacity } = req.body;

        const newEvent = await Event.create({
            title,
            date,
            organizer,
            capacity
        });

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            event: newEvent
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
