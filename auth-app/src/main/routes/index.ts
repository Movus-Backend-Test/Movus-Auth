import express from "express"
import loginController from "../controllers/loginController"
import verifyController from "../controllers/verifyController"
import registerController from "../controllers/registerController"
import carsController from "../controllers/carsController"
import transactionController from "../controllers/transactionController"
import rateLimit from "express-rate-limit"
import token from "../functions/tokenAuth"

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
router.post('/account/getbalance', token.verify, (req, res) => transactionController.getBalance(req, res))
router.post('/account/topup', token.verify, (req, res) => transactionController.topUp(req, res))

router.post('/car/detail', (req, res) => carsController.detail(req, res))
router.post('/car/all', (req, res) => carsController.get(req, res))
router.post('/car/find', (req, res) => carsController.find(req, res))

router.post('/car/register', token.verifyAdmin, (req, res) => carsController.register(req, res))
router.post('/car/update', token.verifyAdmin, (req, res) => carsController.update(req, res))
router.post('/car/delete', token.verifyAdmin, (req, res) => carsController.delete(req, res))

router.post('/transaction/book', token.verifyMember, (req, res) => transactionController.book(req, res))
router.post('/transaction/all', token.verifyAdmin, (req, res) => transactionController.getAll(req, res))
router.post('/transaction/finish', token.verifyAdmin, (req, res) => transactionController.finish(req, res))

export default router
