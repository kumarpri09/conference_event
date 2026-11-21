
import bcrypt from 'bcrypt';
import { neon } from '@neondatabase/serverless';
import jwt from 'jsonwebtoken';


const sql = neon(process.env.DATABASE_URL);


const JWT_SECRET = process.env.JWT_SECRET || 'change_this_secret';


function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}


export async function registerUser(req, res) {
    try {
        const { name, email, password } = req.body;

      
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email, and password are required.' });
        }
        if (!isValidEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format.' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
        }

        // Check if user already exists
        const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
        if (existingUser.length > 0) {
            return res.status(409).json({ error: 'Email already registered.' });
        }

      
        const hashedPassword = await bcrypt.hash(password, 10);

       
        const newUser = await sql`
            INSERT INTO users (name, email, password_hash)
            VALUES (${name}, ${email}, ${hashedPassword})
            RETURNING id, name, email
        `;

        res.status(201).json({ message: 'User registered successfully', user: newUser[0] });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export async function loginUser(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await sql`SELECT id, name, email, password_hash FROM users WHERE email = ${email}`;
        if (user.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        const validPassword = await bcrypt.compare(password, user[0].password_hash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials.' });
        }

        
        const token = jwt.sign(
            { id: user[0].id, email: user[0].email },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ message: 'Login successful', token });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


export async function getCurrentUser(req, res) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await sql`SELECT id, name, email FROM users WHERE id = ${decoded.id}`;
        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found.' });
        }

        res.json({ user: user[0] });
    } catch (err) {
        console.error('Get current user error:', err);
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
}
