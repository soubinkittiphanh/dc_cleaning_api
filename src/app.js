const express = require("express");
const cors = require("cors");
const cleaningEvent = require("./cleaningGroup/event").router;
const cleaningAttendance = require("./cleaningGroup/attendance").router;
const cleaningAnalytics = require("./cleaningGroup/analytics/router");
const cleaningLocation = require("./cleaningGroup/location").router;
const memberRouter = require("./cleaningGroup/member").router;
const hotspotRouter = require("./cleaningGroup/hotspot/router");
const postRouter = require("./cleaningGroup/post/router");

const buildApp = async () => {
    const app = express();
    app.use(cors());
    app.use(express.json());

    // Logging middleware
    app.use((req, res, next) => {
        console.log(`[CLEANING API] ${req.method} ${req.url}`);
        next();
    });

    app.get("/health", (req, res) => {
        res.send("Cleaning API is healthy");
    });

    // Mount cleaning routes
    app.use('/api/cleaning/event', cleaningEvent);
    app.use('/api/cleaning/attendance', cleaningAttendance);
    app.use('/api/cleaning/analytics', cleaningAnalytics);
    app.use('/api/cleaning/location', cleaningLocation);
    app.use('/api/cleaning/hotspot', hotspotRouter);
    app.use('/api/member', memberRouter);
    app.use('/api/cleaning/post', postRouter);
    app.use('/api/upload', require('./api/uploadRouter'));
    app.use('/uploads', express.static('uploads'));

    return app;
}

module.exports = buildApp;
