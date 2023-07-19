const CellPhone = require('../models/celularModel');

// Visualizar todos los celulares
exports.getAllCellPhones = async (req, res) => {
  try {
    const cellPhones = await CellPhone.find();
    res.json(cellPhones);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los celulares' });
  }
};

// Agregar un nuevo celular
exports.addCellPhone = async (req, res) => {
  try {
    const { brand, model, color, storage, price, screenResolution, cameraResolution, image } = req.body;

    // Validar campos vacíos
    if (!brand || !model || !color || !storage || !price || !screenResolution || !cameraResolution || !image) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validar duplicados
    const existingCellPhone = await CellPhone.findOne({ brand, model, color });
    if (existingCellPhone) {
      return res.status(400).json({ error: 'Ya existe un celular con la misma marca, modelo y color' });
    }

    const newCellPhone = new CellPhone(req.body);
    await newCellPhone.save();
    res.status(201).json({ message: 'Celular agregado correctamente', newCellPhone });
  } catch (error) {
    res.status(400).json({ error: 'Error al agregar el celular' });
  }
};

// Actualizar un celular existente por ID
exports.updateCellPhone = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, model, color, storage, price, screenResolution, cameraResolution, image } = req.body;

    // Validar campos vacíos
    if (!brand || !model || !color || !storage || !price || !screenResolution || !cameraResolution || !image) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const updatedCellPhone = await CellPhone.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedCellPhone) {
      return res.status(404).json({ error: 'El celular no existe' });
    }

    res.json({ message: 'Celular actualizado correctamente', updatedCellPhone });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar el celular' });
  }
};

// Eliminar un celular existente por ID
exports.deleteCellPhone = async (req, res) => {
  try {
    const { id } = req.params;
    await CellPhone.findByIdAndDelete(id);
    res.json({ message: 'Celular eliminado correctamente' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar el celular' });
  }
};
