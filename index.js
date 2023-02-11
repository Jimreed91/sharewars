require('dotenv').config()
const { response } = require('express')
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
morgan.token('type', function (req, res) { return JSON.stringify(req.body) })

const app = express()
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :type'))
app.use(cors())
// Importing a custom module to deal with scraping and bulk updating
const codewars = require('./codewars/scraper');

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

const Solution = require('./models/solution')
//Pull solutions from mongoDB
app.get('/solutions', (request, response) => {
  Solution.find({}).then(solutions => {
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

app.post('/solutions/update', (request, response) => {

  Solution.deleteMany({}).then(
  codewars.scrape()
    .then((d) => {
      codewars.merge(d)
    .then(d => Solution.collection.insertMany(d))
    .then((docs) => {
      console.log("data insterted")
      response.json(docs)
    })
    .catch((e) => console.log(e))
}))
    // .then
    // // codewars.saveAll()
    // Solution.collection.insertMany(data)
    // .then(() => console.log('updated succ 🎉'))
    // .catch(e => console.log(e))


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
