const os = require("os");
const logger = require("./api/logger.js");
const buildApp = require("./app.js");
const config = require("./config");

const startApp = async () => {
    const app = await buildApp();
    const port = config.port || 4001; // Use a different port than the main API

    const server = app.listen(port, '0.0.0.0', () => {
        const networkInterfaces = os.networkInterfaces();
        const ip = Object.values(networkInterfaces)
            .flat()
            .find(iface => iface.family === 'IPv4' && !iface.internal)?.address || 'localhost';

        logger.info(`Cleaning API is up on http://${ip}:${port}`);
        logger.info(`Local access: http://localhost:${port}`);
    });

    server.setTimeout(0);
}

startApp();
