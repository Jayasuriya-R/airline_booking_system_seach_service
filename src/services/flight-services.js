const {FlightRepository} = require('../repositories')
const AppError = require('../utils/errors/app-error')
const {StatusCodes} = require('http-status-codes')
const flightRepository = new FlightRepository();
const {compareTime} = require('../utils/helper/helper')
const {Op} = require('sequelize')

async function createFlight(data){
    try {
        if(compareTime(data.arrivalTime, data.departureTime)){
            const response = await flightRepository.create(data)
    return response
        }else{
            throw new AppError('Arrival time must be greater then departure time',StatusCodes.BAD_REQUEST)
        }
        
    } catch (error) {
        if(error.name == 'sequelizeValidationError'){
            let explanation = []
            error.errors.forEach(err => {
                explanation.push(err.message);
            });

           throw new AppError(explanation,StatusCodes.BAD_REQUEST)
        }
         throw new AppError('Cannot Create a new Airplane Object',StatusCodes.INTERNAL_SERVER_ERROR);
    }
    
}

async function getAllFlights(query) {
    let customFilter = {};
    let sortFilter = [];

    const tripEndTime = "23:59:59.999";
    if (query.trips) {
        const [departureAirportId, arrivalAirportId] = query.trips.split("-");

        if (!departureAirportId || !arrivalAirportId) {
            throw new AppError(
                'Invalid trip format. Use MAA-BLR',
                StatusCodes.BAD_REQUEST
            );
        }

        if (departureAirportId === arrivalAirportId) {
            throw new AppError(
                'Departure and Arrival airport is same',
                StatusCodes.BAD_REQUEST
            );
        }

        customFilter.departureAirportId = departureAirportId;
        customFilter.arrivalAirportId = arrivalAirportId;
    }

    if(query.price){
       const [minPrice,maxPrice] = query.price.split("-");

        customFilter.price = {
            [Op.between] : [minPrice,(maxPrice == undefined ? 2000 : maxPrice)]
        }
    }

    if(query.travellers){
        customFilter.totalSeats = {
            [Op.gte] : query.travellers
        }
    }

    if (query.tripDate) {
    const startDate = new Date(`${query.tripDate}T00:00:00.000Z`);
    const endDate = new Date(`${query.tripDate}T${tripEndTime}Z`);

    customFilter.departureTime = {
        [Op.between]: [startDate, endDate]
    };
    }
    if(query.sort){
        let sortQuery = query.sort.split(","); //[ 'departureTime_ASC' ]
        let sortArray = sortQuery.map(col => col.split("_"))
        sortFilter = sortArray;
    }    

    try {
        const response = await flightRepository.getAllFlights(customFilter,sortFilter);
        return response;
    } catch (error) {
    

        throw new AppError(
            'Cannot fetch data of the Flights',
            StatusCodes.INTERNAL_SERVER_ERROR
        );
    }
}

async function getFlight(id){
    try {
        const response = await flightRepository.get(id);
        return response
    } catch (error) {
        if(error.statusCode === StatusCodes.NOT_FOUND){
            throw new AppError('Requested flight is Not found',error.statusCode);
        }
    throw new AppError('Cannot fetch data of all the flight',StatusCodes.INTERNAL_SERVER_ERROR);
    }
}
async function updateRemainingSeats(data){
    
    try {
        const response = await flightRepository.updateRemainingSeats(data.flightId,data.seats,data.dec);
        return response 
    } catch (error) {
    throw new AppError('Cannot update data of the seats',StatusCodes.INTERNAL_SERVER_ERROR);
    }
}


module.exports ={
    createFlight,
    getAllFlights,
    updateRemainingSeats,
    getFlight
}