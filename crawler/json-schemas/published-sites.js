module.exports = {
  '$schema': 'http://json-schema.org/draft-07/schema#',
  '$id': 'dat://unwalled.garden/published-sites.json',
  'type': 'object',
  'title': 'Published sites',
  'description': 'Sites published by the user.',
  'required': [
    'type'
  ],
  'properties': {
    'type': {
      'type': 'string',
      'title': "The object's type",
      'const': 'unwalled.garden/published-sites'
    },
    'urls': {
      'type': 'array',
      'title': 'The followed URLs',
      'items': {
        'type': 'string',
        'format': 'uri',
        'examples': [
          'dat://beakerbrowser.com'
        ]
      }
    }
  },
  'additionalProperties': false
}