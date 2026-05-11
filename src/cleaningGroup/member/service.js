const logger = require("../../api/logger");
const Member = require("../../models").Member;
const { Op } = require('sequelize');

// You can add member specific services or business logic here
// Example service function
const getMemberCount = async () => {
    try {
        const count = await Member.count({
            where: { isActive: true }
        });
        return count;
    } catch (error) {
        logger.error('Error getting member count:', error);
        throw error;
    }
};

module.exports = {
    getMemberCount
};
