import { PrismaClient } from "@prisma/client";
import { hashPassword } from "./utils.js";

const client = new PrismaClient()

const findUserById = async ( user_id ) => {
    const checkUser = await client.user.findUnique({
        where:{
            "id":user_id
        }
    })

    if(!checkUser){
        throw new Error("User does not exist!")
    }

    console.log(`User found ${checkUser}`);

    return checkUser
}

const findUserByUsername = async ( username ) => {
    const user = await client.user.findUnique({
        where:{
            "username":username
        }
    })

    if(!user){
        throw new Error("User not found")
    }

    return user
}

const addUser = async ( username, password ) => {
    const hashedPassword = hashPassword(password)

    const user = await client.user.create({
        data:{
            "username":username,
            "password":hashedPassword
        }
    })

    console.log(`User added - ${user}`);
    
    if(!user){
        throw new Error("error with database op")
    }

    return user
}

export {findUserById, addUser, findUserByUsername}