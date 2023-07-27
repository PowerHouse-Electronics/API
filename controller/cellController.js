const CellPhone = require('../models/celularModel');
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
  check('brand', 'La marca es obligatoria').not().isEmpty(),
  check('model', 'El modelo es obligatorio').not().isEmpty(),
  check('color', 'El color es obligatorio').not().isEmpty(),
  check('storage', 'El almacenamiento es obligatorio').not().isEmpty(),
  check('price', 'El precio es obligatorio').not().isEmpty(),
  check('price', 'El precio debe ser un número').isFloat(),
  check('screenResolution', 'La resolución de pantalla es obligatoria').not().isEmpty(),
  check('cameraResolution', 'La resolución de cámara es obligatoria').not().isEmpty(),
  check('image', 'La imagen es obligatoria').not().isEmpty(),
  check('stock', 'El stock es obligatorio').not().isEmpty(),
  check('stock', 'El stock debe ser un número').isInt()
];


const getAllCellPhones = async (req, res) => {
  try {
    const cellPhones = await CellPhone.find();
    const imageBaseUrl = req.protocol + '://' + req.get('host');
    cellPhones.forEach((cellPhone) => {
      cellPhone.image = imageBaseUrl + '/' + cellPhone.image;
    });
    return res.status(200).json({ cellPhones });
  } catch (error) {
    return res.status(500).json({ error: 'Error al obtener los celulares' });
  }
};


const addCellPhone = async (req, res) => {
  try {
    await new Promise((resolve, reject) => {
      upload(req, res, (err) => {
        if (err instanceof multer.MulterError) {
          console.log(err);
          return res.status(500).json({ message: err.message });
        } else if (err) {
          console.log(err);
          return res.status(500).json({ message: err.message });
        }
        resolve();
      });
    });

    const { brand, model, color, storage, price, screenResolution, cameraResolution, stock } = req.body;
    let image = req.file ? req.file.filename : 'Pdefault.png'; 

    validateFields.forEach((field) => field.run(req));
    if (price <= 0) {
      return res.status(400).json({ message: 'El precio debe ser mayor a 0' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ error: errorMessages });
    }

    const existingCellphone = await CellPhone.findOne({ brand, model, color, storage });
    if (existingCellphone) {
      console.log('Celular ya existe');
      if (image !== 'Pdefault.png') {
        fs.unlink(path.join('src/products', image), (err) => {
          if (err) {
            console.error(err);
            return;
          }
        });
      }
      return res.status(400).json({ message: 'Celular ya existe' });
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

    const newCellPhone = new CellPhone({
      brand,
      model,
      color,
      storage,
      price,
      screenResolution,
      cameraResolution,
      image,
      stock
    });

    try {
      await newCellPhone.validate();
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
      const cellPhone = await newCellPhone.save();
      const imageBaseUrl = req.protocol + '://' + req.get('host');
      cellPhone.image = imageBaseUrl + '/' + cellPhone.image;
      cellPhone.cameraResolution = cellPhone.cameraResolution + 'px';
      cellPhone.storage = cellPhone.storage + 'GB';
      return res.status(200).json({ message: 'Celular agregado correctamente', cellPhone });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error interno del servidor' });
  }
};




const updateCellPhone = async (req, res) => {
  try {
    // Manejar la carga del archivo antes de continuar
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
    const {price, stock } = req.body;
    const filename = req.file ? req.file.filename : null;

    validateFields.forEach((field) => field.run(req));

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorMessages = errors.array().map(error => error.msg);
      return res.status(400).json({ error: errorMessages });
    }

    const product = await CellPhone.findById(id);
    if (!product) {
      if (filename) {
        // Eliminar el archivo cargado si no existe el producto
        fs.unlink(path.join('src/products', filename), (err) => {
          if (err) {
            console.error(err);
          }
        });
      }
      return res.status(404).json({ message: 'Celular no encontrado' });
    }

    if (filename && product.image !== 'Pdefault.png') {
      // Eliminar la imagen anterior si se carga una nueva imagen
      fs.unlink(path.join('src/products', product.image), (err) => {
        if (err) {
          console.error(err);
        }
      });
    }

    if (stock < product.stock) {
      return res.status(400).json({ message: 'El stock debe ser mayor o igual al stock actual' });
    }

    product.price = price;
    product.image = filename || product.image;
    product.stock = stock;

    try {
      await product.validate();
    } catch (error) {
      const errorMessages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ errors: errorMessages });
    }

    try {
      const updatedProduct = await product.save();
      const imageBaseUrl = req.protocol + '://' + req.get('host');
      const imageUrl = imageBaseUrl + '/' + updatedProduct.image;
      updatedProduct.image = imageUrl;
      return res.status(200).json({ message: 'Celular actualizado correctamente', updatedProduct });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error al actualizar el celular' });
  }
};


const deleteCellPhone = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await CellPhone.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    try {
      await CellPhone.deleteOne({ _id: id });
      const image = product.image;
      if (image !== 'Pdefault.png') {
        fs.unlink('src/products/' + image, (err) => { // Agregar la barra diagonal en la ruta
          if (err) {
            console.error(err);
            return res.status(500).json({ message: 'Internal server error' });
          }
        });
      }
      return res.status(200).json({ message: 'Celular eliminado correctamente' });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};



module.exports = { getAllCellPhones, addCellPhone, updateCellPhone, deleteCellPhone };