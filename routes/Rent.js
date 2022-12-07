const express = require( 'express' );
const router = express.Router();
const upload = require( '../middleware/upload' );

const {
    getRents,
    getRentById,
    createRent,
    rejectRent,
    checkRoom
} = require( '../controllers/Rent' );

// GET API
router.get( '/all', getRents );
router.get( '/by/:id', getRentById );

// POST API
router.post( '/', upload.single( 'img' ), createRent );
router.post( '/check-room', checkRoom );

// DELETE API
router.delete( '/reject/:id', rejectRent );

module.exports = router;
