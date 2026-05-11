const { Sequelize, DataTypes } = require('sequelize');
const logger = require('../api/logger');
const env = require('../config/env').db;

const sequelize = new Sequelize(env.database, env.user, env.password, {
    host: env.host,
    dialect: 'mariadb',
    port: env.port,
    pool: {
        max: 10,
        min: 2,
        acquire: 30000,
        idle: 10000
    },
    timezone: '+07:00',
    dialectOptions: {
        useUTC: false,
    },
});

const db = {};
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Models
db.user = require("./userModel")(sequelize, DataTypes);
db.Member = require("../cleaningGroup/member/model")(sequelize, DataTypes);
db.Location = require("../cleaningGroup/location/model")(sequelize, DataTypes);
db.CleaningEvent = require("../cleaningGroup/event/model")(sequelize, DataTypes);
db.CleaningEventPhoto = require("../cleaningGroup/event/photoModel")(sequelize, DataTypes);
db.Attendance = require("../cleaningGroup/attendance/model")(sequelize, DataTypes);
db.Hotspot = require("../cleaningGroup/hotspot/model")(sequelize, DataTypes);
db.CleaningPost = require("../cleaningGroup/post/model")(sequelize, DataTypes);
db.CleaningPostLike = require("../cleaningGroup/post/likeModel")(sequelize, DataTypes);
db.CleaningPostComment = require("../cleaningGroup/post/commentModel")(sequelize, DataTypes);

// Associations
db.user.belongsToMany(db.CleaningEvent, { through: db.Attendance, foreignKey: 'userId' });
db.CleaningEvent.belongsToMany(db.user, { through: db.Attendance, foreignKey: 'CleaningEventId' });

db.CleaningEvent.hasMany(db.Attendance, { foreignKey: 'CleaningEventId' });
db.CleaningEvent.hasMany(db.CleaningEventPhoto, { foreignKey: 'CleaningEventId', as: 'photos' });

db.Attendance.belongsTo(db.user, { foreignKey: 'userId' });
db.Attendance.belongsTo(db.CleaningEvent, { foreignKey: 'CleaningEventId' });

db.CleaningEventPhoto.belongsTo(db.CleaningEvent, { foreignKey: 'CleaningEventId', as: 'event' });

// Location Associations
db.Location.hasMany(db.CleaningEvent, { foreignKey: 'locationId', as: 'events' });
db.CleaningEvent.belongsTo(db.Location, { foreignKey: 'locationId', as: 'location' });

// Member Associations
db.Member.belongsToMany(db.CleaningEvent, { through: db.Attendance, foreignKey: 'memberId' });
db.CleaningEvent.belongsToMany(db.Member, { through: db.Attendance, foreignKey: 'CleaningEventId' });
db.Attendance.belongsTo(db.Member, { foreignKey: 'memberId' });
db.Member.hasMany(db.Attendance, { foreignKey: 'memberId' });

// Hotspot Associations
db.Location.hasMany(db.Hotspot, { foreignKey: 'locationId', as: 'hotspots' });
db.Hotspot.belongsTo(db.Location, { foreignKey: 'locationId', as: 'location' });
db.Member.hasMany(db.Hotspot, { foreignKey: 'reporterId', as: 'reports' });
db.Hotspot.belongsTo(db.Member, { foreignKey: 'reporterId', as: 'reporter' });

// Post Associations
db.Member.hasMany(db.CleaningPost, { foreignKey: 'authorId', as: 'posts' });
db.CleaningPost.belongsTo(db.Member, { foreignKey: 'authorId', as: 'author' });

// Post Interaction Associations
db.CleaningPost.hasMany(db.CleaningPostLike, { foreignKey: 'postId', as: 'likes' });
db.CleaningPostLike.belongsTo(db.CleaningPost, { foreignKey: 'postId' });
db.Member.hasMany(db.CleaningPostLike, { foreignKey: 'memberId', as: 'postLikes' });
db.CleaningPostLike.belongsTo(db.Member, { foreignKey: 'memberId', as: 'member' });

db.CleaningPost.hasMany(db.CleaningPostComment, { foreignKey: 'postId', as: 'comments' });
db.CleaningPostComment.belongsTo(db.CleaningPost, { foreignKey: 'postId' });
db.Member.hasMany(db.CleaningPostComment, { foreignKey: 'memberId', as: 'postComments' });
db.CleaningPostComment.belongsTo(db.Member, { foreignKey: 'memberId', as: 'member' });

// Sync database
sequelize.sync({ force: false, alter: true })
    .then(() => logger.info("Cleaning Database synchronized"))
    .catch(err => logger.error("Error syncing database:", err));

module.exports = db;
