import jwt from "jsonwebtoken";
import { secretKey } from "./utils.js";

//generate token
export const generateToken = (user) =>{
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role
    }

    return jwt.sign( payload, secretKey,{ expiresIn: "12h"  })
}


//verify token
export const verifyToken = (req, res, next) =>{
    const authHeader = req.headers['authorization'];

    //check if the token is not provided
    if (!authHeader) {
        return res.status(401).json({ success: false, message: "No token provided" });
    }

    //split the token from the bearer
    const [bearer, token]  = authHeader.split(' ');
    
    //check if the bearer is not in the right format
    if (bearer !== 'Bearer' && !token) {
        return res.status(401).json({ success: false, message: "Invalid token format" });
    }

    //verify the token from the user
    jwt.verify(token, secretKey, (err, decoded) =>{
        if (err) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }
        req.user = decoded;
        next();
    })
}