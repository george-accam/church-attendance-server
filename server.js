import express from 'express';
import dotenv from 'dotenv';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.PORT) {
    console.error('Environment variable PORT is not set');
    process.exit(1);
}

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: `Server is running successfully...😊😊! on port ${PORT}`
    });
});

app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});