import bcrypt from "bcryptjs"
import token from "@functions/tokenAuth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const login = async (req, res) => {
    let account = await prisma.users.findUnique({
        where: {
            username: req.body.username
        }
    })

    if (account == null) {
        return res.status(404).json({ message: 'Username not found' })
    }

    
}