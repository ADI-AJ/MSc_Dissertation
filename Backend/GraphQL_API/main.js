const express = require('express')

//Importing the Sequelize class from the installed 'sequelize' package
const {Sequelize} = require('sequelize')

const sequelize = new Sequelize(
    'moviedb', //db
    'adi', //user
    null, //password
    {
        host: 'localhost',
        dialect: 'postgres',
        port: 5432,
        logging: false, // Sequelize does not print SQL statements or debug logs to the console by default
    }
)

//module.exports = sequelize //module.exports is the object that a file exposes when it is required in another file.


async function startServer(){ //async = This function may take some time to finish, so don't stop the whole program while waiting.
    try{
        await sequelize.authenticate() //Wait until the connection succeeds or fails before moving to the next line
        console.log('PostgreSQL connected')
    }
    catch (err){
        console.error(err)
    }
}

startServer()