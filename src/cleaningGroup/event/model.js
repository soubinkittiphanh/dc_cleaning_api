
module.exports = (sequelize, DataTypes) => {
    const CleaningEvent = sequelize.define('CleaningEvent', {
        id: {
            type: DataTypes.CHAR(36),
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        locationName: {
            type: DataTypes.STRING,
            allowNull: false
        },
        locationId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Reference to Location model (City)'
        },
        latitude: {
            type: DataTypes.DECIMAL(10, 8),
            allowNull: true,
            comment: 'Latitude for GPS check-in'
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true,
            comment: 'Longitude for GPS check-in'
        },
        coordinates: {
            type: DataTypes.GEOMETRY('POINT'),
            allowNull: true
        },
        startTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        endTime: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('upcoming', 'ongoing', 'completed'),
            defaultValue: 'upcoming',
            allowNull: false
        },
        beforePhotoUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        afterPhotoUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        estimatedTrashWeight: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
            allowNull: false
        },
        volunteerCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        currentVolunteerCount: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false
        },
        totalBags: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
            comment: 'Total bags of trash collected'
        },
        totalKilos: {
            type: DataTypes.DECIMAL(10, 2),
            defaultValue: 0.00,
            allowNull: false,
            comment: 'Total weight of trash collected in kilograms'
        },
        category: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        sequelize,
        timestamps: true,
        createdAt: true,
        updatedAt: 'updateTimestamp',
        freezeTableName: true,
    });

    return CleaningEvent;
};
