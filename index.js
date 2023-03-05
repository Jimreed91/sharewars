const NODE_ENV = process.env.NODE_ENV
  require('dotenv').config();
const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
// Importing a custom module to deal with scraping and bulk updating
const codewars = require('./scraper/codewars');

morgan.token('type', function (req, res) { return JSON.stringify(req.body) })

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

app.get('/health', (request, response) => {
  response.status(200).end()
})

const Solution = require('./models/solution')
//Pull solutions from mongoDB
app.get('/solutions', (request, response) => {
  Solution.find({}).sort({dateCompleted: -1})
  .then(solutions => {
    response.json(solutions)
  })
  .catch(error => next(error))
})

//Pull solution by :id
app.get('/solutions/:id', (request, response) => {
  Solution.findById(request.params.id)
  .then(solution => {
    if(solution) {
      response.json(solution)
    } else {
      response.status(404).end()
    }
  })
  .catch(error => response.json(error))
})
// Set up for allowing remote update via codewars webook
// not enabled for production
app.post('/solutions/update', (request, response) => {
  if(request.body.action === 'honor_changed'
  && request.get('X-Webhook-Secret') === process.env.CW_SECRET) {
    console.log('Codewars webhook received')
    const cwUpdate = require('./cwUpdate');
    return response.status(200).end()
}
  console.log('Bad request')
  response.status(400).end()
})



//Error/bad endpoint handling
const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }

  next(error)
}

app.use(unknownEndpoint)
// this has to be the last loaded middleware.
app.use(errorHandler)
