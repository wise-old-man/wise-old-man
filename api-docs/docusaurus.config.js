// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Wise Old Man',
  tagline: 'The Open Source Old School Runescape player progress tracker.',
  url: 'https://wiseoldman.net/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'wise-old-man',
  projectName: 'wise-old-man',
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
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/wise-old-man/wise-old-man/tree/master/api-docs/'
        },
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
            label: 'API Docs'
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
        darkTheme: require('prism-react-renderer/themes/dracula')
      }
    })
};

module.exports = config;
