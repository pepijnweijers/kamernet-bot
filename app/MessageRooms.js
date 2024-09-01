const Cache = require('@/Cache');
const dotenv = require('dotenv');
const puppeteer = require('puppeteer');

dotenv.config();

const delay = (time) => new Promise(resolve => setTimeout(resolve, time));

async function launchBrowser() {
    return await puppeteer.launch({
        headless: false,
        ignoreHTTPSErrors: true,
    });
}

function Message(room){

    /*
        TIP: Zet voordat je het script in productie gebruikt de DEV-modus aan in de .env-bestand.
        Hierdoor worden alle stappen uitgevoerd, behalve het daadwerkelijk verzenden van de berichten.
        Zodat je kan testen of je berichten goed worden uitgewerkt.

        Waardes:
        room.id = De ID van de kamer
        room.type = Woonruimte type (studio, appartement, studio, anti-kraak)
        houseMates = Aantal huisgenoten of 0
        street = In welke straat
        startDate = Welke datum het start
        landLord = Naam van de verhuurder
        landLordRole = Soort verhuurder (Huisgenoot, Particuliere verhuurder, Makelaar)
    */

    return `Berichtje voor, ${room.landLord} met de role ${room.landLordRole} met betrekking tot een ${room.type} aan de ${room.street}, met ${room.houseMates}`;
}

async function MessageRooms(rooms){
    console.log(rooms);

    if (rooms && rooms.length > 0) {
        const browser = await launchBrowser();

        try {
            for (const room of rooms) {
                const page = await browser.newPage();
                const cookieString = Cache.get('Cookies');
                const cookies = cookieString.split(';').map(cookie => {
                    const [name, value] = cookie.split('=');
                    return { name: name.trim(), value: value.trim(), domain: '.kamernet.nl' };
                });
        
                for (const cookie of cookies) {
                    await page.setCookie(cookie);
                }

                await page.goto(`https://kamernet.nl/start-gesprek/${room.id}`);
                await page.type('#Message', Message(room));
                await page.click('#Status');
                await page.click('#Status ul li:nth-of-type(3)');

                let month = room.startDate.slice(3, 5);
                if (month.startsWith('0')) {
                    month = month.slice(1);
                }

                await page.click('#ExpectedMoveInDate');
                await page.select('select[aria-controls="ExpectedMoveInDate_table"]', (month - 1).toString());
                await delay(500);
                await page.click(`div[aria-label="${room.startDate}"]`);

                await page.waitForSelector('button[onclick="submitBarrierQuestionsForm(this)"]');

                if(process.env.DEV_MODE !== 'true'){
                    await delay(1000);
                    await page.click('button[onclick="submitBarrierQuestionsForm(this)"]');
                    console.log('Click 1');
                    await page.waitForNavigation();
                    await page.close();
        
                    console.log(`🔥 Bericht gestuurd naar ${room.landLord}!`);
                } else {
                    console.log(`⏱️ Bericht kan naar ${room.landLord}!`);
                }
            }
        } catch (error) {
            throw error;
        }

        if(process.env.DEV_MODE !== 'true'){
            await browser.close();
        }
    }
}

module.exports = MessageRooms;