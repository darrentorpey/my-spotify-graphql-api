import server from 'express-graphql'
import CORS from 'micro-cors'
import GraphQlTools from 'graphql-tools'

import typeDefs from './schema'
import resolvers from './resolvers'

const schema = GraphQlTools.makeExecutableSchema({
  typeDefs,
  resolvers,
})

export default CORS()(server({ schema }))
