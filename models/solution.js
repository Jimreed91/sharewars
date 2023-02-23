require('dotenv').config()
const mongoose = require('mongoose')
const url = process.env.MONGODB_URI
console.log('Connecting to MongoDB ')
mongoose.set('strictQuery', false);

mongoose.connect(url)
  .then(result => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB', error.message)
  })

  const RankSchema = new mongoose.Schema({
    id: Number,
    name: String,
    color: String
  })

const SolutionSchema = new mongoose.Schema({
  id: String,
  name: String,
  description: String,
  rank: {type: RankSchema},
  rankColor: String,
  rankName: String,
  problemId: String,
  languages: Array,
  codeSolutions: Array,
  dateTime: String,
  timeAgo: String

}, {versionKey: false })

SolutionSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Solution = mongoose.model('Solution', SolutionSchema)

module.exports = mongoose.model('Solution', SolutionSchema)
