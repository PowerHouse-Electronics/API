const LOGS = require('../models/logsModel');


const getAllLogs = async (req, res) => {
    try {
        const logs = await LOGS.find();
        return res.status(200).json({ logs });
    } catch (error) {
        return res.status(500).json({ error: 'Error al obtener los logs' });
    }
}

const addLog = async (req, res) => {
    const { log } = req.body;
    const newLog = new LOGS({ log });
    try {
        await newLog.save();
        return res.status(200).json({ message: 'Log agregado correctamente' });
    } catch (error) {
        return res.status(500).json({ error: 'Error al agregar el log' });
    }
}

const deleteLog = async (req, res) => {
    const { id } = req.params;
    try {
        await LOGS.deleteOne({ _id: id });
        return res.status(200).json({ message: 'Log eliminado correctamente' });
    } catch (error) {
        return res.status(500).json({ error: 'Error al eliminar el log' });
    }
}

module.exports = { getAllLogs, addLog, deleteLog };