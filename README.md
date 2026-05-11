# Cleaning Group API

Standalone API for the Cleaning Group module.

## Getting Started

1. Install dependencies:
   ```bash
   npm install express cors sequelize mariadb jsonwebtoken dotenv nodemon
   ```

2. Configure Database:
   The database configuration is in `src/config/dbClient.js`. It currently uses the same database as the main project.

3. Run the server:
   ```bash
   npm run dev
   ```

## Endpoints

- `GET /api/cleaning/event/upcoming`
- `GET /api/cleaning/event/impact-stats`
- `GET /api/cleaning/analytics/city-wide-impact`
- `GET /api/cleaning/analytics/waste-hotspots`
- `GET /api/cleaning/analytics/user-milestones` (Optional Auth)
- `POST /api/cleaning/attendance/register` (Protected)
- `POST /api/cleaning/attendance/verify-checkin` (Protected)
