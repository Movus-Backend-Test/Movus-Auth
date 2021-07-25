import token from "@functions/tokenVerification"
import email from "@functions/mailer"
import bcrypt from "bcryptjs"
import { PrismaClient } from "@prisma/client"
import { nanoid } from "nanoid"

const prisma = new PrismaClient()

const register = async (req, res) => {
  if (
    !req.body.email ||
    !req.body.firstname ||
    !req.body.lastname ||
    !req.body.username ||
    !req.body.password ||
    !req.body.address ||
    !req.body.phone_number
  ) {
    return res.status(404).json({ message: "Form is not completed" })
  }

  const user = await prisma.users.findUnique({
    where: {
      username: req.body.username,
    },
  })

  if (user) {
    if (user.verified === true) {
        return res.status(400).json({ message: "Account already exist and verified" })
    }

    return res.status(400).json({ message: "Account already exist but not verified" })
  }
}
