const requireEsm = require('@std/esm')(module, { esm: 'js' })

const server = requireEsm('./src/server').default

module.exports = server
