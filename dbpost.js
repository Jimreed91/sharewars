

   const main = async () => {
    const Solution = await require('./models/solution')
    const data = await require('./mergedData.json')
      console.log('clearing db')
    await  Solution.deleteMany({})
      console.log('cleared successfully')
    await  data.forEach(d => {
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
  }
main()
