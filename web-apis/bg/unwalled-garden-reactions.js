const globals = require('../../globals')
const assert = require('assert')
const {URL} = require('url')
const dat = require('../../dat')
const archivesDb = require('../../dbs/archives')
const reactionsAPI = require('../../uwg/reactions')
const sessionPerms = require('../../lib/session-perms')

// typedefs
// =

/**
 * @typedef {import('../../uwg/reactions').Reaction} Reaction
 *
 * @typedef {Object} ReactionAuthorPublicAPIRecord
 * @prop {string} url
 * @prop {string} title
 * @prop {string} description
 * @prop {string[]} type
 * @prop {boolean} isOwner
 *
 * @typedef {Object} TopicReactionsPublicAPIRecord
 * @prop {string} topic
 * @prop {string} emoji
 * @prop {ReactionAuthorPublicAPIRecord[]} authors
 *
 * @typedef {Object} ReactionPublicAPIRecord
 * @prop {string} url
 * @prop {string} topic
 * @prop {string[]} emojis
 * @prop {ReactionAuthorPublicAPIRecord} author
 * @prop {string} visibility
 */

// exported api
// =

module.exports = {
  /**
   * @param {Object} [opts]
   * @param {Object} [opts.filters]
   * @param {string|string[]} [opts.filters.authors]
   * @param {string|string[]} [opts.filters.topics]
   * @param {string} [opts.filters.visibility]
   * @param {string} [opts.sortBy]
   * @param {number} [opts.offset=0]
   * @param {number} [opts.limit]
   * @param {boolean} [opts.reverse]
   * @returns {Promise<ReactionPublicAPIRecord[]>}
   */
  async list (opts) {
    await sessionPerms.assertCan(this.sender, 'unwalled.garden/api/reactions', 'read')
    opts = (opts && typeof opts === 'object') ? opts : {}
    if (opts && 'sortBy' in opts) assert(typeof opts.sortBy === 'string', 'SortBy must be a string')
    if (opts && 'offset' in opts) assert(typeof opts.offset === 'number', 'Offset must be a number')
    if (opts && 'limit' in opts) assert(typeof opts.limit === 'number', 'Limit must be a number')
    if (opts && 'reverse' in opts) assert(typeof opts.reverse === 'boolean', 'Reverse must be a boolean')
    if (opts && opts.filters) {
      if ('authors' in opts.filters) {
        if (Array.isArray(opts.filters.authors)) {
          assert(opts.filters.authors.every(v => typeof v === 'string'), 'Authors filter must be a string or array of strings')
        } else {
          assert(typeof opts.filters.authors === 'string', 'Authors filter must be a string or array of strings')
        }
      }
      if ('topics' in opts.filters) {
        if (Array.isArray(opts.filters.topics)) {
          assert(opts.filters.topics.every(v => typeof v === 'string'), 'Topics filter must be a string or array of strings')
        } else {
          assert(typeof opts.filters.topics === 'string', 'Topics filter must be a string or array of strings')
        }
      }
      if ('visibility' in opts.filters) {
        assert(typeof opts.filters.visibility === 'string', 'Visibility filter must be a string')
      }
    }
    var reactions = await reactionsAPI.list(opts)
    return Promise.all(reactions.map(massageReactionRecord))
  },

  /**
   * @param {string} topic
   * @param {Object} [opts]
   * @param {string|string[]} [opts.filters.authors]
   * @param {string} [opts.filters.visibility]
   * @returns {Promise<TopicReactionsPublicAPIRecord[]>}
   */
  async tabulate (topic, opts) {
    await sessionPerms.assertCan(this.sender, 'unwalled.garden/api/reactions', 'read')
    topic = normalizeTopicUrl(topic)
    assert(topic && typeof topic === 'string', 'The `topic` parameter must be a valid URL')
    opts = (opts && typeof opts === 'object') ? opts : {}
    if (opts && opts.filters) {
      if ('authors' in opts.filters) {
        if (Array.isArray(opts.filters.authors)) {
          assert(opts.filters.authors.every(v => typeof v === 'string'), 'Authors filter must be a string or array of strings')
        } else {
          assert(typeof opts.filters.authors === 'string', 'Authors filter must be a string or array of strings')
        }
      }
      if ('visibility' in opts.filters) {
        assert(typeof opts.filters.visibility === 'string', 'Visibility filter must be a string')
      }
    }

    var reactions = await reactionsAPI.tabulate(topic, opts)
    return Promise.all(reactions.map(async (reaction) => ({
      topic,
      emoji: reaction.emoji,
      authors: await Promise.all(reaction.authors.map(async (url) => {
        var desc = await archivesDb.getMeta(url)
        return {
          url: desc.url,
          title: desc.title,
          description: desc.description,
          type: /** @type string[] */(desc.type),
          isOwner: desc.isOwner
        }
      }))
    })))
  },

  /**
   * @param {string} topic
   * @param {string} emoji
   * @returns {Promise<void>}
   */
  async add (topic, emoji) {
    await sessionPerms.assertCan(this.sender, 'unwalled.garden/api/reactions', 'write')
    var userArchive = await sessionPerms.getSessionUserArchive(this.sender)

    topic = normalizeTopicUrl(topic)
    assert(topic && typeof topic === 'string', 'The `topic` parameter must be a valid URL')

    await reactionsAPI.add(userArchive, topic, emoji)
  },

  /**
   * @param {string} topic
   * @param {string} emoji
   * @returns {Promise<void>}
   */
  async remove (topic, emoji) {
    await sessionPerms.assertCan(this.sender, 'unwalled.garden/api/reactions', 'write')
    var userArchive = await sessionPerms.getSessionUserArchive(this.sender)

    topic = normalizeTopicUrl(topic)
    assert(topic && typeof topic === 'string', 'The `topic` parameter must be a valid URL')

    await reactionsAPI.remove(userArchive, topic, emoji)
  }
}

// internal methods
// =

function normalizeTopicUrl (url) {
  try {
    url = new URL(url)
    return (url.protocol + '//' + url.hostname + url.pathname + url.search + url.hash).replace(/([/]$)/g, '')
  } catch (e) {}
  return null
}

/**
 * @param {Reaction} reaction
 * @returns {Promise<ReactionPublicAPIRecord>}
 */
async function massageReactionRecord (reaction) {
  var desc = await archivesDb.getMeta(reaction.author)
  return {
    url: reaction.recordUrl,
    topic: reaction.topic,
    emojis: reaction.emojis,
    author: {
      url: desc.url,
      title: desc.title,
      description: desc.description,
      type: /** @type string[] */(desc.type),
      isOwner: desc.isOwner
    },
    visibility: reaction.visibility
  }
}