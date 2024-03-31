const express = require('express');
const http = require('http');
const https = require('https');
const fs = require('fs');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 4115;

// Configuration variable to control HTTP or HTTPS
const useHTTPS = false; // Change to true to use HTTPS instead of HTTPS

// Load SSL/TLS certificates
const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

// Endpoint to fetch live data for all parameters
app.get('/api/live-data', (req, res) => {
    const roomNo = req.query.room;
    const query = 'SELECT temperature, humidity, gas, oxygen FROM all_room_data WHERE room_no = ?';

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        connection.query(query, [roomNo], (error, results, fields) => {
            connection.release();
            if (error) {
                console.error('Error fetching room data:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Room not found' });
            }

            const roomData = results[0];
            res.json(roomData);
        });
    });
});

// Endpoint to fetch specific data type for a room
app.get('/api/all-data', (req, res) => {
    const roomNo = req.query.room;
    const dataType = req.query.type;

    if (!dataType || !['temperature', 'humidity', 'gas', 'oxygen'].includes(dataType)) {
        return res.status(400).json({ error: 'Invalid or missing data type' });
    }

    const query = `SELECT id, ${dataType}, DATE_FORMAT(timestamp, '%Y-%m-%d %H:%i:%s') AS timestamp FROM ${roomNo}`;

    pool.getConnection((err, connection) => {
        if (err) {
            console.error('Error getting MySQL connection:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }

        connection.query(query, (error, results, fields) => {
            connection.release();
            if (error) {
                console.error('Error fetching room data:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (results.length === 0) {
                return res.status(404).json({ error: 'Room not found' });
            }

            res.json(results);
        });
    });
});

// Create HTTP or HTTPS server based on configuration
const server = useHTTPS ? https.createServer(options, app) : http.createServer(app);

server.listen(PORT, () => {
    console.log(`API server listening on port ${PORT}`);
});
