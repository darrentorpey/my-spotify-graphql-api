# Personal Spotify GraphQL Endpoint

## Example queries

```graphql
query songs($songTitle: String) {
  tracks(having: {danceability: 0.15, valence: 0.1}, title: $songTitle, startsWith: "Wow") {
    id
    name
    playlists
    afCoarse: audio_features_summary(granularity: COARSE) {
      danceability
      speechiness
      acousticness
      instrumentalness
      liveness
      valence
    }
    afMedium: audio_features_summary(granularity: MEDIUM) {
      danceability
      speechiness
      acousticness
      instrumentalness
      liveness
      valence
    }
    afRaw: audio_features {
      danceability
      speechiness
      acousticness
      instrumentalness
      liveness
      valence
      tempo
    }
    artists {
      name
    }
  }
}
```

```graphql
query songs($songTitle: String) {
  tracks(having: {danceability: 0.15, valence: 0.1}, title: $songTitle, startsWith: "Wow") {
    id
    name
    playlists
    audioFeatures: audio_features_summary(granularity: COARSE) {
      danceability
      valence
    }
    artists {
      name
    }
  }
}
```
