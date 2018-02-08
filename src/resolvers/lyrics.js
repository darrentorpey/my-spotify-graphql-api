import { scrapeUrl } from '../scraper.js'

const songs = {
  'http://www.songlyrics.com/destroyer/your-blood-lyrics/': `
hello, I love you
  `
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
    return {
      content: geniusLyricsDiv.html(),
      title: 'not available yet'
    }
  }

  throw Error('could not find lyrics')
}

async function resolveTracks(root, { url }) {
  const lyricsResponse = await scrapeLyrics(url)

  console.log(`lyricsResponse`, lyricsResponse)
  return {
    text: lyricsResponse.content
  }
}

export default resolveTracks
