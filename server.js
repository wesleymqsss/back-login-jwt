const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { USER_LIST_DB } = require('./utils/user-list-db');
const { generateTokenOnLogin } = require('./utils/jwt-manager');
const { authenticateToken } = require('./middlewares/authenticate-token');

const app = express();
const PORT = 3000;

app.use(bodyParser.json());

app.use(cors());

app.post('/login', (req, res) => {
    setTimeout(() => {
        const { username, password } = req.body;

        const USER_FOUND = USER_LIST_DB.find(user => user.username === username && user.password === password);

        if (!USER_FOUND) {
            return res.status(401).json({
                mensage: 'Invalid credentials.'
            });
        }

        //gerar token
        const USER_TOKEN = generateTokenOnLogin(username);

        return res.json({ token: USER_TOKEN });
    }, 5000)
});

app.put('/update-user', authenticateToken, (req, res) => {
    const tokenUsername = req.username;
    const newUserInfos = req.body;

    const { name, email, username, password } = newUserInfos;

    if (!name || !email || !username || !password) {
        return res.status(400).json({ message: 'All fields (name, email, username, password) are required.' });
    }

    const USER_FOUND = USER_LIST_DB.findIndex((user) => user.username === tokenUsername);

    if (USER_FOUND === -1) {
        return res.status(403).json({ message: 'user not found.' })
    }

    USER_LIST_DB[USER_FOUND] = newUserInfos;

    const newToken = generateTokenOnLogin(username);

    return res.status(200).json({
        message: 'User update successfully.',
        token: newToken
    });
});

app.post('/create-user', authenticateToken, (req, res) => {
    const tokenUserName = req.username;
    const newUser = req.body;

    const { name, email, username, password } = newUser;

    if (!name || !email || !username || !password) {
        return res.status(400).json({ message: 'All fields (name, email, username, password) are required.' });
    }

    const USER_TOKEN_FOUND = USER_LIST_DB.findIndex((user) => user.username === tokenUserName);

    if (USER_TOKEN_FOUND === -1) {
        return res.status(403).json({ message: 'user not found' });
    }

    const USER_FOUND = USER_LIST_DB.findIndex((user) => user.username === newUser.name);
    const USER_ALREADY_REGISTERED = USER_FOUND !== -1;

    if (USER_ALREADY_REGISTERED) {
        return res.status(409).json({ message: 'user already registered' });
    }

    USER_LIST_DB.push(newUser);

    return res.status(201).json({ message: 'user successfully created.' });
});

app.post('/validate-token', authenticateToken, (req, res) => {
    return res.json({ message: 'token valido.', username: req.username });
});


app.listen(PORT, () => {
    console.log(`O servidor esta rodando no http://localhost:${PORT}`);
})