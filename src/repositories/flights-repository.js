const CrudRepository = require('./crud-repository')
const {Flight,Airplane,Airport, City} = require('../models');
const db = require('../models')
const {logger} = require('../config');
const {queryToLockRowForSeatUpdate} = require('./queries')
class FlightRepository extends CrudRepository{
   constructor(){
    super(Flight)
   }

  async getAllFlights(filter, sort) {
  try {
    return await Flight.findAll({
      where: filter,
      order: sort,
      include: [
        {
          model: Airplane,
          required: true
        },
        {
          model: Airport,
          as: 'departureAirport',
          required: true,
          include: [
            {
              model: City,
              required: true
            }
          ]
        },
        {
          model: Airport,
          as: 'arrivalAirport',
          required: true,
          include: [
            {
              model: City,
              required: true
            }
          ]
        }
      ]
    });
  } catch (error) {
    logger.error('Something went wrong in the Crud Repo: getAll', {
      message: error.message,
      sql: error.sql,
      original: error.original?.message
    });

    throw error;
  }
}

  
async updateRemainingSeats(fightId,seats,dec=true){
  const transaction = await db.sequelize.transaction()
  try {
     await db.sequelize.query(queryToLockRowForSeatUpdate(fightId))
  const flight = await Flight.findByPk(fightId)
  if(Boolean(dec)){
    await flight.decrement('totalSeats',{by:seats})
  }else{
    await flight.increment("totalSeats",{by:seats})
  }  

  await transaction.commit()
  return true
  } catch (error) {
    // console.log(error)
    await transaction.rollback()
        throw error
  }
 
}

}



module.exports = FlightRepository;