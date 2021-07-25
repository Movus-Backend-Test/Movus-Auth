import bcrypt from "bcryptjs"
import token from "@functions/tokenAuth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const login = async (req, res) => {
  try {
    if (!req.body.password || !req.body.username) {
      return res
        .status(404)
        .json({ message: "Username and Password must be filled" })
    }

    const account = await prisma.users.findUnique({
      where: {
        username: req.body.username,
      },
    })

    if (!account) {
      return res.status(404).json({ message: "Username not found" })
    }

    const verified = await bcrypt.compare(req.body.password, account.password)

    if (!verified) {
      return res.status(403).json({ message: "Username/Password Incorrect" })
    }

    const tokenData = {
      userId: account.id,
      firstname: account.firstname,
      lastname: account.lastname,
      username: account.username,
      email: account.email,
      address: account.address,
      phoneNumber: account.phone_number,
      userType: account.user_type,
      verified: account.verified,
    }

    return res.status(200).json(await token.generate(tokenData))
  } catch {
      return res.status(500).json({ message: "An Error Occured" })
  }
}

export default {
  login: login,
}
