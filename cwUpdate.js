const Solution = require('./models/solution');
const codewars = require('./scraper/codewars');

module.exports = {
  update: () => {
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
        .catch((e) => {
          console.log(e)
          return {status: 'error', error: e}
        })
        })
    )
    return {status: 'success'}
  }
}
