const server = require('express-graphql')
const CORS = require('micro-cors')()
const { makeExecutableSchema } = require('graphql-tools')

const { typeDefs } = require('./schema')
const resolvers = require('./resolvers')

const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

module.exports = CORS(server({ schema }))
