const { PrismaClient } = require( "@prisma/client" );
const fs = require( "fs" );
const prisma = new PrismaClient();
const colors = require( 'colors' );
const moment = require( 'moment' );


// GET API
const getRents = async ( req, res ) => {
    try {
        console.log( "GET Rents".bgBlue );
        const rents = await prisma.rent.findMany( {
            include : {
                customer : true,
                using_room : {
                    include : {
                        room : true
                    }
                }
            }
        } );
        res.status( 200 ).json( {
            message : "Get rents success",
            data : rents
        } );
    } catch ( e ) {
        console.log( `Error: ${ e.message }`.red );
        res.status( 500 ).json( {
            message : "Server error"
        } );
    }
}

const getRentById = async ( req, res ) => {
    const { id } = req.params;
    try {
        const rent = await prisma.rent.findFirst( {
            where : {
                RN_ID : parseInt( id )
            },
            include : {
                customer : true,
                room : true
            }
        } );
        res.status( 200 ).json( {
            message : "Get rent by id success",
            data : rent
        } );
    } catch ( e ) {
        console.log( `Error: ${ e.message }`.red );
        res.status( 500 ).json( {
            message : "Server error"
        } );
    }
}

// POST API

const _calculatePrice = async ( RN_START_TIME, RN_END_TIME, room ) => {
    const start = new Date( RN_START_TIME );
    const end = new Date( RN_END_TIME );
    const diff = end.getTime() - start.getTime();
    const hours = diff / (1000 * 60 * 60);
    const price = hours * room.R_PRICE;
    return price;
}

const createRent = async ( req, res ) => {
    const { RN_DATE, RN_START_TIME, RN_END_TIME, CUS_NAME, CUS_TEL, R_TYPE, TotalPrice } = req.body;
    try {

        console.log( "POST Create Rent".bgBlue );


        var type = '';

        switch ( R_TYPE ) {
            case 'ห้องเล็ก':
                type = 'sm';
                break;
            case 'ห้องกลาง':
                type = 'md';
                break;
            case 'ห้องใหญ่':
                type = 'lg';
                break;
        }
        console.log( type );

        // string hour to date
        const momentStart = moment( RN_START_TIME, "HH:mm" );
        const momentEnd = moment( RN_END_TIME, "HH:mm" );

        // moment to date
        const start = momentStart.toDate();
        const end = momentEnd.toDate();

        // check room is available with using_room join room join rent as raw query
        const available = await prisma.$queryRaw`SELECT * FROM using_room
            JOIN room ON using_room.R_ID = room.R_ID
            JOIN rent ON using_room.RN_ID = rent.RN_ID
            WHERE room.R_TYPE = ${ type } AND rent.RN_DATE = ${ RN_DATE } AND
            ((rent.RN_START_TIME <= ${ momentStart } AND rent.RN_END_TIME > ${ momentStart }) OR
            (rent.RN_START_TIME < ${ momentEnd } AND rent.RN_END_TIME >= ${ momentEnd }) OR
            (rent.RN_START_TIME >= ${ momentStart } AND rent.RN_END_TIME <= ${ momentEnd }))`;

        if ( available.length > 0 ) {
            return res.status( 200 ).json( null );
        }

        const room = await prisma.room.findFirst( {
            where : {
                R_TYPE : type,
            }
        } )


        if ( room.length === 0 ) return res.status( 200 ).json( null );
        console.log( room );

        // create customer
        const customer = await prisma.customer.create( {
            data : {
                CUS_NAME : CUS_NAME,
                CUS_TEL : CUS_TEL
            }
        } )

        var img

        img = req.file

        const rent = await prisma.rent.create( {
            data : {
                RN_DATE : RN_DATE,
                RN_START_TIME : start,
                RN_END_TIME : end,
                CUS_ID : customer.CUS_ID,
                R_ID : room.R_ID,
                RN_PRICE : parseFloat( TotalPrice ),
                RN_PAYMENT : fs.readFileSync(
                    __basedir + "/assets/uploads/" + img.filename
                )
            }
        } )

        await prisma.using_room.create( {
            data : {
                R_ID : room.R_ID,
                RN_ID : rent.RN_ID
            }
        } )

        console.log( `Create rent success`.green );
        res.status( 200 ).json( rent )

        // delete file
        fs.unlinkSync( __basedir + "/assets/uploads/" + req.file.filename );
    } catch ( e ) {
        console.log( `Error: ${ e.message }`.red );
        // res.status( 500 ).json( {
        //     message : "Server error"
        // } );
    }
}

// DELETE API
const rejectRent = async ( req, res ) => {
    const { id } = req.params;
    try {

        await prisma.$queryRaw`DELETE FROM using_room WHERE RN_ID = ${ id }`

        await prisma.rent.delete( {
            where : {
                RN_ID : parseInt( id )
            }
        } )

        // delete using_room use rent id by raw query

        // await prisma.using_room.delete( {
        //     where : {
        //         RN_ID : parseInt( id )
        //     }
        // })

        res.status( 200 ).json( {
            message : "Reject rent success"
        } );
    } catch ( e ) {
        console.log( `Error: ${ e.message }`.red );
        res.status( 500 ).json( {
            message : "Server error"
        } );
    }
}

module.exports = {
    getRents,
    getRentById,
    createRent,
    rejectRent
}
