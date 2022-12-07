const { PrismaClient } = require( "@prisma/client" );
const prisma = new PrismaClient();
const colors = require( 'colors' );


const getRooms = async ( req, res ) => {
    try {
        console.log("GET All Rooms".bgBlue);
        const rooms = await prisma.room.findMany( {
        } );
        res.status( 200 ).json( rooms);
        console.log("GET All Rooms Success".bgGreen);
    } catch ( e ) {
        console.log( `Error: ${ e.message }`.red );
        res.status( 500 ).json( {
            message : "Server error"
        } );
    }
}

const checkTimeOutRoom = async ( req, res ) => {
    console.log("PUT Check Time Out Room");
    const rooms = await prisma.room.findMany( {
        where : {
            USING_RENT_ID : {
                not : null
            }
        }
    } )
    rooms.forEach( async ( room ) => {
        const rent = await prisma.rent.findFirst( {
            where : {
                id : room.USING_RENT_ID
            }
        } )
        // combine date and time
        const date = rent.RN_DATE;
        const time = rent.RN_END_TIME;
        const timeOut = new Date( `${ date } ${ time }` );
        const now = new Date();
        if ( now > timeOut ) {
            await prisma.room.update( {
                where : {
                    id : room.R_ID
                },
                data : {
                    USING_RENT_ID : null
                }
            } )
        }
        console.log( `Check time out room ${ room.R_ID } success`.green );
    } )
    console.log( "Check time out room success".green );
    res.status( 200 ).json( {
        message : "Check time out room success"
    } );
}

module.exports = {
    getRooms,
    checkTimeOutRoom
}
