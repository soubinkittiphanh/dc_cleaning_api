const db = require('../../models/index.js');
const logger = require('../../api/logger');

const createEvent = async (eventData) => {
    try {
        const { photos, hotspotId, ...rest } = eventData;
        if (!rest.id) delete rest.id;
        const event = await db.CleaningEvent.create(rest);
        
        // If this event was created from a hotspot, update the hotspot status
        if (hotspotId) {
            await db.Hotspot.update(
                { status: 'event_created' },
                { where: { id: hotspotId } }
            );
            logger.info(`Hotspot ${hotspotId} marked as event_created`);
        }

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
            where: { status: 'completed' }
        });

        const totalBags = await db.CleaningEvent.sum('totalBags', {
            where: { status: 'completed' }
        }) || 0;

        const totalTrashWeight = await db.CleaningEvent.sum('totalKilos', {
            where: { status: 'completed' }
        }) || 0;

        logger.info(`[STATS] Volunteers: ${totalVolunteers}, Events: ${totalCompletedEvents}, Bags: ${totalBags}, Weight: ${totalTrashWeight}`);

        return {
            totalVolunteers,
            totalCompletedEvents,
            totalBags: parseInt(totalBags),
            totalTrashWeight: parseFloat(totalTrashWeight).toFixed(2)
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
        const attendances = await db.Attendance.findAll({
            where: { 
                CleaningEventId: id,
                isVerified: true 
            }
        });

        const verifiedCount = attendances.length;

        // Finalize duration for each verified volunteer
        const now = new Date();
        for (const attendance of attendances) {
            if (attendance.checkInTime) {
                const checkInTime = new Date(attendance.checkInTime);
                // Calculate duration in minutes (from check-in until now/close time)
                const durationMinutes = Math.floor((now - checkInTime) / (1000 * 60));
                
                // Only update if it's longer than existing (to avoid overwriting if they already checked out)
                if (durationMinutes > attendance.participationDuration) {
                    await attendance.update({ participationDuration: durationMinutes });
                }
            }
        }

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
