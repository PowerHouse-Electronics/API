const Users = require('../models/usersModel');
const { check, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt-nodejs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'src/users');
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

            const { name, email, password, address, phone, role } = req.body;
            const filename = req.file ? req.file.filename : 'default.png';

            await check('name', 'Name is required').not().isEmpty().run(req);
            await check('email', 'Email is required').not().isEmpty().run(req);
            await check('email', 'Invalid email').isEmail().run(req);
            await check('password', 'Password is required').not().isEmpty().run(req);
            await check('password', 'Password must be at least 6 characters').isLength({ min: 6 }).run(req);
            await check('address', 'Address is required').not().isEmpty().run(req);
            await check('phone', 'Phone is required').not().isEmpty().run(req);

            const validationErrors = validationResult(req);
            if (!validationErrors.isEmpty()) {
                if (filename !== 'default.png') {
                    fs.unlink('src/users/' + filename, (err) => {
                        if (err) {
                            console.error(err);
                            return
                        }
                    });
                }

                const errorMessages = validationErrors.array().map(error => error.msg);
                return res.status(400).json({ errors: errorMessages });
            }

            const existingUser = await Users.findOne({ email });
            if (existingUser) {
                console.log(existingUser);
                if (filename) {
                    fs.unlink('src/' + filename, (err) => {
                        if (err) {
                            console.error(err);
                            return
                        }
                    });
                }
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

            try {
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

        const imageBaseUrl = req.protocol + '://' + req.get('host');
        const imageUrl = `${imageBaseUrl}/${user.image}`; 

        console.log(user);
        return res.status(200).json({ message: 'Login successful', user: { ...user.toObject(), image: imageUrl }, token });
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
            const { name, email, password, address, phone, role,  modifierId } = req.body;
            const filename = req.file ? req.file.filename : null;

            if (!modifierId) {
                if (filename) {
                    fs.unlink('src/' + filename, (err) => {
                        if (err) {
                            console.error(err);
                            return
                        }
                    });
                }
                return res.status(400).json({ message: 'Missing modifierId' });
            }

            const user = await Users.findById(id);
            if (!user) {
                if (filename) {
                    fs.unlink('src/' + filename, (err) => {
                        if (err) {
                            console.error(err);
                            return
                        }
                    });
                }
                return res.status(404).json({ message: 'User not found' });
            }
            const modifier = await Users.findById(modifierId);
            if (!modifier) {
                if (filename) {
                    fs.unlink('src/' + filename, (err) => {
                        if (err) {
                            console.error(err);
                            return
                        }
                    });
                }
                return res.status(404).json({ message: 'Modifier not found' });
            }
            console.log(user);
            console.log(modifier);

         

            if (user.role === 'admin' && modifier.role === 'admin' && modifier.role === 'user') {
                if (filename) {
                    fs.unlink('src/users/' + filename, (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ message: err.message });
                        }
                    });
                }
                return res.status(403).json({ message: 'Forbidden' });
            }

            if (user.role === 'admin' && modifier.role !== 'superadmin' ) {
                if (filename) {
                    fs.unlink('src/users/' + filename, (err) => {
                        if (err) {
                            console.error(err);
                            return
                        }
                    });
                }
                return res.status(403).json({ message: 'Forbidden' });
            }

            if (user.role === 'superadmin') {
                if (filename) {
                    fs.unlink('src/users/' + filename, (err) => {
                        if (err) {
                            console.error(err);
                            return res.status(500).json({ message: err.message });
                        }
                    });
                }
                return res.status(403).json({ message: 'Forbidden' });
            }

            user.name = name || user.name;
            user.email = email || user.email;
            user.password = password ? bcrypt.hashSync(password, bcrypt.genSaltSync(10)) : user.password;
            user.address = address || user.address;
            user.phone = phone || user.phone;

            if (modifier.role === 'superadmin') {
            user.role = role || user.role;
            }
            else {
                user.role = user.role;
            }

            if (filename && user.image !== 'default.png') {
                fs.unlink('src/users/' + user.image, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: err.message });
                    }
                });
            }
            user.image = filename || user.image;

            try {
                await user.validate();
            } catch (error) {
                const errorMessages = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ errors: errorMessages });
            }

            try {
                const updatedUser = await user.save();
                const imageBaseUrl = req.protocol + '://' + req.get('host');
                const imageUrl = `${imageBaseUrl}/${updatedUser.image}`;
                updatedUser.image = imageUrl;

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

const getUsers = async (req, res) => {
    const {secret } = req.params;

    try {
        if (secret !== 'admin') {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        if (secret === 'admin') {
            const users = await Users.find();
            console.log(users);
            if (!users) {
                return res.status(404).json({ message: 'Users not found' });
            }
            const imageBaseUrl = req.protocol + '://' + req.get('host');
            users.forEach(user => {
                user.image = `${imageBaseUrl}/${user.image}`;
            });
            return res.status(200).json({ users });
                       
        } 
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

const deleteUser = async (req, res) => {
    const { id } = req.params;
    const { modifierId } = req.body;

    try {
        if (!modifierId) {
            return res.status(400).json({ message: 'Missing modifierId' });
        }

        const user = await Users.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const modifier = await Users.findById(modifierId);
        if (!modifier) {
            return res.status(404).json({ message: 'Modifier not found' });
        }

        if (user.role === 'admin' && modifier.role !== 'superadmin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        if (user.role === 'superadmin') {
            return res.status(403).json({ message: 'Forbidden' });
        }

        try {
            await Users.deleteOne({ _id: id });
            const image = user.image;
            if (image !== 'default.png') {
                fs.unlink('src/users/' + image, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).json({ message: 'Internal server error' });
                    }
                });
            }
            return res.status(200).json({ message: 'User deleted' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


module.exports = { registerUser, loginUser, getUsers, updateUser, deleteUser };
