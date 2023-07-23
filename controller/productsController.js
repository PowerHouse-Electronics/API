const CellPhone = require('../models/celularModel');
const Computer = require('../models/computerModel');
const GConsole = require('../models/gConsoleModel');

// get all products
const getAllProducts = async (req, res) => {
    try {
        const cellphones = await CellPhone.find();
        const computers = await Computer.find();
        const gconsoles = await GConsole.find();
        res.status(200).json({ cellphones, computers, gconsoles });
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};


module.exports =  { getAllProducts };