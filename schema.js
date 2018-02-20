export default `
  type Query {
    myPlaylists(offset: Int): [Playlist]
    tracks(
      startsWith: String
      having: TrackFilter
      title: String
    ): [Track]
    lyric_sheet(url: String, id: String): LyricSheet
    lyric_sheets(id: String): [LyricSheet]
    recent_tracks: [Track]
  }

  input TrackFilter {
    danceability: Float
    valence: Float
  }

  type LyricSheet {
    text: String
    title: String
    source: String
  }

  """
  A playlist
  """
  type Playlist {
    id: String
    href: String
    owner: Owner
    name: String
    tracks: [Track]
  }

  type Owner {
    display_name: String
    id: String
  }

  type Track {
    id: String
    audio_features: AudioFeatures
    audio_features_summary(granularity: Granularity): AudioFeaturesSummary
    added_at: String
    name: String
    artists: [Artist]
    playlists: [String]
    track_number: Int
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
