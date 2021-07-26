import bcrypt from "bcryptjs"
import token from "../functions/tokenAuth"
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

    const jwtToken = await token.generate(tokenData)

    return res.status(200).json({ token: jwtToken })
  } catch (err) {
    console.log(err)
    return res.status(500).json({ message: "An Error Occured" })
  }
}

const changePassword = async (req, res) => {
  try {
    if (!req.body.oldPassword || !req.body.username || !req.body.newPassword) {
      return res.status(404).json({
        message: "Username and Password must be filled",
        status: false,
      })
    }

    const account = await prisma.users.findUnique({
      where: {
        username: req.body.username,
      },
    })

    if (!account) {
      return res
        .status(404)
        .json({ message: "Account not exist", status: false })
    }

    const oldPasswordVerified = await bcrypt.compare(
      req.body.oldPassword,
      account.password
    )

    if (!oldPasswordVerified) {
      return res
        .status(401)
        .json({ message: "old password false", status: false })
    }

    const newHashedPassword = await bcrypt.hash(req.body.newPassword, 10)

    await prisma.users.update({
      where: {
        username: req.body.username,
      },
      data: {
        password: newHashedPassword,
      },
    })

    return res.status(201).json({
      message: "Your password has been successfully changed!",
      status: true,
    })
  } catch {
    return res
      .status(500)
      .json({ message: "A Server Error Occured", status: false })
  }
}

export default {
  login: login,
  changePassword: changePassword,
}
