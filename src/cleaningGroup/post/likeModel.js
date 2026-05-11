
module.exports = (sequelize, DataTypes) => {
    const CleaningPostLike = sequelize.define('CleaningPostLike', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        postId: {
            type: DataTypes.CHAR(36),
            allowNull: false
        },
        memberId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        sequelize,
        timestamps: true,
        freezeTableName: true,
    });

    return CleaningPostLike;
};
