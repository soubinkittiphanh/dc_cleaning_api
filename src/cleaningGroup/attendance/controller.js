const service = require('./service');

const attendanceController = {
    async registerForEvent(req, res) {
        try {
            const { userId, memberId, eventId, notes } = req.body;
            const attendance = await service.registerForEvent({ userId, memberId, eventId, notes });
            return res.status(201).json(attendance);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    },

    async verifyCheckIn(req, res) {
        try {
            const { userId, memberId, eventId, lat, lng } = req.body;
            const attendance = await service.verifyCheckIn({ userId, memberId, eventId, lat, lng });
            return res.status(200).json(attendance);
        } catch (error) {
            return res.status(400).json({ message: error.message });
        }
    }
};

module.exports = attendanceController;
