const CellPhone = require('../models/celularModel');
const Computer = require('../models/computerModel');
const GConsole = require('../models/gConsoleModel');

// get all products
const getAllProducts = async (req, res) => {
    try {
        const cellphones = await CellPhone.find();
        const computers = await Computer.find();
        const gconsoles = await GConsole.find();
        // anade el campo image_url a cada producto
        cellphones.forEach(cellphone => {  
            const imageBaseUrl = req.protocol + '://' + req.get('host');
            const imageUrl = imageBaseUrl + '/' + cellphone.image;
            cellphone.image = imageUrl;
        });
        computers.forEach(computer => {
            const imageBaseUrl = req.protocol + '://' + req.get('host');
            const imageUrl = imageBaseUrl + '/' + computer.image;
            computer.image = imageUrl;
        });
        gconsoles.forEach(gconsole => {
            const imageBaseUrl = req.protocol + '://' + req.get('host');
            const imageUrl = imageBaseUrl + '/' + gconsole.image;
            gconsole.image = imageUrl;
        });
    return res.status(200).json({ cellphones, computers, gconsoles });    
    } catch (error) {
return res.status(500).json({ error: 'Error al obtener los productos' });
    }
};




module.exports =  { getAllProducts };