import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGODB_URL = process.env.MONGODB_URL;


export const DBConfiguration = async () => {       
    try {
        const conn = await mongoose.connect(MONGODB_URL);
        if (conn) {
            console.log(`Database connected successfully...😊😊 ${conn.connection.host}`);  
        }

        
    } catch (error) {
        console.log(`Error occurred while connecting to the database: ${error.message}`);
        process.exit(1);
    }
};
