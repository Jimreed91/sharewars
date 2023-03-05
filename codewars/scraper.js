require('dotenv').config()
const axios = require('axios');
const puppeteer = require('puppeteer');
const BASE_URL = 'https://www.codewars.com/'
const API_BASE_URL = 'https://www.codewars.com/api/v1/code-challenges/'
const username = process.env.USR
const email = process.env.EMAIL
const password = process.env.PASSWORD

//uses scraped id to retrieve the code challenge information from codewars api
const getData = (id) => axios.get(`${API_BASE_URL}${id}`)

// This module handles scraping codewars for new data, combining it with api data
// and updating the db after merging the two
module.exports = {
  //Scraping function
  scrape: async function (target = 50) {
    console.log('Launching Puppeteer');
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome',
      args: ['--no-sandbox'],
      headless: true
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
    console.log('Scrolling and scraping...')

    let solutions = []

    while (target > solutions.length) {
      solutions = await page.evaluate(() => {
        return [...document.querySelectorAll('.list-item-solutions')].map(solution => {
            const problemId = solution.querySelector('.item-title a').getAttribute('href').match(/[a-z0-9]+$/g)[0];
            const problemName = solution.querySelector('.item-title a').textContent.toLowerCase().replace(/[^\w ]/gi, '').trim().replace(/ +/g, '_');
            const languages = [...solution.querySelectorAll('code')].map(code => code.getAttribute('data-language'));
            const codeSolutions = [...solution.querySelectorAll('code')].map(code => code.textContent);
            const dateTime = solution.querySelector('time-ago').getAttribute('datetime');
            const timeAgo = solution.querySelector('time-ago').innerText;
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
  await browser.close();
  return solutions
  },

  merge: function(solutions){
    console.log("Retrieving data from codewars")

    const apiData = axios.all(solutions.map(solution => getData(solution.problemId) ))
      .then(responses => responses.map(response => response.data))
      .then(responses => responses.map(response => (
        {
          id: response.id,
          name: response.name,
          description: response.description,
          rank: response.rank
        }
        )
        ))
        .then(response => mapData(response))
    function mapData(response){
       return response.map((r) => {
          return Object.assign({}, r, solutions.find(s => s.problemId === r.id))
          })
    }
    return apiData
      }
      process.exit()

}
