const { EventTarget, bindEventStream, fromEventStream } = require('./event-target')
const errors = require('dbrowser-error-messages')

const archivesManifest = require('../manifests/internal/archives')
const beakerBrowserManifest = require('../manifests/internal/browser')
const bookmarksManifest = require('../manifests/internal/bookmarks')
const downloadsManifest = require('../manifests/internal/downloads')
const historyManifest = require('../manifests/internal/history')
const sitedataManifest = require('../manifests/internal/sitedata')
const watchlistManifest = require('../manifests/internal/watchlist')

exports.setup = function (rpc) {
  const dbrowserx = {}
  const opts = { timeout: false, errors }

  // internal only
  if (window.location.protocol === 'dbrowser:') {
    const archivesRPC = rpc.importAPI('archives', archivesManifest, opts)
    const beakerBrowserRPC = rpc.importAPI('dbrowser-x', beakerBrowserManifest, opts)
    const bookmarksRPC = rpc.importAPI('bookmarks', bookmarksManifest, opts)
    const downloadsRPC = rpc.importAPI('downloads', downloadsManifest, opts)
    const historyRPC = rpc.importAPI('history', historyManifest, opts)
    const sitedataRPC = rpc.importAPI('sitedata', sitedataManifest, opts)
    const watchlistRPC = rpc.importAPI('watchlist', watchlistManifest, opts)

    // dbrowserx.archives
    dbrowserx.archives = new EventTarget()
    dbrowserx.archives.status = archivesRPC.status
    dbrowserx.archives.add = archivesRPC.add
    dbrowserx.archives.setUserSettings = archivesRPC.setUserSettings
    dbrowserx.archives.remove = archivesRPC.remove
    dbrowserx.archives.bulkRemove = archivesRPC.bulkRemove
    dbrowserx.archives.delete = archivesRPC.delete
    dbrowserx.archives.list = archivesRPC.list
    dbrowserx.archives.validateLocalSyncPath = archivesRPC.validateLocalSyncPath
    dbrowserx.archives.setLocalSyncPath = archivesRPC.setLocalSyncPath
    dbrowserx.archives.ensureLocalSyncFinished = archivesRPC.ensureLocalSyncFinished
    dbrowserx.archives.diffLocalSyncPathListing = archivesRPC.diffLocalSyncPathListing
    dbrowserx.archives.diffLocalSyncPathFile = archivesRPC.diffLocalSyncPathFile
    dbrowserx.archives.publishLocalSyncPathListing = archivesRPC.publishLocalSyncPathListing
    dbrowserx.archives.revertLocalSyncPathListing = archivesRPC.revertLocalSyncPathListing
    dbrowserx.archives.getDraftInfo = archivesRPC.getDraftInfo
    dbrowserx.archives.listDrafts = archivesRPC.listDrafts
    dbrowserx.archives.addDraft = archivesRPC.addDraft
    dbrowserx.archives.removeDraft = archivesRPC.removeDraft
    dbrowserx.archives.getTemplate = archivesRPC.getTemplate
    dbrowserx.archives.listTemplates = archivesRPC.listTemplates
    dbrowserx.archives.putTemplate = archivesRPC.putTemplate
    dbrowserx.archives.removeTemplate = archivesRPC.removeTemplate
    dbrowserx.archives.touch = archivesRPC.touch
    dbrowserx.archives.clearFileCache = archivesRPC.clearFileCache
    dbrowserx.archives.clearGarbage = archivesRPC.clearGarbage
    dbrowserx.archives.clearDnsCache = archivesRPC.clearDnsCache
    dbrowserx.archives.getDebugLog = archivesRPC.getDebugLog
    dbrowserx.archives.createDebugStream = () => fromEventStream(archivesRPC.createDebugStream())
    window.addEventListener('load', () => {
      try {
        bindEventStream(archivesRPC.createEventStream(), dbrowserx.archives)
      } catch (e) {
        // permissions error
      }
    })

    // dbrowserx.browser
    dbrowserx.browser = {}
    dbrowserx.browser.createEventsStream = () => fromEventStream(beakerBrowserRPC.createEventsStream())
    dbrowserx.browser.getInfo = beakerBrowserRPC.getInfo
    dbrowserx.browser.checkForUpdates = beakerBrowserRPC.checkForUpdates
    dbrowserx.browser.restartBrowser = beakerBrowserRPC.restartBrowser
    dbrowserx.browser.getSetting = beakerBrowserRPC.getSetting
    dbrowserx.browser.getSettings = beakerBrowserRPC.getSettings
    dbrowserx.browser.setSetting = beakerBrowserRPC.setSetting
    dbrowserx.browser.getUserSetupStatus = beakerBrowserRPC.getUserSetupStatus
    dbrowserx.browser.setUserSetupStatus = beakerBrowserRPC.setUserSetupStatus
    dbrowserx.browser.getDefaultLocalPath = beakerBrowserRPC.getDefaultLocalPath
    dbrowserx.browser.setStartPageBackgroundImage = beakerBrowserRPC.setStartPageBackgroundImage
    dbrowserx.browser.getDefaultProtocolSettings = beakerBrowserRPC.getDefaultProtocolSettings
    dbrowserx.browser.setAsDefaultProtocolClient = beakerBrowserRPC.setAsDefaultProtocolClient
    dbrowserx.browser.removeAsDefaultProtocolClient = beakerBrowserRPC.removeAsDefaultProtocolClient
    dbrowserx.browser.fetchBody = beakerBrowserRPC.fetchBody
    dbrowserx.browser.downloadURL = beakerBrowserRPC.downloadURL
    dbrowserx.browser.getResourceContentType = beakerBrowserRPC.getResourceContentType
    dbrowserx.browser.listBuiltinFavicons = beakerBrowserRPC.listBuiltinFavicons
    dbrowserx.browser.getBuiltinFavicon = beakerBrowserRPC.getBuiltinFavicon
    dbrowserx.browser.uploadFavicon = beakerBrowserRPC.uploadFavicon
    dbrowserx.browser.imageToIco = beakerBrowserRPC.imageToIco
    dbrowserx.browser.setWindowDimensions = beakerBrowserRPC.setWindowDimensions
    dbrowserx.browser.showOpenDialog = beakerBrowserRPC.showOpenDialog
    dbrowserx.browser.showContextMenu = beakerBrowserRPC.showContextMenu
    dbrowserx.browser.openUrl = beakerBrowserRPC.openUrl
    dbrowserx.browser.openFolder = beakerBrowserRPC.openFolder
    dbrowserx.browser.doWebcontentsCmd = beakerBrowserRPC.doWebcontentsCmd
    dbrowserx.browser.doTest = beakerBrowserRPC.doTest
    dbrowserx.browser.closeModal = beakerBrowserRPC.closeModal

    // dbrowserx.bookmarks
    dbrowserx.bookmarks = {}
    dbrowserx.bookmarks.getBookmark = bookmarksRPC.getBookmark
    dbrowserx.bookmarks.isBookmarked = bookmarksRPC.isBookmarked
    dbrowserx.bookmarks.bookmarkPublic = bookmarksRPC.bookmarkPublic
    dbrowserx.bookmarks.unbookmarkPublic = bookmarksRPC.unbookmarkPublic
    dbrowserx.bookmarks.listPublicBookmarks = bookmarksRPC.listPublicBookmarks
    dbrowserx.bookmarks.setBookmarkPinned = bookmarksRPC.setBookmarkPinned
    dbrowserx.bookmarks.setBookmarkPinOrder = bookmarksRPC.setBookmarkPinOrder
    dbrowserx.bookmarks.listPinnedBookmarks = bookmarksRPC.listPinnedBookmarks
    dbrowserx.bookmarks.bookmarkPrivate = bookmarksRPC.bookmarkPrivate
    dbrowserx.bookmarks.unbookmarkPrivate = bookmarksRPC.unbookmarkPrivate
    dbrowserx.bookmarks.listPrivateBookmarks = bookmarksRPC.listPrivateBookmarks
    dbrowserx.bookmarks.listBookmarkTags = bookmarksRPC.listBookmarkTags

    // dbrowserx.downloads
    dbrowserx.downloads = {}
    dbrowserx.downloads.getDownloads = downloadsRPC.getDownloads
    dbrowserx.downloads.pause = downloadsRPC.pause
    dbrowserx.downloads.resume = downloadsRPC.resume
    dbrowserx.downloads.cancel = downloadsRPC.cancel
    dbrowserx.downloads.remove = downloadsRPC.remove
    dbrowserx.downloads.open = downloadsRPC.open
    dbrowserx.downloads.showInFolder = downloadsRPC.showInFolder
    dbrowserx.downloads.createEventsStream = () => fromEventStream(downloadsRPC.createEventsStream())

    // dbrowserx.history
    dbrowserx.history = {}
    dbrowserx.history.addVisit = historyRPC.addVisit
    dbrowserx.history.getVisitHistory = historyRPC.getVisitHistory
    dbrowserx.history.getMostVisited = historyRPC.getMostVisited
    dbrowserx.history.search = historyRPC.search
    dbrowserx.history.removeVisit = historyRPC.removeVisit
    dbrowserx.history.removeAllVisits = historyRPC.removeAllVisits
    dbrowserx.history.removeVisitsAfter = historyRPC.removeVisitsAfter

    // dbrowserx.sitedata
    dbrowserx.sitedata = {}
    dbrowserx.sitedata.get = sitedataRPC.get
    dbrowserx.sitedata.set = sitedataRPC.set
    dbrowserx.sitedata.getPermissions = sitedataRPC.getPermissions
    dbrowserx.sitedata.getAppPermissions = sitedataRPC.getAppPermissions
    dbrowserx.sitedata.getPermission = sitedataRPC.getPermission
    dbrowserx.sitedata.setPermission = sitedataRPC.setPermission
    dbrowserx.sitedata.setAppPermissions = sitedataRPC.setAppPermissions
    dbrowserx.sitedata.clearPermission = sitedataRPC.clearPermission
    dbrowserx.sitedata.clearPermissionAllOrigins = sitedataRPC.clearPermissionAllOrigins

    // dbrowserx.watchlist
    dbrowserx.watchlist = {}
    dbrowserx.watchlist.add = watchlistRPC.add
    dbrowserx.watchlist.list = watchlistRPC.list
    dbrowserx.watchlist.update = watchlistRPC.update
    dbrowserx.watchlist.remove = watchlistRPC.remove
    dbrowserx.watchlist.createEventsStream = () => fromEventStream(watchlistRPC.createEventsStream())
  }

  return dbrowserx
}
