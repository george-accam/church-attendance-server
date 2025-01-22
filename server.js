import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { DBConfiguration } from './src/DBconfig/BDConfiguration.js';
import userRouter  from './src/routes/userRoute.js';
dotenv.config();

const app = express();
const PORT = process.env.PORT; 
// Database Configuration
DBConfiguration();
// this will terminate the server if not listening on port 3002
if (!process.env.PORT) {
    console.error('Environment variable PORT is not set');
    process.exit(1);
}

// CORS Middleware
app.use(cors());
// Body Parser Middleware
app.use(express.json());

// router middleware
app.use("/api", userRouter);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: `Server is running successfully...😊😊! on port ${PORT}`
    });
});

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});