function queryToLockRowForSeatUpdate(id){
    return `SELECT * FROM flights WHERE flights.id = ${id} FOR UPDATE`
}

module.exports={
    queryToLockRowForSeatUpdate
}