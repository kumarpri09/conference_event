

const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); 


let events = [];

const app = express();
app.use(bodyParser.json());


function validateEvent(data) {
    if (!data.title || typeof data.title !== 'string') {
        return 'Event title is required and must be a string.';
    }
    if (!data.date || isNaN(Date.parse(data.date))) {
        return 'Valid event date is required.';
    }
    if (!data.organizer || typeof data.organizer !== 'string') {
        return 'Organizer name is required and must be a string.';
    }
    if (data.capacity !== undefined && (typeof data.capacity !== 'number' || data.capacity < 0)) {
        return 'Capacity must be a non-negative number.';
    }
    return null;
}


app.post('/api/events', (req, res) => {
    try {
        const error = validateEvent(req.body);
        if (error) return res.status(400).json({ error });

        const newEvent = {
            id: uuidv4(),
            title: req.body.title,
            date: req.body.date,
            organizer: req.body.organizer,
            capacity: req.body.capacity || 0,
            attendees: []
        };
        events.push(newEvent);
        res.status(201).json(newEvent);
    } catch (err) {
        res.status(500).json({ error: 'Server error while creating event.' });
    }
});


app.get('/api/events', (req, res) => {
    res.json(events);
});


app.get('/api/events/:id', (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found.' });
    res.json(event);
});


app.put('/api/events/:id', (req, res) => {
    try {
        const eventIndex = events.findIndex(e => e.id === req.params.id);
        if (eventIndex === -1) return res.status(404).json({ error: 'Event not found.' });

        const error = validateEvent(req.body);
        if (error) return res.status(400).json({ error });

        events[eventIndex] = { ...events[eventIndex], ...req.body };
        res.json(events[eventIndex]);
    } catch (err) {
        res.status(500).json({ error: 'Server error while updating event.' });
    }
});


app.delete('/api/events/:id', (req, res) => {
    const eventIndex = events.findIndex(e => e.id === req.params.id);
    if (eventIndex === -1) return res.status(404).json({ error: 'Event not found.' });

    events.splice(eventIndex, 1);
    res.json({ message: 'Event deleted successfully.' });
});


app.post('/api/events/:id/register', (req, res) => {
    const event = events.find(e => e.id === req.params.id);
    if (!event) return res.status(404).json({ error: 'Event not found.' });

    if (!req.body.name || typeof req.body.name !== 'string') {
        return res.status(400).json({ error: 'Attendee name is required.' });
    }

    if (event.capacity && event.attendees.length >= event.capacity) {
        return res.status(400).json({ error: 'Event is at full capacity.' });
    }

    event.attendees.push(req.body.name);
    res.json({ message: 'Attendee registered successfully.', event });
});