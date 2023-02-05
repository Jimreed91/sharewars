
const solutions = require('./scrapedData.json')
const axios = require('axios');

const fs = require('fs')
const API_BASE_URL = 'https://www.codewars.com/api/v1/code-challenges/'
const getData = (id) => axios.get(`${API_BASE_URL}${id}`)

const mergeData = (responses) => {
  console.log('Merging data')
  try {  const merged = responses.map((r) => {
    return Object.assign({}, r, solutions.find(s => s.problemId === r.id))
    })
    const mergedJson = JSON.stringify(merged, null, 4)
    fs.writeFileSync('././mergedData.json', mergedJson )
  }
  catch(e) {
    console.log(e, 'Something went wrong while merging data or writing to file')
  }
  console.log('Data merged successfuly 🎉 ')
}

function main() {
console.log("Retrieving data from codewars")
axios.all(solutions.map(solution => getData(solution.problemId) ))
  .then(responses => responses.map(response => response.data))
  .then(responses => responses.map(response => (
    {
      id: response.id,
      name: response.name,
      description: response.description,
      rank: response.rank
    }
    )))
  .then(responses => mergeData(responses))
  }
  main()
