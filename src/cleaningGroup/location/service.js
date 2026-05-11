const db = require('../../models/index.js');
const logger = require('../../api/logger');

const getAllLocations = async () => {
    return await db.Location.findAll({ where: { isActive: true } });
};

const createLocation = async (data) => {
    return await db.Location.create(data);
};

const updateLocation = async (id, data) => {
    const { id: bodyId, updateTimestamp, ...rest } = data;
    return await db.Location.update(rest, { where: { id } });
};

const deleteLocation = async (id) => {
    return await db.Location.destroy({ where: { id } });
};

module.exports = {
    getAllLocations,
    createLocation,
    updateLocation,
    deleteLocation
};
