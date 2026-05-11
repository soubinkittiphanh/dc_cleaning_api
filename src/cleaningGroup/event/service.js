const db = require('../../models/index.js');
const logger = require('../../api/logger');

const createEvent = async (eventData) => {
    try {
        const { photos, ...rest } = eventData;
        if (!rest.id) delete rest.id;
        const event = await db.CleaningEvent.create(rest);
        
        if (photos && Array.isArray(photos)) {
            const photoRecords = photos.map(url => ({
                CleaningEventId: event.id,
                photoUrl: url
            }));
            await db.CleaningEventPhoto.bulkCreate(photoRecords);
        }

        logger.info(`Cleaning event created: ${event.id}`);
        return event;
    } catch (error) {
        logger.error(`Error creating cleaning event: ${error}`);
        throw error;
    }
};

const getImpactStats = async () => {
    try {
        const totalVolunteers = await db.Attendance.count({
            distinct: true,
            col: 'userId'
        });

        const totalCompletedEvents = await db.CleaningEvent.count({
            where: {
                status: 'completed'
            }
        });

        return {
            totalVolunteers,
            totalCompletedEvents
        };
    } catch (error) {
        logger.error(`Error fetching impact stats: ${error}`);
        throw error;
    }
};

const getUpcomingEvents = async (userId, memberId) => {
    try {
        const events = await db.CleaningEvent.findAll({
            where: {
                status: {
                    [db.Sequelize.Op.in]: ['upcoming', 'ongoing']
                }
            },
            attributes: {
                exclude: ['currentVolunteerCount'],
                include: [
                    [
                        db.sequelize.literal(`(
                            SELECT COUNT(*)
                            FROM Attendance AS attendance
                            WHERE
                                attendance.CleaningEventId = CleaningEvent.id
                        )`),
                        'currentVolunteerCount'
                    ]
                ]
            },
            order: [['startTime', 'ASC']]
        });

        if (userId || memberId) {
            const attendances = await db.Attendance.findAll({
                where: {
                    [db.Sequelize.Op.or]: [
                        userId ? { userId } : null,
                        memberId ? { memberId } : null
                    ].filter(Boolean)
                }
            });
            const joinedEventIds = attendances.map(a => a.CleaningEventId);
            return events.map(e => {
                const event = e.toJSON();
                event.isJoined = joinedEventIds.includes(e.id);
                return event;
            });
        }

        return events;
    } catch (error) {
        logger.error(`Error fetching upcoming events: ${error}`);
        throw error;
    }
};

const getEventPhotos = async (eventId) => {
    try {
        const photos = await db.CleaningEventPhoto.findAll({
            where: { CleaningEventId: eventId }
        });
        return photos;
    } catch (error) {
        logger.error(`Error fetching event photos: ${error}`);
        throw error;
    }
};

const updateEvent = async (id, eventData) => {
    try {
        const { photos, id: bodyId, updateTimestamp, ...rest } = eventData;
        await db.CleaningEvent.update(rest, { where: { id } });
        
        if (photos && Array.isArray(photos)) {
            // Simple approach: delete old and insert new, or just skip if complex
        }

        logger.info(`Cleaning event updated: ${id}`);
        return { success: true };
    } catch (error) {
        logger.error(`Error updating cleaning event: ${error}`);
        throw error;
    }
};

const deleteEvent = async (id) => {
    try {
        await db.CleaningEvent.destroy({ where: { id } });
        logger.info(`Cleaning event deleted: ${id}`);
        return { success: true };
    } catch (error) {
        logger.error(`Error deleting cleaning event: ${error}`);
        throw error;
    }
};

const closeEvent = async (id, impactData) => {
    try {
        const { totalBags, totalKilos } = impactData;
        
        // Count verified volunteers for this event
        const verifiedCount = await db.Attendance.count({
            where: { 
                CleaningEventId: id,
                status: 'verified' // Only count those who were actually scanned
            }
        });

        const result = await db.CleaningEvent.update({
            status: 'completed',
            totalBags: totalBags || 0,
            totalKilos: totalKilos || 0,
            volunteerCount: verifiedCount // Final count
        }, { where: { id } });

        logger.info(`Cleaning event closed: ${id}. Volunteers: ${verifiedCount}, Bags: ${totalBags}`);
        return { success: true, verifiedCount };
    } catch (error) {
        logger.error(`Error closing cleaning event: ${error}`);
        throw error;
    }
};

module.exports = {
    createEvent,
    getImpactStats,
    getUpcomingEvents,
    getEventPhotos,
    updateEvent,
    deleteEvent,
    closeEvent
};
