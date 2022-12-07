const express = require( "express" );
const cors = require( "cors" );
const colors = require( 'colors' );
require( "dotenv" ).config();
global.__basedir = __dirname;
const PORT = process.env.PORT || 5000;
const app = express();

var corsOptions = {
    origin : "http://localhost:3000",
    certificates : true
}

app.use( cors( corsOptions ) );
app.use( express.json() );
app.use( express.urlencoded( { extended : true } ) );

// Routes
const authRoutes = require( "./routes/Auth" );
// const customerRoutes = require( "./routes/Customer" );
const roomRoutes = require( "./routes/Room" );
const rentRoutes = require( "./routes/Rent" );
const reportRoutes = require( "./routes/Report" );

app.use( "/admin", authRoutes );
// app.use( "/customer", customerRoutes );
app.use( "/room", roomRoutes );
app.use( "/rent", rentRoutes );
app.use( "/report", reportRoutes );


console.log( "Starting server...".yellow );
app.listen( PORT, () => {
    console.log( `Server is running on port ${PORT }`.yellow.bold );
} )
