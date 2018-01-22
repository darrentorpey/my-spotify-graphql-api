const {buildSchema} = require('graphql')
const server = require('express-graphql')
const CORS = require('micro-cors')()

const playlists = require('./data/playlists.json')

const schema = buildSchema(`
  type Query {
    hello: String
    playlists: [Playlist]
  }

  type Playlist {
    name: String
  }
`)

console.log('playlists[1]', playlists[1])

const rootValue = {
  hello: () => 'Your Playlists',
  playlists: () => playlists,
}

module.exports = CORS(server({ schema, rootValue }))
