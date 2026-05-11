const service = require('./service');

const locationController = {
    async getAllLocations(req, res) {
        try {
            const locations = await service.getAllLocations();
            return res.status(200).json(locations);
        } catch (error) {
            return res.status(500).json({ message: error.message });
        }
    },

    async createLocation(req, res) {
        try {
            const location = await service.createLocation(req.body);
            return res.status(201).json(location);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async updateLocation(req, res) {
        try {
            await service.updateLocation(req.params.id, req.body);
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async deleteLocation(req, res) {
        try {
            await service.deleteLocation(req.params.id);
            return res.status(200).json({ success: true });
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
};

module.exports = locationController;
