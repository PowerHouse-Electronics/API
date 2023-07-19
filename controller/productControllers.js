const cellPhone = require('../models/celularModel');
const path = require('path');

const getAllCellPhones = async (req, res) => {
    try {
      const cellPhones = await CellPhone.find();
      res.json(cellPhones);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };
  const createCellPhones = async (req, res) => {
    try {
      const newCellPhone = new CellPhone(req.body);
      const savedCellPhone = await newCellPhone.save();
      res.status(201).json(savedCellPhone);
      console.log('Celular creado exitosamente');
    } catch (error) {
      res.status(400).json({ error: error.message });
      console.error('Error al crear el celular:', error.message);
    }
  };
  


module.exports = {
    getAllCellPhones,
    createCellPhones
}

