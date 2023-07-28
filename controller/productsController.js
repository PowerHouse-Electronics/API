const CellPhone = require('../models/celularModel');
const Computer = require('../models/computerModel');
const GConsole = require('../models/gConsoleModel');

const getAllProducts = async (req, res) => {
    try {
        const cellphones = await CellPhone.find();
        const computers = await Computer.find();
        const gconsoles = await GConsole.find();
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


const getProductsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        let products = [];
        switch (category) {
            case 'cellphones':
                products = await CellPhone.find();
                break;
            case 'computers':
                products = await Computer.find();
                break;
            case 'consoles':
                products = await GConsole.find();
                break;
            default:
                return res.status(400).json({ message: 'Categoría no válida' });
        }
        products.forEach(product => {
            const imageBaseUrl = req.protocol + '://' + req.get('host');
            const imageUrl = imageBaseUrl + '/' + product.image;
            product.image = imageUrl;
        });
        return res.status(200).json({ products });
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener los productos' });
    }
};

const searchItems = async (req, res) => {
    try {
        const { brand, minPrice, maxPrice } = req.body;
        const cellphones = await CellPhone.find();
        const computers = await Computer.find();
        const gconsoles = await GConsole.find();

        cellphones.forEach(cellphone => {
            cellphone.brand = cellphone.brand + ' ' + cellphone.model + ' ' + cellphone.storage + '' + cellphone.color + '' + cellphone.screenResolution + '' + cellphone.cameraResolution;
        });
        computers.forEach(computer => {
            computer.brand = computer.brand + ' ' + computer.model + ' ' + computer.storage + '' + computer.color + '' + computer.processor;
        });
        gconsoles.forEach(gconsole => {
            gconsole.brand = gconsole.brand + ' ' + gconsole.model + ' ' + gconsole.storage + '' + gconsole.color + '' + gconsole.features;
        });

        let products = [...cellphones, ...computers, ...gconsoles];
        console.log(products);

        if (brand) {
            products = products.filter(product => {
                const productBrand = product.brand.toLowerCase();
                const brandWords = brand.toLowerCase().split(' ');
                product.brand = product.brand.split(' ')[0];
                return brandWords.every(word => productBrand.includes(word));
            });
        }
        if (minPrice) {
            products = products.filter(product => product.price >= minPrice);
        }
        if (maxPrice) {
            products = products.filter(product => product.price <= maxPrice);
        }

        
        products.forEach(product => {
            const imageBaseUrl = req.protocol + '://' + req.get('host');
            const imageUrl = imageBaseUrl + '/' + product.image;
            product.image = imageUrl;
        });
        if (products.length === 0) {
            return res.status(404).json({ message: 'No se encontraron productos' });
        }
        return res.status(200).json({ products });
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener los productos' });
    }
};


module.exports = { getAllProducts, getProductsByCategory, searchItems };