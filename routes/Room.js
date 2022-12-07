const express = require( 'express' );
const router = express.Router();

const {getRooms,checkTimeOutRoom} = require( '../controllers/Room' );

// GET API
router.get( '/all', getRooms );
// PUT API
router.put( '/check-time-out', checkTimeOutRoom );

module.exports = router;
