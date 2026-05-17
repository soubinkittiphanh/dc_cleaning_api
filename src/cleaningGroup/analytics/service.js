const db = require('../../models/index.js');
const { Op } = require('sequelize');

const getCityWideImpact = async () => {
    try {
        // Count unique participants (distinct users and members across all verified attendances)
        const totalVolunteers = await db.Attendance.count({
            distinct: true,
            col: 'memberId', // This is a bit tricky since we have userId OR memberId
            where: { isVerified: true }
        });
        
        // Actually, let's just sum the participations for "Impact" as it represents total effort
        const totalParticipations = await db.CleaningEvent.sum('volunteerCount', {
            where: { status: 'completed' }
        }) || 0;

        const totalCompletedEvents = await db.CleaningEvent.count({
            where: { status: 'completed' }
        });

        const results = await db.CleaningEvent.findOne({
            attributes: [
                [db.sequelize.fn('SUM', db.sequelize.col('totalKilos')), 'totalTrashWeight'],
                [db.sequelize.fn('SUM', db.sequelize.col('totalBags')), 'totalBags'],
            ],
            where: {
                status: 'completed'
            }
        });

        // Sum participation hours from verified attendance
        const attendanceHours = await db.Attendance.sum('participationDuration', {
            where: { isVerified: true }
        });

        return {
            totalTrashWeight: parseFloat(results.getDataValue('totalTrashWeight') || 0).toFixed(2),
            totalBags: parseInt(results.getDataValue('totalBags') || 0),
            totalVolunteers: parseInt(totalParticipations),
            totalCompletedEvents,
            totalVolunteerHours: Math.round((attendanceHours || 0) / 60 * 10) / 10 // Convert minutes to hours
        };
    } catch (error) {
        throw new Error(`Error fetching city-wide impact: ${error.message}`);
    }
};

const getUserMilestones = async (userId) => {
    try {
        const count = await db.Attendance.count({
            where: {
                userId,
                isVerified: true
            }
        });

        const milestones = [
            { target: 5, achieved: count >= 5 },
            { target: 10, achieved: count >= 10 },
            { target: 20, achieved: count >= 20 }
        ];

        return {
            totalCleanups: count,
            milestones
        };
    } catch (error) {
        throw new Error(`Error fetching user milestones: ${error.message}`);
    }
};

const getWasteHotspots = async () => {
    try {
        const hotspots = await db.CleaningEvent.findAll({
            attributes: [
                'category',
                'locationName',
                [db.sequelize.fn('SUM', db.sequelize.col('estimatedTrashWeight')), 'totalWeight'],
                [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'eventCount']
            ],
            group: ['category', 'locationName'],
            order: [[db.sequelize.literal('totalWeight'), 'DESC']],
            limit: 10
        });

        return hotspots.map(h => ({
            category: h.category,
            location: h.locationName,
            totalWeight: parseFloat(h.getDataValue('totalWeight') || 0),
            eventCount: parseInt(h.getDataValue('eventCount') || 0)
        }));
    } catch (error) {
        throw new Error(`Error fetching waste hotspots: ${error.message}`);
    }
};

module.exports = {
    getCityWideImpact,
    getUserMilestones,
    getWasteHotspots
};
