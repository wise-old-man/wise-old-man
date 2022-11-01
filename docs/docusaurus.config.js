// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Wise Old Man - API Documentation',
  tagline:
    'API Documentation for Wise Old Man - the Open Source Old School Runescape player progress tracker.',
  url: 'https://docs.wiseoldman.net/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'wise-old-man',
  projectName: 'wise-old-man',
  deploymentBranch: 'deploymentBranch',
  trailingSlash: false,
  i18n: {
    defaultLocale: 'en',
    locales: ['en']
  },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          breadcrumbs: false,
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/wise-old-man/wise-old-man/tree/master/docs/'
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css')
        }
      })
    ]
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: true,
        respectPrefersColorScheme: false
      },
      navbar: {
        title: 'Wise Old Man',
        logo: {
          alt: 'Wise Old Man Logo',
          src: 'img/logo.png'
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'API Docs (v2)'
          },
          {
            href: 'https://github.com/wise-old-man/wise-old-man',
            label: 'GitHub',
            position: 'right'
          },
          {
            href: 'https://wiseoldman.net/discord',
            label: 'Discord',
            position: 'right'
          }
        ]
      },
      prism: {
        darkTheme: require('prism-react-renderer/themes/vsDark')
      }
    })
};

module.exports = config;
