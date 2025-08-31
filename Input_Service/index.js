import express from 'express'
import dotenv from 'dotenv'
import { addUser, findUserByUsername } from '../Models/service.js'
import { comparePassword, grantToken } from '../Models/utils.js'

dotenv.config()

const app = express()

app.use(express.json())

app.get("/", (req,res) => {
    console.log(`Hitting root`);

    return res.json({
        "success":true
    })
})


app.post("/api/v1/register", async (req,res) => {
        try {
                const {username, password} = req.body

                console.log(username, password);
            
                if( !username || !password ){
                    return res.json({
                        "message":"Fields not entered"
                    }).status(400)
                }
            
                if( [username, password].some( (item) => item.trim === "" ) ){
                    return res.json({
                        "message":"Fields empty"
                    }).status(400)
                }
            
                const user = await addUser(username, password)

                console.log(`User ${user}`);
                
                return res.json({
                    "message":"User added",
                    "user":user
                }).status(200)
            
        } catch (error) {
            console.log(`Error occured in adding user ${error}`);
            return res.json({
                "message":`Error ${error}`
            }).status(500)
        }
    }
)

app.post("/api/v1/login", async(req,res) => {
    try {
        const {username, password} = req.body
    
        if( !username || !password ){
            return res.json({
                "message":"Fields not entered"
            }).status(400)
        }
    
        if( [username, password].some( (item) => item.trim === "" ) ){
            return res.json({
                "message":"Fields empty"
            }).status(400)
        }
    
        const user = await findUserByUsername(username)
    
        if(!user){
            return res.json({
                "message":"User not found"
            }).status(404)
        }
    
        const hashedPassword = user.password
    
        if(!comparePassword(password, hashedPassword)){
            return res.json({
                "message":"Password or Username incorrect!"
            }).status(400)
        }
    
        const token = grantToken(user.id, username)
    
        res.appendHeader("Authorization", `Bearer ${token}`)
    
        return res.json({
            "message":"User logged in"
        }).status(200)
    } catch (error) {
        return res.json({
            "message":`Error in logging user in ${error}`
        }).status(500)
    }
})

app.listen(process.env.PORT, () => {
    console.log(`Server running ${process.env.PORT}`);    
} )