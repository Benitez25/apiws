const mysql = require('mysql')
const {promisify} = require('util')

const pool = mysql.createPool({
    host: '127.0.0.1',
    //host: 'localhost',
    user: 'root',
    database: 'adoptape',
    password: ''
})

pool.getConnection((err, connection) => {
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.log('DATABASE CONNECTION WAS CLOSED')
        }
        if(err.code === 'ER_CON_COUNT_ERROR'){
            console.log('DATABASE HAS TO MANY CONNECTIONS')
        }
        if(err.code === 'ECONNREFUSED'){
            console.log('DATABASE CONNECTION WAS REFUSED')
        }
    }
    if(connection) connection.release()
    console.log('DB is Connected')
    return
})

pool.query = promisify(pool.query)
module.exports = pool