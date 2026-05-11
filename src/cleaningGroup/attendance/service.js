const db = require('../../models/index.js');
const logger = require('../../api/logger');

const registerForEvent = async ({ userId, memberId, eventId, notes = '' }) => {
    try {
        const finalUserId = (userId && userId !== 0) ? userId : null;
        const finalMemberId = (memberId && memberId !== 0) ? memberId : null;

        if (!finalUserId && !finalMemberId) {
            throw new Error('Registration failed: You must be a registered member to join events.');
        }

        // Check if already registered
        const existingAttendance = await db.Attendance.findOne({
            where: {
                CleaningEventId: eventId,
                [db.Sequelize.Op.or]: [
                    finalUserId ? { userId: finalUserId } : null,
                    finalMemberId ? { memberId: finalMemberId } : null
                ].filter(Boolean)
            }
        });

        if (existingAttendance) {
            throw new Error('You have already registered for this event.');
        }

        logger.info(`Registering: userId=${finalUserId}, memberId=${finalMemberId}, eventId=${eventId}`);

        // Check if member is approved
        if (finalMemberId) {
            const member = await db.Member.findByPk(finalMemberId);
            if (!member) {
                throw new Error('Member not found');
            }
            if (member.status !== 'approved') {
                throw new Error(`Registration failed. Your account status is currently: ${member.status}. Please wait for admin approval.`);
            }
        }

        const attendance = await db.Attendance.create({
            userId: finalUserId,
            memberId: finalMemberId,
            CleaningEventId: eventId,
            isVerified: false,
            notes
        });
        logger.info(`User/Member registered for event ${eventId}`);
        return attendance;
    } catch (error) {
        logger.error(`Error registering for event: ${error}`);
        throw error;
    }
};

// Helper function for Haversine distance
const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δφ = (lat2 - lat1) * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
};

const verifyCheckIn = async ({ userId, memberId, eventId, lat, lng }) => {
    const transaction = await db.sequelize.transaction();
    try {
        // 1. Verify Event exists
        const event = await db.CleaningEvent.findByPk(eventId, { transaction });
        if (!event) {
            throw new Error('Cleaning Event not found');
        }

        // GPS Verification (Honest Check-in)
        if (event.latitude && event.longitude && lat && lng) {
            const distance = calculateDistance(lat, lng, parseFloat(event.latitude), parseFloat(event.longitude));
            const MAX_DISTANCE = 500; // Allow check-in within 500 meters

            if (distance > MAX_DISTANCE) {
                throw new Error(`You are too far from the event location (${Math.round(distance)}m). Please get closer to check in.`);
            }
        }

        // 2. Find and update attendance
        const finalUserId = (userId && userId !== 0) ? userId : null;
        const finalMemberId = (memberId && memberId !== 0) ? memberId : null;

        const whereClause = finalMemberId ? 
            { memberId: finalMemberId, CleaningEventId: eventId } : 
            { userId: finalUserId, CleaningEventId: eventId };

        const attendance = await db.Attendance.findOne({
            where: whereClause,
            transaction
        });

        if (!attendance) {
            throw new Error('Attendance record not found. Please register for the event first.');
        }

        if (attendance.isVerified) {
            // If already verified, calculate current duration (check-out or progress update)
            const checkInTime = new Date(attendance.checkInTime);
            const now = new Date();
            const durationMinutes = Math.floor((now - checkInTime) / (1000 * 60));
            
            await attendance.update({
                participationDuration: durationMinutes,
                checkInLatitude: lat || attendance.checkInLatitude,
                checkInLongitude: lng || attendance.checkInLongitude
            }, { transaction });
            
            await transaction.commit();
            return attendance;
        }

        await attendance.update({
            isVerified: true,
            checkInTime: new Date(),
            checkInLatitude: lat,
            checkInLongitude: lng
        }, { transaction });

        // 3. Increment currentVolunteerCount in Event
        await event.increment('currentVolunteerCount', { by: 1, transaction });

        await transaction.commit();
        logger.info(`Check-in verified. Total volunteers: ${event.currentVolunteerCount + 1}`);
        
        return attendance;
    } catch (error) {
        await transaction.rollback();
        logger.error(`Error verifying check-in: ${error}`);
        throw error;
    }
};

module.exports = {
    registerForEvent,
    verifyCheckIn
};
