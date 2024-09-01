require('module-alias/register');
const express = require('express');
const LoginStatus = require('@/Authenticate');
const GetRooms = require('@/GetRooms');
const CheckRooms = require('@/CheckRooms');
const MessageRooms = require('@/MessageRooms');
const { fromUnixTime, format } = require('date-fns');
const app = express();

async function App() {
    while (true) {
        let interval = 0;

        await LoginStatus();
        const Rooms = await GetRooms();
        const NewRooms = await CheckRooms(Rooms);
        await MessageRooms(NewRooms);

        const EnvInterval = Number(process.env.INTERVAL);
        const offset = Math.floor(Math.random() * EnvInterval) - (EnvInterval / 2);
        interval = EnvInterval + offset;
        const UnixTime = Math.floor(Date.now() / 1000 + interval * 60);
        const NextRun = format(fromUnixTime(UnixTime), 'HH:mm:ss');
        console.log(`Next fetch at ${NextRun}`);

        await new Promise(resolve => setTimeout(resolve, interval * 60 * 1000));
    }
}

App();