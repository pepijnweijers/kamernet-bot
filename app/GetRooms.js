const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

async function GetRooms() {
    try {
        const filePath = path.join(__dirname, '../searchQuere.json');
        const jsonData = await fs.readFile(filePath, 'utf-8');
        const requestBody = JSON.parse(jsonData);

        const response = await axios.post('https://kamernet.nl/services/api/listing/findlistings', requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('Error fetching rooms:', error);
        return undefined; 
    }
}

module.exports = GetRooms;
