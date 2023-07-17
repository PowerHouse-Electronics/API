const Users = require('../models/usersModel');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage }).single('image');

const registerUser = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                console.log(err);
                return res.status(500).json({ message: err.message });
            } else if (err) {
                console.log(err);
                return res.status(500).json({ message: err.message });
            }

            const { name, email, password, address, phone } = req.body;
            const filename = req.file ? req.file.filename : '';

            const existingUser = await Users.findOne({ email });
            if (existingUser) {
                console.log(existingUser);
                return res.status(400).json({ message: 'User already exists' });
            }

            const newUser = new Users({
                name,
                email,
                password: bcrypt.hashSync(password, bcrypt.genSaltSync(10)),
                role: 'user',
                image: filename,
                address,
                phone,
                registerDate: Date.now(),
                lastLogin: Date.now()
            });

            const savedUser = await newUser.save();
            const token = jwt.sign({ userId: savedUser._id }, 'secretKey', { expiresIn: '1h' });
            return res.status(200).json({ user: savedUser, token });
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await Users.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }
        const token = jwt.sign({ userId: user._id }, 'secretKey', { expiresIn: '1h' });

        user.lastLogin = Date.now();
        await user.save();
        console.log(user);
        return res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

const hello = async (req, res) => {
    try {
        return res.status(200).json({ message: 'Hello' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};


module.exports = { registerUser, loginUser, hello};