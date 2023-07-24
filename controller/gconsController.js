const GameConsole = require('../models/gConsoleModel');
const { check, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'src/products/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

const upload = multer({ storage: storage }).single('image');

const validateFields = [
  check('brand').not().isEmpty().withMessage('La marca es obligatoria'),
  check('model').not().isEmpty().withMessage('El modelo es obligatorio'),
  check('storage').not().isEmpty().withMessage('El almacenamiento es obligatorio'),
  check('price').not().isEmpty().withMessage('El precio es obligatorio').isFloat().withMessage('El precio debe ser un número'),
  check('features').not().isEmpty().withMessage('Las características son obligatorias'),
  check('color').not().isEmpty().withMessage('El color es obligatorio'),
  check('image').not().isEmpty().withMessage('La imagen es obligatoria'),
];

const getAllGameConsoles = async (req, res) => {
  try {
    const gameConsoles = await GameConsole.find();
    const imageBaseUrl = req.protocol + '://' + req.get('host');
    gameConsoles.forEach((console) => {
      console.image = imageBaseUrl + '/' + console.image;
    });
    return res.status(200).json({ gameConsoles });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener las consolas de juegos' });
  }
};

const addGameConsole = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: err.message });
        }
        resolve();
      });
    });
    
    const { brand, model, storage, price, features, color } = req.body;
    let image = req.file ? req.file.filename : 'Pdefault.png';

    validateFields.forEach((field) => field.run(req));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ error: errorMessages });
    }

    const existingGameConsole = await GameConsole.findOne({ brand, model });
    if (existingGameConsole) {
      if (image !== 'Pdefault.png') {
        fs.unlink(path.join('src/products', image), (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
          }
        });
      }
      return res.status(400).json({ message: 'Ya existe una consola de juego con la misma marca y modelo' });
    }

    const newGameConsole = new GameConsole({
      brand,
      model,
      storage,
      price,
      features,
      color,
      image,
    });

    try {
      await newGameConsole.validate();
    } catch (error) {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      if (image !== 'Pdefault.png') {
        fs.unlink(path.join('src/products', image), (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
          }
        });
      }
      return res.status(400).json({ errors: errorMessages });
    }

    try {
      const console = await newGameConsole.save();
      const imageBaseUrl = req.protocol + '://' + req.get('host');
      console.image = imageBaseUrl + '/' + console.image;
      return res.status(201).json({ message: 'Consola de juego agregada correctamente', console });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateGameConsole = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ message: err.message });
        }
        resolve();
      });
    });

    const { id } = req.params;
    const { brand, model, storage, price, features, color } = req.body;
    const filename = req.file ? req.file.filename : null;

    validateFields.forEach((field) => field.run(req));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ error: errorMessages });
    }

    const gameConsole = await GameConsole.findById(id);
    if (!gameConsole) {
      if (filename) {
        fs.unlink(path.join('src/products', filename), (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
      return res.status(404).json({ message: 'La consola de juego no existe' });
    }

    const existingGameConsole = await GameConsole.findOne({ brand, model });
    if (existingGameConsole && existingGameConsole._id.toString() !== id) {
      if (filename) {
        fs.unlink(path.join('src/products', filename), (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
      return res.status(400).json({ message: 'Ya existe una consola de juego con la misma marca y modelo' });
    }

    if (filename && gameConsole.image !== 'Pdefault.png') {
      fs.unlink(path.join('src/products', gameConsole.image), (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    gameConsole.brand = brand;
    gameConsole.model = model;
    gameConsole.storage = storage;
    gameConsole.price = price;
    gameConsole.features = features;
    gameConsole.color = color;
    gameConsole.image = filename || gameConsole.image;

    try {
      await gameConsole.validate();
    } catch (error) {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: errorMessages });
    }

    try {
      const updatedGameConsole = await gameConsole.save();
      const imageBaseUrl = req.protocol + '://' + req.get('host');
      const imageUrl = imageBaseUrl + '/' + updatedGameConsole.image;
      updatedGameConsole.image = imageUrl;
      return res.status(200).json({ message: 'Consola de juego actualizada correctamente', updatedGameConsole });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar la consola de juego' });
  }
};

const deleteGameConsole = async (req, res) => {
  const { id } = req.params;

  try {
    const gameConsole = await GameConsole.findById(id);
    if (!gameConsole) {
      return res.status(404).json({ message: 'Consola de juego no encontrada' });
    }

    try {
      await GameConsole.deleteOne({ _id: id });
      const image = gameConsole.image;
      if (image !== 'Pdefault.png') {
        fs.unlink('src/products/' + image, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error interno del servidor' });
          }
        });
      }
      return res.status(200).json({ message: 'Consola de juego eliminada correctamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { getAllGameConsoles, addGameConsole, updateGameConsole, deleteGameConsole };
