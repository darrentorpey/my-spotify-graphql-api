exports.typeDefs = `
  type Query {
    playlists: [Playlist]
    tracks(
      startsWith: String
      having: TrackFilter
      title: String
    ): [Track]
  }

  input TrackFilter {
    danceability: Float
    valence: Float
  }

  """
  A playlist
  """
  type Playlist {
    name: String
    tracks: [Track]
  }

  type Track {
    id: String
    added_at: String
    name: String
    artists: [Artist]
    playlists: [String]
    audio_features: AudioFeatures
    audio_features_summary(granularity: Granularity): AudioFeaturesSummary
  }

  """
  Audio features for a track such as "danceability"
  """
	type AudioFeatures {
		danceability: Float
		speechiness: Float
		acousticness: Float
		instrumentalness: Float
		liveness: Float
		valence: Float
		tempo: Float
	}

  """
  Audio features for a track such as "danceability"
  """
	type AudioFeaturesSummary {
		danceability: String
		speechiness: String
		acousticness: String
		instrumentalness: String
		liveness: String
		valence: String
		tempo: String
	}

	type Artist {
		name: String
  }

  enum Granularity {
    FINE
    MEDIUM
    COARSE
  }
`
