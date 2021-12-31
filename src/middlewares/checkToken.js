const jwt = require('jsonwebtoken')

exports.chekcToken = (req, res, next) => {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
        return res.status(401).json({ result: "Acesso negado!" })
    }

    try {

        const secret = process.env.SECRET
        jwt.verify(token, secret)
        next()

    } catch (error) {
        res.status(400).json({ result: "token inválido" })
    }
}