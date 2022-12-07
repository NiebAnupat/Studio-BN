const { PrismaClient } = require( "@prisma/client" );
const prisma = new PrismaClient();
const colors = require( 'colors' );

const adminLogin = async ( req, res ) => {
    const { ID, PASSWORD } = req.body;
    try {
        const admin = await prisma.admin.findFirst( {
            where : {
                AD_ID : ID,
                AD_PASSWORD : PASSWORD
            }
        } )
        if ( admin ) {
            res.status( 200 ).json( admin );
        } else {
            res.status( 404 ).json( null );
        }
    } catch ( e ) {
        console.log( `Error: ${ e.message }`.red );
        res.status( 500 ).json( {
            message : "Server error"
        } );
    }
}

module.exports = {
    adminLogin
}
