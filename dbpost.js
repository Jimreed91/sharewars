const Solution = require('./models/solution')
const data = require('./mergedData.json')

data.forEach(d => {
  const solution = new Solution({
  id: d.id,
  name: d.name,
  description: d.description,
  rankColor: d.rank.color,
  rankName: d.rank.name,
  rank: d.rank.id,
  problemId: d.problemId,
  languages: d.languages,
  codeSolutions: d.codeSolutions,
  dateTime: d.dateTime,
  timeAgo: d.timeAgo
  })

  solution.save().then(savedSolution => {
    console.log(savedSolution.name, 'sent...')
  })
})
