import { compact, flatten, uniqBy } from 'lodash-es'

import { resolveLyrics, resolveLyricSheets } from './src/resolvers/lyrics'
import { resolveRecentTracks } from './src/resolvers/spotify'

const playlists = []

const compound = items => uniqBy(compact(flatten(items)), 'id')

function audioFilter(property, value) {
  return track => track.audio_features && track.audio_features[property] >= value
}

function nameMatches(name, target) {
  const matches = target.match(/%(.*)%/)
  const matchTarget = matches && matches[1]

  if (matchTarget) {
    return name.toLowerCase().includes(matchTarget.toLowerCase())
  }

  return name === target
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

function getTracks() {
  return compound(
    playlists.map(
      p =>
        // p.tracks ? p.tracks.map(track => Object.assign(track, { playlists: [p.name] })) : p.tracks
        p.tracks ? p.tracks.map(track => ({ ...track, playlists: [p.name] })) : p.tracks
    )
  )
}

function resolveTracks(root, { startsWith, having, title }) {
  const tracks = getTracks(startsWith, having, title)

  const filteredTracks = filterTracks(tracks, { startsWith, having, title })

  return filteredTracks
}

function afLabelCoarse(afValue) {
  if (afValue >= 0.7) {
    return 'HIGH'
  }

  if (afValue >= 0.4) {
    return 'MEDIUM'
  }

  return 'LOW'
}

function afLabelMedium(afValue) {
  if (afValue >= 0.9) {
    return 'WICKED'
  }

  if (afValue >= 0.7) {
    return 'HIGH'
  }

  if (afValue >= 0.6) {
    return 'MEDIUM-HIGH'
  }

  if (afValue >= 0.4) {
    return 'MEDIUM'
  }

  if (afValue >= 0.2) {
    return 'LOWISH'
  }

  return 'VERY LOW'
}

function afLabel(afValue, granularity = 'COARSE') {
  if (granularity !== 'COARSE' && granularity !== 'MEDIUM') {
    throw Error('unknown granularity')
  }

  if (granularity === 'COARSE') {
    return afLabelCoarse(afValue)
  }

  if (granularity === 'MEDIUM') {
    return afLabelMedium(afValue)
  }
}

const audioFeaturesFieldResolver = feature => (audioFeatures, args, context) => {
  const { afGranularity } = context

  return afLabel(audioFeatures[feature], afGranularity)
}

const resolvers = {
  Query: {
    playlists: () => playlists,
    tracks: resolveTracks,
    lyric_sheet: resolveLyrics,
    lyric_sheets: resolveLyricSheets,
    recent_tracks: resolveRecentTracks,
  },
  Track: {
    audio_features_summary: (track, args, context) => {
      context.afGranularity = args.granularity

      return track.audio_features
    },
  },
  AudioFeaturesSummary: {
    danceability: audioFeaturesFieldResolver('danceability'),
    speechiness: audioFeaturesFieldResolver('speechiness'),
    acousticness: audioFeaturesFieldResolver('acousticness'),
    instrumentalness: audioFeaturesFieldResolver('instrumentalness'),
    liveness: audioFeaturesFieldResolver('liveness'),
    valence: audioFeaturesFieldResolver('valence'),
    tempo: audioFeaturesFieldResolver('tempo'),
  },
}

export default resolvers
