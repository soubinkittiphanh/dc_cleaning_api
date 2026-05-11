
module.exports = (sequelize, DataTypes) => {
    const CleaningEventPhoto = sequelize.define('CleaningEventPhoto', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        CleaningEventId: {
            type: DataTypes.CHAR(36),
            allowNull: false,
            collate: 'utf8mb4_bin'
        },
        photoUrl: {
            type: DataTypes.STRING,
            allowNull: false
        },
        caption: {
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

    return CleaningEventPhoto;
};
