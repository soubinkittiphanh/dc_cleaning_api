const db = require('../../models/index.js');

const createHotspot = async (data) => {
    return await db.Hotspot.create(data);
};

const getHotspots = async (where = {}) => {
    return await db.Hotspot.findAll({
        where,
        include: [
            { model: db.Location, as: 'location', attributes: ['name'] },
            { model: db.Member, as: 'reporter', attributes: ['name'] }
        ],
        order: [['createdAt', 'DESC']]
    });
};

const updateHotspotStatus = async (id, status) => {
    return await db.Hotspot.update({ status }, { where: { id } });
};

module.exports = {
    createHotspot,
    getHotspots,
    updateHotspotStatus
};
