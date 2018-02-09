import striptags from 'striptags'

import { scrapeUrl } from '../scraper.js'

const songs = {
  '2Z1QZn3LGA3G0NsXdZ5NUY': [
    'http://www.songlyrics.com/destroyer/your-blood-lyrics/',
    'https://genius.com/Destroyer-your-blood-lyrics',
  ],
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
      title: $('.pagetitle h1')
        .html()
        .replace(' Lyrics', ''),
      source: 'songlyrics.com',
    }
  }

  const geniusLyricsDiv = $('.lyrics')

  if (geniusLyricsDiv.length) {
    const rawHtml = geniusLyricsDiv.html()

    const stripped = cleanLyricsText(rawHtml)

    return {
      content: stripped,
      title: 'not available yet',
      source: 'genius.com',
    }
  }

  throw Error('could not find lyrics')
}

export async function resolveLyrics(root, { url, id } = {}) {
  if (id) {
    url = songs[id]
  }

  const lyricsResponse = await scrapeLyrics(url)

  // console.log(`lyricsResponse`, lyricsResponse)
  return {
    text: lyricsResponse.content,
  }
}

export async function resolveLyricSheets(root, { id }) {
  const urls = songs[id]

  const lyricSheets = await Promise.all(urls.map(url => scrapeLyrics(url)))

  return lyricSheets.map(sheet => ({
    text: sheet.content,
    title: sheet.title,
    source: sheet.source,
  }))
}
