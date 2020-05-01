export default {
  title: 'Introduction',
  url: '/docs',
  description:
    'Welcome to the documentation page of the Wise Old Man REST API. \
    This API is Open source and is in continous development.',
  content: [
    {
      type: 'link',
      label: 'Contribute to this project on github:',
      url: 'https://github.com/psikoi/wise-old-man'
    },
    {
      type: 'link',
      label: 'Talk to us on discord:',
      url: 'https://discord.gg/Ky5vNt2'
    },
    {
      type: 'title',
      text: 'Suggestions and bugs'
    },
    {
      type: 'link',
      label:
        'Have a suggestion or a bug to report? Please use Github \
        issues for that, through the link below',
      url: 'https://github.com/psikoi/wise-old-man/issues'
    },

    {
      type: 'title',
      text: 'Base url'
    },
    {
      type: 'code',
      content: 'https://wiseoldman.net/api'
    },
    {
      type: 'paragraph',
      content: 'All routes described in this documentation are to be used with the /api prefix.'
    },
    {
      type: 'paragraph',
      content: 'Example:'
    },
    {
      type: 'code',
      content: '/competitions'
    },
    {
      type: 'paragraph',
      content: 'Should be accessed as:'
    },
    {
      type: 'code',
      content: 'https://wiseoldman.net/api/competitions'
    },
    {
      type: 'title',
      text: 'Rate limiting'
    },
    {
      type: 'paragraph',
      content:
        'Some rate limiting has been applied to the api, currently \
        you can do up to 200 requests every 5 minutes. (per IP)'
    }
  ]
};
