const express = require( 'express' );
const router = express.Router();

const {adminLogin} = require( '../controllers/Auth' );

// POST API
router.post( '/login', adminLogin );

module.exports = router;
