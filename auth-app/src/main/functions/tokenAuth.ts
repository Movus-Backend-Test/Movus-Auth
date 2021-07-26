import jwt from "jsonwebtoken"

const verifyMember = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        if (!user.verified) return res.status(403).json({message: 'Your account is not verified', status: false})
        if (user.user_type.toLowerCase() !== "normal") return res.sendStatus(401)
        req.user = user
        console.log(req.user)
        next()
    })
}

const verifyAdmin = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        if (!user.verified) return res.status(403).json({message: 'Your account is not verified', status: false})
        if (user.user_type.toLowerCase() !== "admin") return res.sendStatus(401)
        req.user = user
        console.log(req.user)
        next()
    })
}

const generateToken = async (data) => {
    return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: '1h' })
}

export default {
    verifyMember: verifyMember,
    verifyAdmin: verifyAdmin,
    generate: generateToken
}