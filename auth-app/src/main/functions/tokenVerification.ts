import jwt from "jsonwebtoken"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const authenticateToken = async (data, res) => {
    const token = data
    if (token == null) return 401

    let verify = await jwt.verify(
        token,
        process.env.EMAIL_VERIFICATION_SECRET,
        async (err, user) => {
            if (err) return false
            await prisma.users.update({
                where: { id: user.id },
                data: { verified: true }
            })
            return true
        }
    )
    return await verify
}

const generateToken = (data) => {
    jwt.sign(data, process.env.EMAIL_VERIFICATION_SECRET, {
        expiresIn: '2h'
    })
}

export default {
    verify: authenticateToken,
    generate: generateToken
}