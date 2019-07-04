const {URL} = require('url')
const globals = require('../../globals')
const dat = require('../../dat')
const appPerms = require('../../lib/app-perms')
const sitedataDb = require('../../dbs/sitedata')
const knex = require('../../lib/knex')
const db = require('../../dbs/profile-data-db')

// typedefs
// =

/**
 * @typedef {import('../../users').User} User
 *
 * @typedef {Object} WebAPIApplicationPermission
 * @prop {string} id
 * @prop {string[]} caps
 * @prop {string} description
 *
 * @typedef {Object} WebAPIApplication
 * @prop {string} url
 * @prop {string} title
 * @prop {string} description
 * @prop {WebAPIApplicationPermission[]} permissions
 * @prop {boolean} installed
 * @prop {boolean} enabled
 * @prop {string} installedAt
 */

// exported api
// =

module.exports = {
  /**
   * @param {string} url
   * @returns {Promise<WebAPIApplication>}
   */
  async getInfo (url) {
    url = await toDatOrigin(url)
    var archiveInfo = await dat.library.getArchiveInfo(url)
    return massageArchiveInfo(archiveInfo)
  },

  /**
   * @param {string} url
   * @returns {Promise<void>}
   */
  async install (url) {
    url = await toDatOrigin(url)
    var userId = await getSessionUserId(this.sender)
    var archiveInfo = await dat.library.getArchiveInfo(url)
    var record = await db.get(knex('installed_applications').where({userId, url}))
    if (!record) {
      await db.run(knex('installed_applications').insert({
        userId,
        enabled: 1,
        url,
        createdAt: Date.now()
      }))
    }
    await sitedataDb.setAppPermissions(url, getArchivePerms(archiveInfo))
  },

  /**
   * @returns {Promise<WebAPIApplication[]>}
   */
  async list () {
    var userId = await getSessionUserId(this.sender)
    var records = await db.all(knex('installed_applications').where({userId}))
    await Promise.all(records.map(async (record) => {
      var archiveInfo = await dat.library.getArchiveInfo(record.url)
      record.title = archiveInfo.title
      record.description = archiveInfo.description
      record.permissions = await sitedataDb.getAppPermissions(record.url)
    }))
    return records.map(massageAppRecord)
  },

  /**
   * @param {string} url
   * @returns {Promise<void>}
   */
  async enable (url) {
    url = await toDatOrigin(url)
    var userId = await getSessionUserId(this.sender)
    await db.run(knex('installed_applications').update({enabled: 1}).where({userId, url}))
  },

  /**
   * @param {string} url
   * @returns {Promise<void>}
   */
  async disable (url) {
    url = await toDatOrigin(url)
    var userId = await getSessionUserId(this.sender)
    await db.run(knex('installed_applications').update({enabled: 0}).where({userId, url}))
  },

  /**
   * @param {string} url
   * @returns {Promise<void>}
   */
  async uninstall (url) {
    url = await toDatOrigin(url)
    var userId = await getSessionUserId(this.sender)
    await db.run(knex('installed_applications').delete().where({userId, url}))
  }
}

// internal methods
// =

/**
 * @param {string} url
 * @returns {Promise<string>}
 */
async function toDatOrigin (url) {
  try {
    var urlParsed = new URL(url)
  } catch (e) {
    throw new Error('Invalid URL: ' + url)
  }
  if (urlParsed.protocol !== 'dat:') throw new Error('Can only install dat applications')
  urlParsed.hostname = await dat.dns.resolveName(urlParsed.hostname)
  return urlParsed.protocol + '//' + urlParsed.hostname
}

async function getSessionUserId (sender) {
  var userSession = globals.userSessionAPI.getFor(sender)
  if (!userSession) throw new Error('No active user session')
  var record = await db.get(knex('users').where({url: userSession.url}))
  return record.id
}

function getArchivePerms (archiveInfo) {
  try {
    return archiveInfo.manifest['unwalled.garden/application'].permissions
  } catch (e) {
    console.debug('No permissions found on application', archiveInfo.manifest)
    return []
  }
}

/**
 * @param {Object} archiveInfo
 * @param {Object} record
 * @returns {WebAPIApplication}
 */
function massageArchiveInfo (archiveInfo, record) {
  return {
    url: archiveInfo.url,
    title: archiveInfo.title,
    description: archiveInfo.description,
    permissions: Object.entries(getArchivePerms(archiveInfo)).map(([id, caps]) => ({
      id,
      caps,
      description: appPerms.describePerm(id, caps)
    })),
    installed: !!record,
    enabled: Boolean(record && record.enabled),
    installedAt: record ? (new Date(record.createdAt)).toISOString() : null
  }
}

/**
 * @param {Object} record
 * @returns {WebAPIApplication}
 */
function massageAppRecord (record) {
  return {
    url: record.url,
    title: record.title,
    description: record.description,
    permissions: Object.entries(record.permissions).map(([id, caps]) => ({
      id,
      caps,
      description: appPerms.describePerm(id, caps)
    })),
    installed: true,
    enabled: Boolean(record.enabled),
    installedAt: (new Date(record.createdAt)).toISOString()
  }
}