import { compact, flatten, keyBy, uniqBy } from 'lodash-es'

import { fetchItems as fetchSpotifyItems, fetchOther } from '../spotify'

class SpotifyFetchError extends Error {}

const compound = items => uniqBy(compact(flatten(items)), 'id')

function audioFilter(property, value) {
  return track => track.audio_features && track.audio_features[property] >= value
}

function titleFilter(title) {
  return track => nameMatches(track.name, title)
}

function applyFilters(tracks, filters) {
  return tracks.filter(track => {
    for (const filter of filters) {
      if (!filter(track)) {
        return false
      }
    }

    return true
  })
}

function nameMatches(name, target) {
  const matches = target.match(/%(.*)%/)
  const matchTarget = matches && matches[1]

  if (matchTarget) {
    return name.toLowerCase().includes(matchTarget.toLowerCase())
  }

  return name === target
}

export async function resolveRecentTracks() {
  const { items } = await fetchSpotifyItems(`me/player/recently-played`)

  if (!items) {
    throw Error('feck')
  }

  return items.map(item => item.track)
}

function filterTracks(tracks, { startsWith, having, title }) {
  const filters = []

  for (const prop in having) {
    filters.push(audioFilter(prop, having[prop]))
  }

  if (startsWith) {
    tracks = tracks.filter(track => track.name.startsWith(startsWith))
  }

  if (title) {
    filters.push(titleFilter(title.trim()))
  }

  return applyFilters(tracks, filters)
}

function debugResponse(resp) {
  console.log(`resp:\n`)
  console.log(resp)
}

function trackFromPlaylistTrack(playlistTrack) {
  // console.log('playlistTrack.added_at', playlistTrack.added_at)
  const artists = playlistTrack.track.artists
  return {
    artist: artists ? artists[0] : null,
    added_at: playlistTrack.added_at,
    ...playlistTrack.track,
  }
}

async function trackExtras(trackIds) {
  return fetchOther(`audio-features?ids=${trackIds.join(',')}`)
}

async function getTrackExtras(tracks) {
  const audioFeatures = await trackExtras(tracks.map(t => t.id))

  const afById = keyBy(audioFeatures, 'id')
  tracks.forEach(t => (t.audio_features = afById[t.id]))

  return tracks
}

// ex. https://api.spotify.com/v1/users/darrentorpey/playlists/6diUWK4HbXMmAPE2UPRQwQ/tracks
async function getTracksByHref(playlist) {
  // console.log(`[#getTracksByHref] playlist.tracks.href`, playlist.tracks.href)
  if (!playlist.tracks.href.includes('darrentorpey')) {
    console.log(`(skip)`)
    return []
  }
  const response = await fetchSpotifyItems(playlist.tracks.href)

  if (!response.items) {
    return null
  }

  const tracks = response.items.map(pt => trackFromPlaylistTrack(pt))

  const tracksWithExtra = await getTrackExtras(tracks)

  return tracksWithExtra
}

async function getPlaylists(offset = 0) {
  const { items: playlists } = await fetchSpotifyItems(`me/playlists?limit=50&offset=${offset}`)

  if (!playlists) {
    throw new SpotifyFetchError('failed to get playlists')
  }

  return Promise.all(
    playlists.map(async playlist => ({ ...playlist, tracks: await getTracksByHref(playlist) }))
  )
}

function getTracksFromPlaylists(playlists) {
  return compound(
    playlists.map(
      playlist =>
        playlist.tracks
          ? playlist.tracks.map(track => ({ ...track, playlists: [playlist.name] }))
          : playlist.tracks
    )
  )
}

export async function resolveTracks(root, { startsWith, having, title }) {
  try {
    const playlists = await getPlaylists()

    const tracks = getTracksFromPlaylists(playlists)

    const filteredTracks = filterTracks(tracks, { startsWith, having, title })

    return filteredTracks
  } catch (e) {
    console.error('Problem resolving tracks', e)
  }
}

export async function resolveMyPlaylists(root, { offset }) {
  return await getPlaylists(offset)
}
