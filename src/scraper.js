import scraperjs from 'scraperjs'

const scrapeUrl = url =>
  new Promise(resolve => {
    scraperjs.StaticScraper.create(url).scrape(resolve)
  })

export { scrapeUrl }
