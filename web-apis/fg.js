const { contextBridge } = require('electron')
const DatArchive = require('./fg/dat-archive')
const dbrowserx = require('./fg/dbrowserx')
const experimental = require('./fg/experimental')

exports.setup = function ({rpcAPI}) {
  // setup APIs
  if (['dbrowser:', 'dat:', 'https:'].includes(window.location.protocol) ||
      (window.location.protocol === 'http:' && window.location.hostname === 'localhost')) {
    DatArchive.setupAndExpose(rpcAPI)
  }
  if (['dbrowser:', 'dat:'].includes(window.location.protocol)) {
    contextBridge.exposeInMainWorld('dbrowserx', dbrowserx.setup(rpcAPI))
    contextBridge.exposeInMainWorld('experimental', experimental.setup(rpcAPI))
  }
}
