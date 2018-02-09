import striptags from 'striptags'

import { scrapeUrl } from '../scraper.js'

const songs = {
  'http://www.songlyrics.com/destroyer/your-blood-lyrics/': `
hello, I love you
  `
}

function cleanLyricsText(rawHtml) {
  return striptags(rawHtml, '<br>')
    .replace(/<br>\n/g, '\n')
    .replace(/( ){2,8}/g, ' ')
    .trim()
}

async function scrapeLyrics(url) {
  const $ = await scrapeUrl(url)

  const songLyricsDiv = $('#songLyricsDiv')

  if (songLyricsDiv.length) {
    return {
      content: $('#songLyricsDiv').html(),
      title: $('.pagetitle h1').html().replace(' Lyrics', '')
    }
  }

  const geniusLyricsDiv = $('.lyrics')

  if (geniusLyricsDiv.length) {
    const rawHtml = geniusLyricsDiv.html()

    const stripped = cleanLyricsText(rawHtml)

    return {
      content: stripped,
      title: 'not available yet'
    }
  }

  throw Error('could not find lyrics')
}

async function resolveLyrics(root, { url }) {
  const lyricsResponse = await scrapeLyrics(url)

  // console.log(`lyricsResponse`, lyricsResponse)
  return {
    text: lyricsResponse.content
  }
}

export default resolveLyrics
