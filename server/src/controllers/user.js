const User = require('../models/user')
const CryptoJs = require('crypto-js')
const jsonwebtoken = require('jsonwebtoken')

// Регистрация пользователя
exports.register = async (req, res) => {
    const {password} = req.body
    try {
        req.body.password = CryptoJs.AES.encrypt(
            password,
            process.env.PASSWORD_SECRET_KEY
        )
        const user = await User.create(req.body)
        const token = jsonwebtoken.sign (
            { id: user._id },
            process.env.TOKEN_SECRET_KEY,
            { expiresIn: '24h' }
        )
        res.status(201).json({user, token})
    }
    catch (err) {
        res.status(500).json(err)
    }
}

// Авторизация пользователя
exports.login = async (req,res) => {
    const {username, password} = req.body
    try {
        const user = await User.findOne({username}).select("password username")
        if(!user){
            return res.status(401).json({
                errors: [
                    {
                        param: 'username',
                        message: 'Неправильный логин или пароль'
                    }
                ]
            })
        }
        const decryptedPass = CryptoJs.AES.decrypt(
            user.password,
            process.env.PASSWORD_SECRET_KEY
        ).toString(CryptoJs.enc.Utf8)
        if (decryptedPass !== password){
            return res.status(401).json({
                errors: [
                    {
                        param: 'username',
                        message: 'Неправильный логин или пароль'
                    }
                ]
            })
        }
        user.password = undefined

        const token = jsonwebtoken.sign(
            { id: user._id },
            process.env.TOKEN_SECRET_KEY,
            { expiresIn: '24h' }
        )

        res.status(200).json({user, token})
    }
    catch (err){
        res.status(500).json(err)
    }
}