import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",  
    auth: {
        user: process.env.EMAIL_ADDRESS, 
        pass: process.env.EMAIL_PASSWORD,
    },
});

export const sendMail = async (email, htmlContent) => {
    try {
        const info = await transporter.sendMail({
            from: `"Christ Embassy kasoa Branch 2 👻" <${process.env.EMAIL_ADDRESS}>`, // sender address
            to: email, // list of receivers
            subject: "Your Verification Code", // Subject line
            html: htmlContent, // html body
        });
    
        return info;
    } catch (error) {
        console.error("Error sending email:", error.message);
        
    }
};
