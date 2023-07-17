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
            const filename = req.file ? req.file.filename : null; // Utilizar null en lugar de una cadena vacía si no hay archivo

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
                image: filename, // Utilizar el valor de filename directamente
                address,
                phone,
                registerDate: Date.now(),
                lastLogin: Date.now()
            });

            try {
                // Validar el modelo Users antes de guardarlo en la base de datos
                await newUser.validate();
            } catch (error) {
                const errorMessages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ errors: errorMessages });
            }

            try {
                const savedUser = await newUser.save();
                const token = jwt.sign({ userId: savedUser._id }, 'secretKey', { expiresIn: '1h' });
                return res.status(200).json({ user: savedUser, token });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
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
        user.token = token;
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

const updateUser = async (req, res) => {
    try {
        upload(req, res, async (err) => {
            if (err instanceof multer.MulterError) {
                console.log(err);
                return res.status(500).json({ message: err.message });
            } else if (err) {
                console.log(err);
                return res.status(500).json({ message: err.message });
            }

            const { id } = req.params; 
            const { name, email, password, address, phone } = req.body;
            const filename = req.file ? req.file.filename : null; 

            const user = await Users.findById(id);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.role === 'admin') {
                if (user._id.toString() === id || user.role === 'admin') {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
            } else if (user.role === 'superadmin') {
                if (user._id.toString() === id) {
                    return res.status(403).json({ message: 'Unauthorized' });
                }
            }

            user.name = name || user.name;
            user.email = email || user.email;
            user.password = password ? bcrypt.hashSync(password, bcrypt.genSaltSync(10)) : user.password;
            user.address = address || user.address;
            user.phone = phone || user.phone;
            user.image = filename || user.image;

            try {
                await user.validate();
            } catch (error) {
                const errorMessages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ errors: errorMessages });
            }

            try {
                const updatedUser = await user.save();
                return res.status(200).json({ user: updatedUser });
            } catch (error) {
                console.error(error);
                return res.status(500).json({ message: 'Internal server error' });
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



module.exports = { registerUser, loginUser, hello, updateUser };
