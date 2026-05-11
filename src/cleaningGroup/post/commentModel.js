
module.exports = (sequelize, DataTypes) => {
    const CleaningPostComment = sequelize.define('CleaningPostComment', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
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

    return CleaningPostComment;
};
