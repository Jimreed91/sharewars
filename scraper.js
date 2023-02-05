const fs = require('fs');
require('dotenv').config()
const puppeteer = require('puppeteer');
const BASE_URL = 'https://www.codewars.com/'
// Command line arguments
// const arg = process.argv
// const username = arg[2]
// const email = arg[3]
// const password = arg[4]
const username = process.env.USR
const email = process.env.EMAIL
const password = process.env.PASSWORD
let target = 50

async function main(){
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
  console.log(solutions, solutionJson)
fs.writeFileSync('./scrapedData.json', solutionJson )
await browser.close();
}
console.log(email)
main();
