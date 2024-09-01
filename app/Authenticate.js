const Cache = require('@/Cache');
const dotenv = require('dotenv');
const axios = require('axios');
const puppeteer = require('puppeteer');

dotenv.config();

async function launchBrowser() {
    return await puppeteer.launch({
        headless: process.env.DEV_MODE !== 'true',
        ignoreHTTPSErrors: true,
    });
}

async function getCookiesFromBrowser(page) {
    const cookies = await page.cookies();
    return cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ');
}

async function authenticate() {
    const browser = await launchBrowser();
    const page = await browser.newPage();
    console.log('Logging in again...');
    
    await page.goto('https://kamernet.nl/oauth/signin', { waitUntil: 'networkidle2' });
    await page.type('#email', process.env.EMAIL);
    await page.type('#password', process.env.PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    const cookiesString = await getCookiesFromBrowser(page);
    await browser.close();
    Cache.set('Cookies', cookiesString);
}

async function checkLoginStatus() {
    const response = await axios.get('https://kamernet.nl', {
        headers: {
            'Cookie': Cache.get('Cookies')
        }
    });
    
    return !response.data.includes(`color="secondary">Inloggen</button>`);
}

async function loginStatus() {
    if (await checkLoginStatus()) {
        return true;
    } else {
        await authenticate();
        return await loginStatus();
    }
}

module.exports = loginStatus;
