module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('user', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        cus_id: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        cus_pass: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cus_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        cus_tel: {
            type: DataTypes.STRING,
        },
        cus_email: {
            type: DataTypes.STRING,
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
        },
    }, {
        sequelize,
        timestamps: true,
        createdAt: true,
        updatedAt: 'updateTimestamp',
        freezeTableName: true,
    });

    return User;
};
