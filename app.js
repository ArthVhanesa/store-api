require('dotenv').config()

const express = require('express')
const app = express()

const connectDB = require('./db/connect')

const productsRouter = require('./routes/products')

const notFoundMiddleware = require('./middleware/not-found')
const errorHandlerMiddleware = require('./middleware/error-handler')


// Middleware for json
app.use(express.json())

// Route for API 
app.use('/api/v1/products', productsRouter)

// Middleware
app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)


const PORT = process.env.PORT || 5000

// Written in start function as we want to spin up the server only if the db is connected
const start = async () => {
    try {
        await connectDB(process.env.MONGO_URI)

        // If the DB connection is successful then server will start listen
        app.listen(PORT, () => {
            console.log(`server is listening on ${PORT}`)
        })
    } catch (error) {
        console.log(error)
    }
}

// Invoking the start function for connect the db and start the server
start();