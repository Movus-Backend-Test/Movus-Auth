import token from "../functions/tokenVerification"
import { PrismaClient } from "@prisma/client"
import email from "../functions/mailer"
import { nanoid } from "nanoid"

const prisma = new PrismaClient()

const verifyUser = async (req, res) => {
  const status = await prisma.verification_token.findUnique({
    where: {
      token: req.body.token,
    },
  })

  if (!status) {
    return res.status(401).json({
      message: "Your account was not verified (invalid token?).",
      status: false,
    })
  }

  if (Date.now() >= status.expiration) {
    return res
      .status(401)
      .json({ message: "your token expired", status: false })
  }

  await prisma.users.update({
    where: {
      id: status.user_id,
    },
    data: {
      verified: true,
    },
  })

  await prisma.verification_token.delete({
    where: {
      token: status.token,
    },
  })

  return res.json({
    message: "Your account has been successfully verified.",
    status: true,
  })
}

const regenerateVerifyToken = async (req, res) => {
  try {
    const account = await prisma.users.findUnique({
      where: {
        email: req.body.email,
      },
    })

    if (account.verified) {
      return res.status(400).json({
        message: "Your account has already been verified.",
      })
    }

    let verificationToken = await prisma.verification_token.create({
      data: {
        token: nanoid(8),
        users: {
          connect: {
            id: account.id,
          },
        },
        expiration: Date.now() + 1800000,
      },
    })
    const msg = {
      to: account.email,
      from: "no-reply@advistm.tech", // Use the email address or domain you verified above
      subject: "Verify your movus account",
      text: `Here is your verification token (Valid 1 hour from this email was sent): ${verificationToken.token}`,
    }
    email(msg)
    return res.json({
      message:
        "Message sent to email. Your token will be valid for 30 minutes.",
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({
      message: "An error has occurred.",
      status: false,
    })
  }
}

export default {
    verify: verifyUser,
    regenerate: regenerateVerifyToken
}