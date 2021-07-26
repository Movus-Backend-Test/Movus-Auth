import express from "express"
import loginController from "../controllers/loginController"
import verifyController from "../controllers/verifyController"
import registerController from "../controllers/registerController"
import rateLimit from "express-rate-limit"

const router = express.Router()

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message:
    "Too many login attempts from this IP, please try again in 15 minutes.",
})

const generateVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 3,
  message:
    "Too many verification attempts from this IP, please try again in 15 minutes",
})

const verifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  message:
    "Too many verification attempts from this IP, please try again in 15 minutes",
})

router.get("/", function (req, res, next) {
  res.send("Hello from Movus")
})

router.post("/login", loginLimiter, (req, res) => loginController.login(req, res))
router.post('/register', (req, res) => registerController.register(req, res))

router.post('/verify', verifyLimiter, (req, res) => verifyController.verify(req, res))
router.post('/verify/regenerate', generateVerifyLimiter, (req, res) => verifyController.regenerate(req, res))

router.post('/account/generateresettoken', (req, res) => registerController.forgetPassword(req, res))
router.post('/account/resetpassword', (req, res) => registerController.resetPassword(req, res))
router.post('/account/changepassword', (req, res) => loginController.changePassword(req, res))

export default router
