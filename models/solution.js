require('dotenv').config()
const mongoose = require('mongoose')
const url = process.env.MONGODB_URI
console.log('Connecting to... ', url)
mongoose.set('strictQuery', false);

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB', error.message)
  })

const solutionSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  rank: Number,
  rankColor: String,
  rankName: String,
  problemId: String,
  languages: Array,
  codeSolutions: Array,
  dateTime: Date,
  timeAgo: String

}, {versionKey: false })

solutionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Solution = mongoose.model('Solution', solutionSchema)

module.exports = mongoose.model('Solution', solutionSchema)
