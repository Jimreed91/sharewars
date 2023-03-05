const Solution = require('./models/solution');
const codewars = require('./codewars/scraper');

const main = () => {
  Solution.deleteMany({}).then(
    codewars.scrape()
      .then((d) => {
        codewars.merge(d)
      .then(d => {
        console.log("Updating database...")
        Solution.collection.insertMany(d)})
      .then((docs) => {
        console.log("Update successful!")
      })
      .catch((e) => console.log(e))
      })
  )
}
console.log("Updating...")
main()
process.exit()
