

const paymentModel = require('../Models/paymentModel.js');
const eventModel = require('../Models/eventModel.js');     
const Stripe = require('stripe');


if (!process.env.STRIPE_SECRET_KEY) {
    console.error("Stripe secret key is missing.")
    throw new Error("STRIPE_SECRET_KEY is not loaded.")
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);



exports.createPaymentIntent = async (req, res) => {
    try {
        const { eventId, userId } = req.body;

        
        if (!eventId || !userId) {
            return res.status(400).json({ error: 'Event ID and User ID are required.' });
        }

        
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: 'Event not found.' });
        }

       
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(event.price * 100), 
            currency: 'usd',
            metadata: { eventId, userId }
        });

       
        const paymentRecord = new Payment({
            userId,
            eventId,
            amount: event.price,
            currency: 'USD',
            status: 'pending',
            paymentIntentId: paymentIntent.id
        });
        await paymentRecord.save();

        res.status(201).json({
            clientSecret: paymentIntent.client_secret,
            paymentId: paymentRecord._id
        });
    } catch (error) {
        console.error('Error creating payment intent:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};




exports.updatePaymentStatus = async (req, res) => {
    try {
        const { paymentId, status } = req.body;

        if (!paymentId || !status) {
            return res.status(400).json({ error: 'Payment ID and status are required.' });
        }

        const payment = await Payment.findById(paymentId);
        if (!payment) {
            return res.status(404).json({ error: 'Payment not found.' });
        }

        payment.status = status;
        await payment.save();

        res.status(200).json({ message: 'Payment status updated successfully.' });
    } catch (error) {
        console.error('Error updating payment status:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};



exports.getUserPayments = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required.' });
        }

        const payments = await Payment.find({ userId }).populate('eventId', 'title date price');
        res.status(200).json(payments);
    } catch (error) {
        console.error('Error fetching user payments:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
