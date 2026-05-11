const logger = require("../../api/logger");

module.exports = (sequelize, DataTypes) => {
    const Member = sequelize.define('member', {
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            comment: 'Member name'
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            unique: true,
            comment: 'Member email (required for social login)'
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'Member password (nullable for social users)'
        },
        socialProvider: {
            type: DataTypes.STRING(20),
            allowNull: true,
            comment: 'e.g., google, facebook'
        },
        socialId: {
            type: DataTypes.STRING(255),
            allowNull: true,
            comment: 'ID from social provider'
        },
        profilePhoto: {
            type: DataTypes.TEXT,
            allowNull: true,
            comment: 'Profile photo URL'
        },
        member_class: {
            type: DataTypes.ENUM('silver', 'gold', 'platinum', 'diamond'),
            allowNull: true,
            comment: 'Member class: silver, gold, platinum, diamond'
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            allowNull: false,
            defaultValue: 'user',
            comment: 'Member role: user, admin'
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            allowNull: false,
            defaultValue: 'pending',
            comment: 'Approval status from admin'
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true,
            comment: 'Indicates if this member is active'
        },
        inputter: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'User who created this record'
        },
        update_user: {
            type: DataTypes.INTEGER,
            allowNull: true,
            comment: 'User who last updated this record'
        }
    }, {
        sequelize,
        timestamps: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        freezeTableName: true,

        // Add indexes for better performance
        indexes: [
            {
                name: 'idx_member_active',
                fields: ['isActive']
            },
            {
                name: 'idx_member_name',
                fields: ['name']
            }
        ],

        // Add scopes for common queries
        scopes: {
            active: {
                where: {
                    isActive: true
                },
                order: [['name', 'ASC']]
            }
        }
    });

    Member.associate = models => {
        logger.info('Associating table Member with models');

        // Add associations here if needed
    };

    return Member;
};
