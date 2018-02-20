import { resolveLyrics, resolveLyricSheets } from './src/resolvers/lyrics'
import { resolveRecentTracks, resolveMyPlaylists, resolveTracks } from './src/resolvers/spotify'

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
    myPlaylists: resolveMyPlaylists,
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
