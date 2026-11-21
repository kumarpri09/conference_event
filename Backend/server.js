const eventRoutes = require("./routes/eventRoutes.js");
const  authService = require("./services/authservice.js");
const dotenv = require("dotenv");
const path = require("path");
const multer = require('multer');
const { fileURLToPath } = require('url');
const uploadRoutes = require("./routes/uploadfilrroute");
const bookingroute = require("./routes/bookingroute");
const bookingService = require('./services/bookingservice.js');
const fs = require('fs');



dotenv.config({
    path: path.resolve(__dirname, ".env")
});


const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const jsonServer = require("json-server");
const admin = require("firebase-admin");


const authmiddleware = require("./middleware/authmiddleware.js");


const paymentRoutes = require("./routes/paymentRoutes.js");
const authController = require("./controller/authController.js");


const speakerRouter = require("./routes/speakerRouter.js");
const reviewRoute = require("./routes/reviewRoute.js");
const organizationRoute = require("./routes/organizationRoute");
const errorroute = require("./routes/errorroute");
const categoryRoutes = require("./routes/category.js");


const app = express();
const PORT = process.env.PORT || 5000;


app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: [
        "Content-Type",
        "Authorization",
        "x-organization-id"
    ]
}));


app.use("/api/events", authmiddleware, eventRoutes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", authmiddleware, uploadRoutes);
app.use('/auth', authService);
app.use("/api/bookings", bookingroute);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => 
    cb(null, Date.now() + path.extname(file.originalname))
});


const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});


app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({
    filePath: `/uploads/${req.file.filename}`,
    name: req.file.originalname
  });
});


app.use('/uploads', express.static('uploads'));


app.post('/api/bookings', (req, res) => {
    try {
        const booking = bookingService.createBooking(req.body);
        res.status(201).json(booking);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


app.get('/api/bookings', (req, res) => {
    res.json(bookingService.getAllBookings());
});


app.get('/api/bookings/:id', (req, res) => {
    try {
        const booking = bookingService.getBookingById(req.params.id);
        res.json(booking);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});


app.put('/api/bookings/:id/cancel', (req, res) => {
    try {
        const booking = bookingService.cancelBooking(req.params.id);
        res.json(booking);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});





function validateMiddleware(req, res, next) {
    try {
      
        if (!req.body.name || typeof req.body.name !== 'string') {
            return res.status(400).json({
                error: 'Invalid request: "name" is required and must be a string.'
            });
        }

      
        if (typeof req.body.age !== 'number' || req.body.age <= 0) {
            return res.status(400).json({
                error: 'Invalid request: "age" must be a positive number.'
            });
        }

    
        next();
    } catch (err) {
        console.error('Validation error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
}


app.post('/api/user', validateMiddleware, (req, res) => {
    res.json({
        message: 'User data is valid!',
        data: req.body
    });
});





let firebaseReady = false;

if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    try {
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault()
            });
        }

        firebaseReady = true;
        console.log("Firebase Admin initialized successfully");

    } catch (error) {
        console.error("Firebase initialization failed:", error.message);
    }
} else {
    console.log("Firebase Admin credentials not configured");
}


app.post("/api/register", authController.register);
app.post("/api/login", authController.login);
app.post("/api/logout", authController.logout);



app.use("/api", organizationRoute);


app.use("/api/events", authmiddleware, eventRoutes);
app.use("/api/speakers", authmiddleware, speakerRouter);
app.use("/api/reviews", authmiddleware, reviewRoute);


app.use("/api/categories", categoryRoutes);
app.use("/api/payments", paymentRoutes);


app.use("/api", errorroute);


const mockRouter = jsonServer.router(
    path.join(__dirname, "data.json")
);

app.use("/mock-api", mockRouter);


const adminUsers = ["admin1", "admin2"];

function adminMiddleware(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "No token provided"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        if (!adminUsers.includes(decoded.username)) {
            return res.status(403).json({
                success: false,
                message: "Access denied: not an admin"
            });
        }

        req.isAdmin = true;
        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Invalid token"
        });
    }
}


const adminRouter = express.Router();

adminRouter.get("/dashboard", adminMiddleware, (req, res) => {
    res.json({
        success: true,
        message: "Admin dashboard data"
    });
});

app.use("/admin", adminRouter);


app.post("/register-token", async (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: "FCM token required"
        });
    }

    res.json({
        success: true,
        message: "FCM token received successfully"
    });
});

app.post("/send-notification", async (req, res) => {
    const { token, title, body, data } = req.body;

    if (!token || !title || !body) {
        return res.status(400).json({
            success: false,
            message: "token, title and body are required"
        });
    }

    if (!firebaseReady) {
        return res.status(503).json({
            success: false,
            message: "Firebase Admin is not configured"
        });
    }

    try {
        const message = {
            token,
            notification: {
                title,
                body
            },
            data: data || {}
        };

        const response = await admin.messaging().send(message);

        res.json({
            success: true,
            message: "Notification sent successfully",
            response
        });

    } catch (error) {
        console.error("Notification error:", error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


app.get("/users", async (req, res) => {
    try {
        const users = await mongoose.connection
            .db.collection("users")
            .find()
            .toArray();

        res.json(users);

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});



app.use((err, req, res, next) => {
    console.error("Application error:", err.stack || err);

    res.status(err.status || 500).json({
        success: false,
        message: err.message || "Internal Server Error"
    });
});


async function startServer() {
    try {
        if (!process.env.MONGO_URL) {
            throw new Error("MONGO_URL is missing in .env");
        }

        await mongoose.connect(process.env.MONGO_URL);

        console.log("MongoDB connected successfully");

        app.listen(PORT, () => {
            console.log(`Backend running at http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error("Backend startup failed:", error.stack || error);
        process.exit(1);
    }
}


mongoose.connect('mongodb://localhost:27')


startServer();
