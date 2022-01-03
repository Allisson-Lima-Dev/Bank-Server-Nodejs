require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { chekcToken } = require('./middlewares/checkToken');
const db = require('./db/db');

const cors = require('cors');

const PORT = process.env.PORT || 8080

const app = express();

app.use(cors());

//Config JSON response
app.use(express.json());

//Models

const User = require('./model/User');

//Rota privada
app.get('/user/:id', chekcToken, async (req, res) => {
    const id = req.params.id
    //check se o usuario existe
    const user = await User.findById(id, '-password')

    if (!user) {
        return res.status(404).json({ result: "Usuário não encontrado" })
    }
    res.status(200).json({ user })
})



//Rota Publica Teste
app.get('/', (req, res) => {
    res.status(200).json({ result: "Seja bem vindo a API Bank server para seu projeto" })
})

//Registrar Usuário
app.post('/register-user', async (req, res) => {
    const { name, username, email, password, confirmpassword } = req.body;
    //validação
    if (!name) {
        return res.status(422).json({ result: 'Nome é obrigatório' })
    }
    if (!username) {
        return res.status(422).json({ result: 'Nome do Usuario é obrigatório' })
    }
    if (!email) {
        return res.status(422).json({ result: 'Email é obrigatório' })
    }
    if (!password) {
        return res.status(422).json({ result: 'Senha é obrigatório' })
    }
    if (password !== confirmpassword) {
        return res.status(422).json({ result: 'A senha não confere' })
    }

    //check se usuario existe
    const userExists = await User.findOne({ email: email })

    if (userExists) {
        return res.status(422).json({ result: 'Por favor insere outro email!' })
    }

    //creat password com bcrypt
    const salt = await bcrypt.genSalt(12)
    const passwordHash = await bcrypt.hash(password, salt)

    //criando o usuario
    const user = new User({
        name,
        username,
        email,
        password: passwordHash,
    })

    try {
        await user.save()
        res.status(201).json({ result: "Usuário criado com sucesso!" })
    } catch (error) {
        console.log(error)

        res.status(500).json({ result: "Aconteceu um erro no Servidor, tente novamente" })
    }

})

//Login User
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(422).json({ result: 'Email é obrigatório' })
    }
    if (!password) {
        return res.status(422).json({ result: 'Senha é obrigatório' })
    }

    //filtrar pelo email se exist
    const user = await User.findOne({ email: email })

    if (!user) {
        return res.status(404).json({ result: 'Usuario não encontrado' })
    }
    //check a senha 

    const checkPassword = await bcrypt.compare(password, user.password)

    if (!checkPassword) {
        return res.status(404).json({ result: 'Senha inválida' })
    }
    try {
        const secret = process.env.SECRET
        const token = jwt.sign(
            {
                id: user._id,
            },
            secret,
        )
        res.status(200).json({ result: "Autenticação sucedida", token })
    } catch (error) {
        console.log(error)

        res.status(500).json({ result: "Aconteceu um erro no Servidor, tente novamente" })
    }
})

app.listen(PORT, () => {
    console.log('Server running on port:' + PORT);
})