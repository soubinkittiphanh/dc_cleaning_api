const logger = require("../../api/logger");

module.exports = (sequelize, DataTypes) => {
    const Location = sequelize.define('Location', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            comment: 'City or area name (e.g., Pakse, Vientiane, Luangprabang)'
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    }, {
        sequelize,
        timestamps: true,
        createdAt: true,
        updatedAt: 'updateTimestamp',
        freezeTableName: true,
    });

    Location.associate = models => {
        logger.info('Associating table Location with models');
        if (models.CleaningEvent) {
            Location.hasMany(models.CleaningEvent, {
                foreignKey: 'locationId',
                as: 'events'
            });
        }
    };

    return Location;
};
