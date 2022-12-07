const express = require( 'express' );
const router = express.Router();
const {
    getRentsByMonth
} = require( "../controllers/Report" );

// GET API
router.get( '/by/:month', getRentsByMonth );

module.exports = router;
