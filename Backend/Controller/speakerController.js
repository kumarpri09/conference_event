

const express = require( 'express');
const  { Pool } = require('pg');
const dotenv = require( 'dotenv');
const Joi = require ('joi');

dotenv.config();

const router = express.Router();


const pool = new Pool({
  connectionString: process.env.DATABASE_URL, 
  ssl: { rejectUnauthorized: false } 
});



const speakerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  bio: Joi.string().max(500).allow(''),
  topic: Joi.string().min(2).max(200).required(),
  email: Joi.string().email().required()
});



router.post('/', async (req, res) => {
  try {
    const { error, value } = speakerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, bio, topic, email } = value;
    const result = await pool.query(
      `INSERT INTO speakers (name, bio, topic, email) 
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, bio, topic, email]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating speaker:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM speakers ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching speakers:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.get('/:id', async (req, res) => {
  try {
    const speakerId = parseInt(req.params.id, 10);
    if (isNaN(speakerId)) return res.status(400).json({ error: 'Invalid ID' });

    const result = await pool.query('SELECT * FROM speakers WHERE id = $1', [speakerId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Speaker not found' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching speaker:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.put('/:id', async (req, res) => {
  try {
    const speakerId = parseInt(req.params.id, 10);
    if (isNaN(speakerId)) return res.status(400).json({ error: 'Invalid ID' });

    const { error, value } = speakerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, bio, topic, email } = value;
    const result = await pool.query(
      `UPDATE speakers SET name=$1, bio=$2, topic=$3, email=$4 
       WHERE id=$5 RETURNING *`,
      [name, bio, topic, email, speakerId]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Speaker not found' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating speaker:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});



router.delete('/:id', async (req, res) => {
  try {
    const speakerId = parseInt(req.params.id, 10);
    if (isNaN(speakerId)) return res.status(400).json({ error: 'Invalid ID' });

    const result = await pool.query('DELETE FROM speakers WHERE id=$1 RETURNING *', [speakerId]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Speaker not found' });

    res.json({ message: 'Speaker deleted successfully' });
  } catch (err) {
    console.error('Error deleting speaker:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});


module.exports = router;
