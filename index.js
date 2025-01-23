import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { DBConfiguration } from './src/DBconfig/BDConfiguration.js';
import userRouter  from './src/routes/userRoute.js';
import attendanceRouter from './src/routes/attendanceRoute.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Database Configuration
DBConfiguration();

// CORS Middleware
app.use(cors());
// Body Parser Middleware
app.use(express.json());

// router middleware
app.use("/api", userRouter);
app.use("/api", attendanceRouter);

app.get("/", (req, res) => {
    try {
        res.status(200).send(`Server is running successfully...😊😊! on port ${PORT}`);
        
    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}`})
    }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

export default app;