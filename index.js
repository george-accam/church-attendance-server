import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import { DBConfiguration } from './src/DBconfig/BDConfiguration.js';
import userRouter  from './src/routes/userRoute.js';
import attendanceRouter from './src/routes/attendanceRoute.js';
import titheAndWelfareRouter from './src/routes/titheAndWelfareRoute.js';
import aiAnalystRouter from './src/routes/aiAnalystRouter.js';

dotenv.config();
// Database Configuration
DBConfiguration();

// Create an HTTP server
const PORT = process.env.PORT || 3000;
const app = express();
const server = http.createServer(app);

// Create a Socket.IO server
import { initSocket } from './src/socketServer/Socket.js';
initSocket(server);



// CORS Middleware
app.use(cors());

// Body Parser Middleware
app.use(express.json());

// router middleware
app.use("/api", userRouter);
app.use("/api", attendanceRouter);
app.use("/api", titheAndWelfareRouter);
app.use("/api", aiAnalystRouter);

app.get("/", (req, res) => {
    try {
        res.status(200).json({ message: `Server is running successfully...😊😊! on port ${PORT}` });
        
    } catch (error) {
        res.status(500).json({ message: `Internal server error: ${error.message}`})
    }
});


server.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

export default app;