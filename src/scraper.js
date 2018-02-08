import scraperjs from 'scraperjs'

const scrapeUrl = (url) =>
  new Promise((resolve, reject) => {
    scraperjs.StaticScraper.create(url)
      .scrape(resolve)
  })

export {
  scrapeUrl
}
