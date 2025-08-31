import jwt from 'jsonwebtoken';
import { findUserById } from './service.js';
import bcrypt from 'bcrypt';

const grantToken = ( user_id, username ) => {
    const payload = {
        "user_id":user_id,
        "username":username
    }

    const token = jwt.sign(payload, process.env.TOKEN_SECRET)

    return token
}

const authMiddleware = async ( req, res, next ) => {
    try {
        const cookie = req.header("Authorization").replace("Bearer ","")
    
        if(!cookie){
            return res.json({
                "message":"No cookie, no user"
            })
            .status(400)
        }
    
        console.log(`Cookie is ${cookie}`);
        
        const payload = jwt.verify(cookie, process.env.TOKEN_SECRET)
    
        console.log(`Payload is ${payload}`);
    
        const checkUser = await findUserById( payload.user_id )

        if(!checkUser){
            console.log("User not found");
            return res.json({
                "message":"User not found"
            }).status(404)
        }

        req.user = checkUser
        next()

    } catch (error) {
        console.log(`Error is ${error}`);
        return res.json({
            "message":`Error occured in auth ${error}`
        }).status(500)
    }
    
}

const hashPassword = (password) => {
    const salt = bcrypt.genSaltSync(12)
    const hashedPassword = bcrypt.hashSync(password, salt);

    return hashedPassword
}

const comparePassword = (password, hashedPassword) => {
    return bcrypt.compareSync(password, hashedPassword)
}

export {authMiddleware, grantToken, hashPassword, comparePassword}