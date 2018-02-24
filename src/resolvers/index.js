import { resolveLyrics, resolveLyricSheets } from './lyrics'
import { resolveRecentTracks, resolveMyPlaylists, resolveTracks } from './spotify'
import { upsertResource } from '../jsonStore'
import { audioFeaturesFieldResolver } from './audioFeatures'

const resolvers = {
  Query: {
    myPlaylists: resolveMyPlaylists,
    tracks: resolveTracks,
    lyric_sheet: resolveLyrics,
    lyric_sheets: resolveLyricSheets,
    recent_tracks: resolveRecentTracks,
  },
  Mutation: {
    async editSongNotebook(_, { songId, text }) {
      return await upsertResource('songNotebook', { songId, text }, 'songId')
    },
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
