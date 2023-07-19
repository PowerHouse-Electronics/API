const CPU = require('../models/computerModel');

// Visualizar todas las CPUs
exports.getAllCPUs = async (req, res) => {
  try {
    const CPUs = await CPU.find();
    res.json(CPUs);
  } catch (error) {n
    res.status(500).json({ error: 'Error al obtener las CPUs' });
  }
};

// Agregar una nueva CPU
exports.addCPU = async (req, res) => {
  try {
    const { brand, model, processor, ram, storage, price, operatingSystem, graphicsCard, image } = req.body;

    // Validar campos vacíos
    if (!brand || !model || !processor || !ram || !storage || !price || !operatingSystem || !graphicsCard || !image) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validar duplicados
    const existingCPU = await CPU.findOne({ brand, model });
    if (existingCPU) {
      return res.status(400).json({ error: 'Ya existe una CPU con la misma marca y modelo' });
    }

    const newCPU = new CPU(req.body);
    await newCPU.save();
    res.status(201).json({ message: 'CPU agregada correctamente', newCPU });
  } catch (error) {
    res.status(400).json({ error: 'Error al agregar la CPU' });
  }
};

// Actualizar una CPU existente por ID
exports.updateCPU = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, model, processor, ram, storage, price, operatingSystem, graphicsCard, image } = req.body;

    // Validar campos vacíos
    if (!brand || !model || !processor || !ram || !storage || !price || !operatingSystem || !graphicsCard || !image) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const updatedCPU = await CPU.findByIdAndUpdate(id, req.body, {
      new: true,
    });

    if (!updatedCPU) {
      return res.status(404).json({ error: 'La CPU no existe' });
    }

    res.json({ message: 'CPU actualizada correctamente', updatedCPU });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar la CPU' });
  }
};

// Eliminar una CPU existente por ID
exports.deleteCPU = async (req, res) => {
  try {
    const { id } = req.params;
    await CPU.findByIdAndDelete(id);
    res.json({ message: 'CPU eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar la CPU' });
  }
};
