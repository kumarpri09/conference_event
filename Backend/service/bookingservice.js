

const { v4: uuidv4 } = require('uuid');


let bookings = [];

/**
 * Create a new booking
 * @param {Object} bookingData - { userId, sessionId, date }
 */
function createBooking(bookingData) {
    if (!bookingData.userId || !bookingData.sessionId || !bookingData.date) {
        throw new Error("Missing required booking fields: userId, sessionId, date");
    }

    const newBooking = {
        id: uuidv4(),
        userId: bookingData.userId,
        sessionId: bookingData.sessionId,
        date: bookingData.date,
        status: "confirmed",
        createdAt: new Date()
    };

    bookings.push(newBooking);
    return newBooking;
}


function getAllBookings() {
    return bookings;
}


function getBookingById(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) throw new Error("Booking not found");
    return booking;
}


function cancelBooking(id) {
    const booking = bookings.find(b => b.id === id);
    if (!booking) throw new Error("Booking not found");
    booking.status = "cancelled";
    return booking;
}

module.exports = {
    createBooking,
    getAllBookings,
    getBookingById,
    cancelBooking
};