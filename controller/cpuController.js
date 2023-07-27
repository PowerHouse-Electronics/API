const CPU = require('../models/computerModel');
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
  check('processor').not().isEmpty().withMessage('El procesador es obligatorio'),
  check('ram').not().isEmpty().withMessage('La memoria RAM es obligatoria'),
  check('storage').not().isEmpty().withMessage('El almacenamiento es obligatorio'),
  check('price').not().isEmpty().withMessage('El precio es obligatorio').isFloat().withMessage('El precio debe ser un número'),
  check('operatingSystem').not().isEmpty().withMessage('El sistema operativo es obligatorio'),
  check('graphicsCard').not().isEmpty().withMessage('La tarjeta gráfica es obligatoria'),
  check('image').not().isEmpty().withMessage('La imagen es obligatoria'),
  check('stock').not().isEmpty().withMessage('El stock es obligatorio').isInt().withMessage('El stock debe ser un número')
];

const getAllCPUs = async (req, res) => {
  try {
    const CPUs = await CPU.find();
    const imageBaseUrl = req.protocol + '://' + req.get('host');
    CPUs.forEach((cpu) => {
      cpu.image = imageBaseUrl + '/' + cpu.image;
    });
    return res.status(200).json({ CPUs });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener las CPUs' });
  }
};

const addCPU = async (req, res) => {
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

    const { brand, model, processor, ram, storage, price, operatingSystem, graphicsCard, stock } = req.body;
    let image = req.file ? req.file.filename : 'Pdefault.png';

    validateFields.forEach((field) => field.run(req));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ error: errorMessages });
    }

    const existingCPU = await CPU.findOne({ brand, model, processor, ram, storage, operatingSystem, graphicsCard });
    if (existingCPU) {
      if (image !== 'Pdefault.png') {
        fs.unlink(path.join('src/products', image), (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
          }
        });
      }
      return res.status(400).json({ message: 'Ya existe una CPU con la misma marca y modelo' });
    }

    if (stock <= 0) {
      if (image !== 'Pdefault.png') {
        fs.unlink(path.join('src/products', image), (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: err.message });
          }
        });
      }
      return res.status(400).json({ message: 'El stock debe ser mayor a 0' });
    }


    const newCPU = new CPU({
      brand,
      model,
      processor,
      ram,
      storage,
      price,
      operatingSystem,
      graphicsCard,
      image,
      stock
    });

    try {
      await newCPU.validate();
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
      const cpu = await newCPU.save();
      const imageBaseUrl = req.protocol + '://' + req.get('host');
      cpu.image = imageBaseUrl + '/' + cpu.image;
      return res.status(201).json({ message: 'CPU agregada correctamente', cpu });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

const updateCPU = async (req, res) => {
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
    const { price, stock } = req.body;
    const filename = req.file ? req.file.filename : null;

    validateFields.forEach((field) => field.run(req));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ error: errorMessages });
    }

    const cpu = await CPU.findById(id);
    if (!cpu) {
      if (filename) {
        fs.unlink(path.join('src/products', filename), (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
      return res.status(404).json({ message: 'La CPU no existe' });
    }

    if (filename && cpu.image !== 'Pdefault.png') {
      fs.unlink(path.join('src/products', cpu.image), (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    
    cpu.price = price;
    cpu.image = filename || cpu.image;
    cpu.stock = stock;

    try {
      await cpu.validate();
    } catch (error) {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: errorMessages });
    }

    try {
      const updatedCPU = await cpu.save();
      const imageBaseUrl = req.protocol + '://' + req.get('host');
      const imageUrl = imageBaseUrl + '/' + updatedCPU.image;
      updatedCPU.image = imageUrl;
      return res.status(200).json({ message: 'CPU actualizada correctamente', updatedCPU });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar la CPU' });
  }
};

const deleteCPU = async (req, res) => {
  const { id } = req.params;

  try {
    const cpu = await CPU.findById(id);
    if (!cpu) {
      return res.status(404).json({ message: 'CPU no encontrada' });
    }

    try {
      await CPU.deleteOne({ _id: id });
      const image = cpu.image;
      if (image !== 'Pdefault.png') {
        fs.unlink('src/products/' + image, (err) => {
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Error interno del servidor' });
          }
        });
      }
      return res.status(200).json({ message: 'CPU eliminada correctamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};

module.exports = { getAllCPUs, addCPU, updateCPU, deleteCPU };
