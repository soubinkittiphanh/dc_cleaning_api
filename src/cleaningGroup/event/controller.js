const service = require('./service');

const eventController = {
    async createEvent(req, res) {
        try {
            const event = await service.createEvent(req.body);
            return res.status(201).json(event);
        } catch (error) {
            console.error('[ERROR] createEvent:', error);
            if (error.name === 'SequelizeValidationError') {
                return res.status(400).json({ 
                    message: 'Validation error', 
                    errors: error.errors.map(e => ({ field: e.path, message: e.message })) 
                });
            }
            return res.status(400).json({ message: error.message });
        }
    },

    async getImpactStats(req, res) {
        try {
            const stats = await service.getImpactStats();
            return res.status(200).json(stats);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async getUpcomingEvents(req, res) {
        console.log(`[DEBUG] Reached getUpcomingEvents controller`);
        try {
            const { userId, memberId } = req.query;
            const events = await service.getUpcomingEvents(userId, memberId);
            return res.status(200).json(events);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },
    
    async getEventPhotos(req, res) {
        try {
            const photos = await service.getEventPhotos(req.params.id);
            return res.status(200).json(photos);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async updateEvent(req, res) {
        try {
            const result = await service.updateEvent(req.params.id, req.body);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async deleteEvent(req, res) {
        try {
            const result = await service.deleteEvent(req.params.id);
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async closeEvent(req, res) {
        try {
            const { id } = req.params;
            const { totalBags, totalKilos } = req.body;
            const result = await service.closeEvent(id, { totalBags, totalKilos });
            return res.status(200).json(result);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
};

module.exports = eventController;
