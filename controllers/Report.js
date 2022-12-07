const { PrismaClient } = require( "@prisma/client" );
const fs = require( "fs" );
const prisma = new PrismaClient();
const colors = require( 'colors' );

// GET API
const getRentsByMonth = async ( req, res ) => {
    const { month } = req.params;
    try {

        const rents = await prisma.rent.findMany( {
            where : {
                RN_DATE : {
                    contains : month
                }
            },
            include : {
                customer : true,
                using_room : {
                    include : {
                        room : true
                    }
                }
            }
        } );
        if ( rents.length === 0 ) {
            return res.status( 200 ).json( null);
        }
        res.status( 200 ).json( rents);

    } catch ( e ) {
        console.log( `Error: ${ e.message }`.red );
        res.status( 500 ).json( {
            message : "Server error"
        } );
    }
}

module.exports = {
    getRentsByMonth
}
