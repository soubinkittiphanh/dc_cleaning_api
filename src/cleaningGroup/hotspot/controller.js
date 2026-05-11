const service = require('./service');
const logger = require('../../api/logger');

const reportHotspot = async (req, res) => {
    try {
        const hotspot = await service.createHotspot(req.body);
        res.status(201).json(hotspot);
    } catch (error) {
        logger.error(`Error reporting hotspot: ${error}`);
        res.status(500).json({ message: error.message });
    }
};

const getAllHotspots = async (req, res) => {
    try {
        const hotspots = await service.getHotspots();
        res.status(200).json(hotspots);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    reportHotspot,
    getAllHotspots
};
