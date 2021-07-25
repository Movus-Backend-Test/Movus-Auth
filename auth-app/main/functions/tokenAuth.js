import jwt from "jsonwebtoken"

const verifyToken = async (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token == null) return res.sendStatus(401)

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)
        req.user = user
        console.log(req.user)
        next()
    })
}

const generateToken = async (data) => {
    return jwt.sign(data, process.env.TOKEN_SECRET, { expiresIn: '1h' })
}

export default {
    verify: verifyToken,
    generate: generateToken
}