
module.exports = (sequelize, DataTypes) => {
    const CleaningPost = sequelize.define('CleaningPost', {
        id: {
            type: DataTypes.CHAR(36),
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false
        },
        photoUrl: {
            type: DataTypes.STRING,
            allowNull: true
        },
        bagsCollected: {
            type: DataTypes.INTEGER,
            defaultValue: 0
        },
        location: {
            type: DataTypes.STRING,
            allowNull: true
        },
        authorId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            comment: 'Reference to Member model'
        }
    }, {
        sequelize,
        timestamps: true,
        createdAt: true,
        updatedAt: 'updateTimestamp',
        freezeTableName: true,
    });

    return CleaningPost;
};
