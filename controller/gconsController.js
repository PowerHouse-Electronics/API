const GameConsole = require('../models/gConsoleModel');

// Visualizar todas las consolas de juegos
exports.getAllGameConsoles = async (req, res) => {
  try {
    const gameConsoles = await GameConsole.find();
    res.json(gameConsoles);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las consolas de juegos' });
  }
};

// Agregar una nueva consola de juego
exports.addGameConsole = async (req, res) => {
  try {
    const { brand, model, storage, price, features, color, image } = req.body;

    // Validar campos vacíos
    if (!brand || !model || !storage || !price || !features || !color || !image) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validar duplicados
    const existingGameConsole = await GameConsole.findOne({ brand, model });
    if (existingGameConsole) {
      return res.status(400).json({ error: 'Ya existe una consola de juego con la misma marca y modelo' });
    }

    const newGameConsole = new GameConsole(req.body);
    await newGameConsole.save();
    res.status(201).json({ message: 'Consola de juego agregada correctamente', newGameConsole });
  } catch (error) {
    res.status(400).json({ error: 'Error al agregar la consola de juego' });
  }
};

// Actualizar una consola de juego existente
exports.updateGameConsole = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand, model, storage, price, features, color, image } = req.body;

    // Validar campos vacíos
    if (!brand || !model || !storage || !price || !features || !color || !image) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    // Validar duplicados
    const existingGameConsole = await GameConsole.findOne({ brand, model });
    if (existingGameConsole && existingGameConsole._id.toString() !== id) {
      return res.status(400).json({ error: 'Ya existe una consola de juego con la misma marca y modelo' });
    }

    const updatedGameConsole = await GameConsole.findByIdAndUpdate(
      id,
      req.body,
      { new: true }
    );

    if (!updatedGameConsole) {
      return res.status(404).json({ error: 'La consola de juego no existe' });
    }

    res.json({ message: 'Consola de juego actualizada correctamente', updatedGameConsole });
  } catch (error) {
    res.status(400).json({ error: 'Error al actualizar la consola de juego' });
  }
};

// Eliminar una consola de juego existente por ID
exports.deleteGameConsole = async (req, res) => {
  try {
    const { id } = req.params;
    await GameConsole.findByIdAndDelete(id);
    res.json({ message: 'Consola de juego eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ error: 'Error al eliminar la consola de juego' });
  }
};
