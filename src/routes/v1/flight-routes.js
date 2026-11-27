const express = require('express')

const router = express.Router()

const {FlightController} = require('../../controllers')
const {FlightMiddleware} = require('../../middleware')

// /api/v1/airplanes POST
router.post('/',FlightMiddleware.validateCreateFlight,FlightController.createFlight)

router.get('/',FlightController.getAllFlights)

router.patch('/:id/seats',FlightMiddleware.validateUpdateRemainingSeats,FlightController.updateRemainingSeats)

router.get('/:id',FlightController.getFlight)
module.exports = router;