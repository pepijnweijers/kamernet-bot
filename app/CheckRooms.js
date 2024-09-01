const axios = require('axios');
const Cache = require('@/Cache');
const LoginStatus = require('@/Authenticate');
const cheerio = require('cheerio');
const { format } = require('date-fns');

function getRoomType (id) {
    let Type;
    switch (id) {
        case 1:
            Type = 'kamer';
            break;
        case 2:
            Type = 'appartement';
            break;
        case 4:
            Type = 'studio';
            break;
        case 8:
            Type = 'anti-kraak';
            break;
        default:
            throw new Error('Invalid type');
    }

    return Type;
}

async function CheckRoom(id, city, street, type) {
    const City = city.replace(/ /g, "-").toLowerCase();
    const Street = street.replace(/ /g, "-").toLowerCase();
    const Type = getRoomType(type);

    const url = `https://kamernet.nl/huren/${City}/${Street}/${Type}-${id}`;

    try {
        if(process.env.DEV_MODE === 'true'){
            console.log('Checking ' + Street)
        }

        const response = await axios.get(url, {
            headers: {
                'Cookie': Cache.get('Cookies')
            }
        });

        if(response.data.includes(`color="secondary">Inloggen</button>`)){
            await LoginStatus();
            return await CheckRoom(id, city, street, type);
        } else {
            const messaged = response.data.includes(`color="secondary">Contacteer verhuurder</button>`);
            const $ = cheerio.load(response.data);
            const landLord = $('.LandlordProfile_profile__6Ytn_ h6').text();
            const landLordRole = $('.LandlordProfile_profile__6Ytn_ .LandlordProfile_status__aISRo p').text();
            const svgIcon = $('[data-testid="PersonOutlineOutlinedIcon"]');
            const paragraph = svgIcon.parent().find('p');
            const housematesNumber = svgIcon.length ? 
                (paragraph.length ? 
                    ((match = paragraph.text().match(/(\d+)\s+huisgenoten/)) ? 
                        parseInt(match[1], 10) : false) : false) : false;

            return {
                messaged,
                landLord,
                landLordRole,
                housematesNumber
            };
        }
    } catch(error) {
        console.log('Error fetching room:', street);
    }
}

async function CheckRooms(Rooms) {
    let RoomsResponded = 0;
    const newRooms = [];
    
    try {
        for (const room of Rooms.listings) {
            const RoomData = await CheckRoom(room.listingId, room.city, room.street, room.listingType);

            if(!RoomData.messaged){
                RoomsResponded++;
            } else {
                const formattedDate = format(new Date(room.availabilityStartDate), 'dd-MM-yyyy');
                const roomType = getRoomType(room.listingType);

                newRooms.push({
                    id: room.listingId,
                    type: roomType,
                    houseMates: RoomData.housematesNumber,
                    street: room.street,
                    startDate: formattedDate,
                    landLord: RoomData.landLord,
                    landLordRole: RoomData.landLordRole
                });
            }

            if (RoomsResponded > 2) {
                throw new Error('Stopping the loop');
            }
        }
    } catch (error) {
        if (error.message !== 'Stopping the loop') {
            throw error;
        }
    }

    return newRooms;
}


module.exports = CheckRooms;