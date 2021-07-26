// import token from "@functions/tokenVerification"
import email from "../functions/mailer"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import { nanoid } from "nanoid"

const prisma = new PrismaClient()

const register = async (req, res) => {
  try {
    if (
      !req.body.email ||
      !req.body.firstname ||
      !req.body.lastname ||
      !req.body.username ||
      !req.body.password ||
      !req.body.address ||
      !req.body.phone_number ||
      !req.body.user_type
    ) {
      return res
        .status(404)
        .json({ message: "Form is not completed", status: false })
    }

    const usernameCheck = await prisma.users.findUnique({
      where: {
        username: req.body.username,
      },
    })

    const emailCheck = await prisma.users.findUnique({
      where: {
        email: req.body.email,
      },
    })

    // check if username or email already exist
    if (usernameCheck || emailCheck) {
      if (usernameCheck.verified === true) {
        return res.status(400).json({
          message: "Account already exist and verified",
          status: false,
        })
      }

      return res.status(400).json({
        message: "Account already exist but not verified",
        status: false,
      })
    }

    const hashedPassword = await bcrypt.hash(req.body.password, 10)

    const insertedData = await prisma.users.create({
      data: {
        firstname: req.body.firstname,
        username: req.body.username,
        user_type: req.body.user_type,
        lastname: req.body.lastname,
        email: req.body.email,
        address: req.body.address,
        phone_number: req.body.phone_number,
        password: hashedPassword,
      },
    })

    const verificationToken = await prisma.verification_token.create({
      data: {
        token: nanoid(16),
        users: {
          connect: {
            id: insertedData.id,
          },
        },
        expiration: Date.now() + 3600000,
      },
    })

    const message = {
      to: insertedData.email,
      from: "no-reply@advistm.tech",
      subject: "Verify your movus account",
      text: `Here is your verification token (Valid 1 hour from this email was sent): ${verificationToken.token} `,
    }

    await email(message)
    return res.status(201).json({
      message:
        "You have successfully registered an account! Please verify your account.",
      status: true,
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "An error has occurred.",
      status: false,
    })
  }
}

const generateForgetPasswordToken = async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: { username: req.body.username },
    })

    if (!user) {
      return res
        .status(404)
        .json({ message: "Request failed, user not found." })
    }

    const token = nanoid(10)
    const passwordToken = await prisma.password_token.create({
      data: {
        token: token,
        expiration: Date.now() + 3600000,
        users: {
          connect: {
            id: user.id,
          },
        },
      },
    })

    const message = {
      to: user.email,
      from: "no-reply@advistm.tech",
      subject: "Movus App - Forget Password",
      text: `Here is your forget password token: ${token}`,
    }

    await email(message)

    return res.status(200).json({
      message:
        "Request success, your forget password token sent to your email.",
    })
  } catch (err) {
    console.log(err)
    return res.status(500).json({
      message: "A server error occured",
    })
  }
}

const resetPassword = async (req, res) => {
  const token = req.body.token
  const newPassword = req.body.newPassword

  if (!newPassword || !token) {
    return res.status(400).json({
      message: "Password reset failed. Specify a replacement password.",
      status: false,
    })
  }

  try {
    const verifyToken = await prisma.password_token.findUnique({
      where: {
        token: token,
      },
    })

    if (!verifyToken) {
      return res.status(401).json({
        message: "Password reset failed. Invalid token",
        status: false,
      })
    }

    //update user password
    await prisma.users.update({
      where: {
        id: verifyToken.user_id,
      },
      data: {
        password: await bcrypt.hash(req.body.newPassword, 10),
      },
    })

    // delete forget password token
    await prisma.password_token.delete({
      where: {
        token: token,
      },
    })

    return res.json({
      message:
        "Password reset successful. Please login using your new password",
      status: true,
    })
  } catch (err) {
    return res.status(500).json({
      message: "Password reset request failed. An error occurred",
      status: false,
    })
  }
}

export default {
  register: register,
  forgetPassword: generateForgetPasswordToken,
  resetPassword: resetPassword,
}
