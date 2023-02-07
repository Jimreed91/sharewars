const fs = require('fs');
require('dotenv').config()
const puppeteer = require('puppeteer');
const BASE_URL = 'https://www.codewars.com/'
const username = process.env.USR
const email = process.env.EMAIL
const password = process.env.PASSWORD

// This module handles scraping codewars for new data, combining it with api data
// and updating the db after merging the two
module.exports = {
  scrape: async function (target = 50) {
    console.log('Launching Puppeteer');
    const browser = await puppeteer.launch({
      headless: false
    });

    const page = await browser.newPage()
    await page.setViewport({ width: 1080, height: 720 })

    await page.goto(`${BASE_URL}/users/sign_in`, {waitUntil: 'domcontentloaded'})
    console.log("Login in progress...")
    await page.type('#user_email', email)
    await page.type('#user_password', password)
    await page.click('[type="submit"]');

    await page.waitForNavigation({ waitUntil: 'networkidle0' });

    console.log('Logged in')

    await page.goto(`${BASE_URL}/users/${username}/completed_solutions`, {waitUntil: 'domcontentloaded'})
    console.log('They see me scrolling, I assure you Im scraping')

    let solutions = []

    while (target > solutions.length) {
      solutions = await page.evaluate(() => {
        return [...document.querySelectorAll('.list-item-solutions')].map(solution => {
            const problemId = solution.querySelector('.item-title a').getAttribute('href').match(/[a-z0-9]+$/g)[0];
            const problemName = solution.querySelector('.item-title a').textContent.toLowerCase().replace(/[^\w ]/gi, '').trim().replace(/ +/g, '_');
            const languages = [...solution.querySelectorAll('code')].map(code => code.getAttribute('data-language'));
            const codeSolutions = [...solution.querySelectorAll('code')].map(code => code.textContent);
            const dateTime = Date(solution.querySelector('time-ago').getAttribute('datetime'))
            const timeAgo = solution.querySelector('time-ago').innerText
            return {
                problemId,
                problemName,
                languages,
                codeSolutions,
                dateTime,
                timeAgo
            };
          });
      });
      // Scrolling down to load infinite scroll
        previousHeight = await page.evaluate("document.body.scrollHeight");
        await page.evaluate("window.scrollTo(0, document.body.scrollHeight)");
        await page.waitForFunction(
          `document.body.scrollHeight > ${previousHeight}`
        );
        await new Promise((resolve) => setTimeout(resolve, 3000));
    } ;

  console.log(`Successfully scraped ${solutions.length} solutions.`);
  console.log('Closing Puppeteer instance.');

  console.log("Saving data")
    const solutionJson = JSON.stringify(solutions, null, 4)
  fs.writeFileSync('./scrapedData.json', solutionJson )
  await browser.close();
  },

  saveAll: async function() {
    const Solution = await require('../models/solution')
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
      console.log("saved successfully")
  }
}
