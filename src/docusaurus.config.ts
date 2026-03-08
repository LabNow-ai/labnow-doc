import {themes as prismThemes} from 'prism-react-renderer';
import type * as Preset from '@docusaurus/preset-classic';

const github_org = 'LabNow-ai';
const github_repo = 'doc-labnow';
const github_dir = 'src';
const name_brand = 'LabNow';
const ga_tracking_id = 'G-BL1B7QW4VB';
const gtm_container_id = 'GTM-T9X96FS3';
const docsearch_app_id = process.env.DOCSEARCH_APP_ID;
const docsearch_api_key = process.env.DOCSEARCH_API_KEY;
const docsearch_index_name = process.env.DOCSEARCH_INDEX_NAME;

export default {
  title: 'LabNow.ai',
  url: 'https://doc.labnow.ai', // production url of the site

  favicon: 'img/logo.svg',
  tagline: 'One-stop AI and Data Science Platform',

  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config. If you aren't using GitHub pages, you don't need these.
  organizationName: `${github_org}`, // Usually your GitHub org/user name.
  projectName: `${github_repo}`, // Usually your repo name.

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set useful metadata like html lang.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'zh-CN'],
    localeConfigs: {
      'en': {htmlLang: 'en-US'},
      'zh-CN': {htmlLang: 'zh-CN'},
    },
  },
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn"
    },
    mermaid: true,
  },

  presets: [
    [
      'classic',
      {
        docs: {
          path: './i18n/en/docusaurus-plugin-content-docs/current',
          routeBasePath: 'docs',
          sidebarPath: './sidebars.ts',
          editLocalizedFiles: true,
          // Please change this to your repo. Remove this to remove the "edit this page" links.
          editUrl: `https://github.com/${github_org}/${github_repo}/tree/main/${github_dir}/`,
        },
        blog: {
          path: './i18n/en/docusaurus-plugin-content-blog',
          routeBasePath: 'blog',
          showReadingTime: true,
          editLocalizedFiles: true,
          // Please change this to your repo. Remove this to remove the "edit this page" links.
          editUrl: `https://github.com/${github_org}/${github_repo}/tree/main/${github_dir}/`,
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {trackingID: ga_tracking_id, anonymizeIP: false,},
        googleTagManager: {containerId: gtm_container_id},
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      title: `${name_brand}`,
      logo: { alt: 'Logo', src: 'img/logo.svg', },
      items: [
        {type: 'docSidebar', label: 'Tutorial', position: 'left', sidebarId: 'tutorialSidebar',},
        {label: 'Blog', position: 'left',to: '/blog', },
        ...(docsearch_app_id && docsearch_api_key && docsearch_index_name
          ? [{type: 'search', position: 'right'} as const]
          : []),
        {type: 'localeDropdown', position: 'right',},
        {label: 'GitHub', position: 'right', href: `https://github.com/${github_org}/`,},
      ],
    },
    ...(docsearch_app_id && docsearch_api_key && docsearch_index_name
      ? {
          algolia: {
            appId: docsearch_app_id,
            apiKey: docsearch_api_key,
            indexName: docsearch_index_name,
            contextualSearch: true,
          },
        }
      : {}),
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            { label: 'Tutorial', to: '/docs/intro', },
            { label: 'Blog', to: '/blog', },
            { label: 'Home', href: 'https://labnow.ai',},
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'Publish | Medium', href: 'https://medium.com/@labnow',},
            { label: 'Feed | X', href: 'https://x.com/LabNowAi',},
            { label: 'Forum | Discourse', href: 'https://labnow.discourse.group/',},
            { label: 'Chat | Discord', href: 'https://discord.gg/kHUzgQxgbJ',},
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'GitHub', href: `https://github.com/${github_org}`, },
            { label: 'DockerHub Repos', href: `http://hub.docker.com/u/LabNow`, },
            { label: 'Quay.io Repos', href: `https://quay.io/organization/labnow`, },
          ],
        },
      ],
      copyright: `
<div class="footer-contact-email" aria-label="Contact email">
  <img src="/img/contact-labnow.svg" alt="LabNow contact email" loading="lazy" />
</div>
<div>Copyright © 2024-${new Date().getFullYear()} ${name_brand}.</div>
`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};
