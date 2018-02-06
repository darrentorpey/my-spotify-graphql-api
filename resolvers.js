const { compact, flatten, uniqBy } = require('lodash')

const playlists = require('./data/playlists.json')

const compound = items => uniqBy(compact(flatten(items)), 'id')

function audioFilter(property, value) {
  return track => track.audio_features && track.audio_features[property] >= value
}

function applyFilters(tracks, filters) {
  return tracks.filter(track => {
    for (filter of filters) {
      if (!filter(track)) {
        return false
      }
    }

    return true
  })
}

function getTracks(having) {
  let tracks = compound(playlists.map(p => p.tracks ?
    p.tracks.map(track => Object.assign(track, { playlists: [p.name] })) : p.tracks))

  const filters = []
  for (prop in having) {
    filters.push(audioFilter(prop, having[prop]))
  }

  // Apply filters
  tracks = applyFilters(tracks, filters)

  return tracks
}

function resolveTracks(root, { startsWith, having }) {
  let tracks = getTracks(having)

  if (startsWith) {
    tracks = tracks.filter(track => track.name.startsWith(startsWith))
  }

  return tracks
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
  console.log('!! granularity', granularity)
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

const audioFeaturesFieldResolver = (feature) => (audio_features, args, context) => {
  const { afGranularity } = context

  return afLabel(audio_features[feature], afGranularity)
}

const resolvers = {
  Query: {
    playlists: () => playlists,
    tracks: resolveTracks,
  },
  Track: {
    audio_features_summary: (track, args, context) => {
      context.afGranularity = args.granularity

      return track.audio_features
    }
  },
  AudioFeaturesSummary: {
    danceability: audioFeaturesFieldResolver('danceability'),
    speechiness: audioFeaturesFieldResolver('speechiness'),
    acousticness: audioFeaturesFieldResolver('acousticness'),
    instrumentalness: audioFeaturesFieldResolver('instrumentalness'),
    liveness: audioFeaturesFieldResolver('liveness'),
    valence: audioFeaturesFieldResolver('valence'),
    tempo: audioFeaturesFieldResolver('tempo'),
  }
}

module.exports = resolvers
