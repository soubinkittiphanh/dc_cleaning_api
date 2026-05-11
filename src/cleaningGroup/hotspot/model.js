
module.exports = (sequelize, DataTypes) => {
    const Hotspot = sequelize.define('Hotspot', {
        id: {
            type: DataTypes.CHAR(36),
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false
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
            allowNull: true
        },
        longitude: {
            type: DataTypes.DECIMAL(11, 8),
            allowNull: true
        },
        photoUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        status: {
            type: DataTypes.ENUM('reported', 'investigating', 'resolved', 'event_created'),
            defaultValue: 'reported',
            allowNull: false
        },
        reporterId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'Reference to Member model'
        }
    }, {
        sequelize,
        timestamps: true,
        createdAt: true,
        updatedAt: 'updateTimestamp',
        freezeTableName: true,
    });

    return Hotspot;
};
