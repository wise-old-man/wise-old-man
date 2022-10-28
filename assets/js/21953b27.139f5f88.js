"use strict";(self.webpackChunkapi_docs=self.webpackChunkapi_docs||[]).push([[104],{3905:(e,t,a)=>{a.d(t,{Zo:()=>m,kt:()=>c});var r=a(7294);function n(e,t,a){return t in e?Object.defineProperty(e,t,{value:a,enumerable:!0,configurable:!0,writable:!0}):e[t]=a,e}function l(e,t){var a=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),a.push.apply(a,r)}return a}function i(e){for(var t=1;t<arguments.length;t++){var a=null!=arguments[t]?arguments[t]:{};t%2?l(Object(a),!0).forEach((function(t){n(e,t,a[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(a)):l(Object(a)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(a,t))}))}return e}function p(e,t){if(null==e)return{};var a,r,n=function(e,t){if(null==e)return{};var a,r,n={},l=Object.keys(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||(n[a]=e[a]);return n}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)a=l[r],t.indexOf(a)>=0||Object.prototype.propertyIsEnumerable.call(e,a)&&(n[a]=e[a])}return n}var d=r.createContext({}),o=function(e){var t=r.useContext(d),a=t;return e&&(a="function"==typeof e?e(t):i(i({},t),e)),a},m=function(e){var t=o(e.components);return r.createElement(d.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},k=r.forwardRef((function(e,t){var a=e.components,n=e.mdxType,l=e.originalType,d=e.parentName,m=p(e,["components","mdxType","originalType","parentName"]),k=o(a),c=n,y=k["".concat(d,".").concat(c)]||k[c]||s[c]||l;return a?r.createElement(y,i(i({ref:t},m),{},{components:a})):r.createElement(y,i({ref:t},m))}));function c(e,t){var a=arguments,n=t&&t.mdxType;if("string"==typeof e||n){var l=a.length,i=new Array(l);i[0]=k;var p={};for(var d in t)hasOwnProperty.call(t,d)&&(p[d]=t[d]);p.originalType=e,p.mdxType="string"==typeof e?e:n,i[1]=p;for(var o=2;o<l;o++)i[o]=a[o];return r.createElement.apply(null,i)}return r.createElement.apply(null,a)}k.displayName="MDXCreateElement"},6543:(e,t,a)=>{a.r(t),a.d(t,{assets:()=>d,contentTitle:()=>i,default:()=>s,frontMatter:()=>l,metadata:()=>p,toc:()=>o});var r=a(7462),n=(a(7294),a(3905));const l={title:"Player Types & Entities",sidebar_position:1},i="Player Types & Entities",p={unversionedId:"players-api/player-type-definitions",id:"players-api/player-type-definitions",title:"Player Types & Entities",description:"(Enum) Player Type",source:"@site/docs/players-api/player-type-definitions.mdx",sourceDirName:"players-api",slug:"/players-api/player-type-definitions",permalink:"/docs/players-api/player-type-definitions",draft:!1,editUrl:"https://github.com/wise-old-man/wise-old-man/tree/master/api-docs/docs/players-api/player-type-definitions.mdx",tags:[],version:"current",sidebarPosition:1,frontMatter:{title:"Player Types & Entities",sidebar_position:1},sidebar:"sidebar",previous:{title:"Players API",permalink:"/docs/category/players-api"},next:{title:"Player Endpoints",permalink:"/docs/players-api/player-endpoints"}},d={},o=[{value:"<code>(Enum)</code> Player Type",id:"enum-player-type",level:3},{value:"<code>(Enum)</code> Player Build",id:"enum-player-build",level:3},{value:"<code>(Enum)</code> Country",id:"enum-country",level:3},{value:"<code>(Enum)</code> Achievement Measure",id:"enum-achievement-measure",level:3},{value:"<code>(Object)</code> Snapshot Data Values",id:"object-snapshot-data-values",level:3},{value:"<code>(Object)</code> Snapshot",id:"object-snapshot",level:3},{value:"<code>(Object)</code> Player",id:"object-player",level:3},{value:"<code>(Object)</code> Player Details",id:"object-player-details",level:3},{value:"<code>(Object)</code> Achievement",id:"object-achievement",level:3},{value:"<code>(Object)</code> Player Achievement Progress",id:"object-player-achievement-progress",level:3}],m={toc:o};function s(e){let{components:t,...a}=e;return(0,n.kt)("wrapper",(0,r.Z)({},m,a,{components:t,mdxType:"MDXLayout"}),(0,n.kt)("h1",{id:"player-types--entities"},"Player Types & Entities"),(0,n.kt)("br",null),(0,n.kt)("h3",{id:"enum-player-type"},(0,n.kt)("inlineCode",{parentName:"h3"},"(Enum)")," Player Type"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-bash"},"'unknown', 'regular', 'ironman', 'hardcore', 'ultimate', 'fresh_start'\n")),(0,n.kt)("br",null),(0,n.kt)("h3",{id:"enum-player-build"},(0,n.kt)("inlineCode",{parentName:"h3"},"(Enum)")," Player Build"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-bash"},"'main', 'f2p', 'lvl3', 'zerker', 'def1', 'hp10'\n")),(0,n.kt)("br",null),(0,n.kt)("h3",{id:"enum-country"},(0,n.kt)("inlineCode",{parentName:"h3"},"(Enum)")," Country"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-bash"},"'AD', 'AE', 'AF', 'AG', 'AI', 'AL', 'AM', 'AO', 'AQ', 'AR', 'AS', 'AT', 'AU', 'AW', 'AX', 'AZ', 'BA', 'BB', 'BD', 'BE', 'BF', 'BG', 'BH', 'BI', 'BJ', 'BL', 'BM', 'BN', 'BO', 'BQ', 'BR', 'BS', 'BT', 'BV', 'BW', 'BY', 'BZ', 'CA', 'CC', 'CD', 'CF', 'CG', 'CH', 'CI', 'CK', 'CL', 'CM', 'CN', 'CO', 'CR', 'CU', 'CV', 'CW', 'CX', 'CY', 'CZ', 'DE', 'DJ', 'DK', 'DM', 'DO', 'DZ', 'EC', 'EE', 'EG', 'EH', 'ER', 'ES', 'ET', 'FI', 'FJ', 'FK', 'FM', 'FO', 'FR', 'GA', 'GB', 'GD', 'GE', 'GF', 'GG', 'GH', 'GI', 'GL', 'GM', 'GN', 'GP', 'GQ', 'GR', 'GS', 'GT', 'GU', 'GW', 'GY', 'HK', 'HM', 'HN', 'HR', 'HT', 'HU', 'ID', 'IE', 'IL', 'IM', 'IN', 'IO', 'IQ', 'IR', 'IS', 'IT', 'JE', 'JM', 'JO', 'JP', 'KE', 'KG', 'KH', 'KI', 'KM', 'KN', 'KP', 'KR', 'KW', 'KY', 'KZ', 'LA', 'LB', 'LC', 'LI', 'LK', 'LR', 'LS', 'LT', 'LU', 'LV', 'LY', 'MA', 'MC', 'MD', 'ME', 'MF', 'MG', 'MH', 'MK', 'ML', 'MM', 'MN', 'MO', 'MP', 'MQ', 'MR', 'MS', 'MT', 'MU', 'MV', 'MW', 'MX', 'MY', 'MZ', 'NA', 'NC', 'NE', 'NF', 'NG', 'NI', 'NL', 'NO', 'NP', 'NR', 'NU', 'NZ', 'OM', 'PA', 'PE', 'PF', 'PG', 'PH', 'PK', 'PL', 'PM', 'PN', 'PR', 'PS', 'PT', 'PW', 'PY', 'QA', 'RE', 'RO', 'RS', 'RU', 'RW', 'SA', 'SB', 'SC', 'SD', 'SE', 'SG', 'SH', 'SI', 'SJ', 'SK', 'SL', 'SM', 'SN', 'SO', 'SR', 'SS', 'ST', 'SV', 'SX', 'SY', 'SZ', 'TC', 'TD', 'TF', 'TG', 'TH', 'TJ', 'TK', 'TL', 'TM', 'TN', 'TO', 'TR', 'TT', 'TV', 'TW', 'TZ', 'UA', 'UG', 'UM', 'US', 'UY', 'UZ', 'VA', 'VC', 'VE', 'VG', 'VI', 'VN', 'VU', 'WF', 'WS', 'YE', 'YT', 'ZA', 'ZM', 'ZW',\n")),(0,n.kt)("br",null),(0,n.kt)("h3",{id:"enum-achievement-measure"},(0,n.kt)("inlineCode",{parentName:"h3"},"(Enum)")," Achievement Measure"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-bash"},"'levels', 'experience', 'kills', 'score', 'value'\n")),(0,n.kt)("br",null),(0,n.kt)("h3",{id:"object-snapshot-data-values"},(0,n.kt)("inlineCode",{parentName:"h3"},"(Object)")," Snapshot Data Values"),(0,n.kt)("pre",null,(0,n.kt)("code",{parentName:"pre",className:"language-typescript"},'{\n  skills: {\n    attack: {\n        metric: "attack",\n        ehp: number,\n        rank: number,\n        level: number,\n        experience: number\n    },\n    // ... etc for all skills\n  },\n  bosses: {\n    abyssal_sire: {\n        metric: "abyssal_sire",\n        ehb: number,\n        rank: number,\n        kills: number\n    },\n    // ... etc for all bosses\n  },\n  activities: {\n    bounty_hunter_hunter: {\n        metric: "bounty_hunter_hunter",\n        rank: number,\n        score: number\n    },\n    // ... etc for all activities\n  },\n  computed: {\n    ehp: {\n        metric: "ehp",\n        rank: number,\n        value: number\n    },\n    // ... etc for all computed metrics\n  }\n}\n')),(0,n.kt)("br",null),(0,n.kt)("h3",{id:"object-snapshot"},(0,n.kt)("inlineCode",{parentName:"h3"},"(Object)")," Snapshot"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Field"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"id"),(0,n.kt)("td",{parentName:"tr",align:"left"},"integer"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The snapshot's unique ID.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"playerId"),(0,n.kt)("td",{parentName:"tr",align:"left"},"integer"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The snapshot's parent player ID.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"createdAt"),(0,n.kt)("td",{parentName:"tr",align:"left"},"date"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The snapshot's creaton date.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"importedAt"),(0,n.kt)("td",{parentName:"tr",align:"left"},"date?"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The date at which the snapshot was imported at.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"data"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/docs/players-api/player-type-definitions#object-snapshot-data-values"},"Snapshot Data Values")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The exp / kc / rank / etc values for each skill, boss, activity and computed metric.")))),(0,n.kt)("br",null),(0,n.kt)("h3",{id:"object-player"},(0,n.kt)("inlineCode",{parentName:"h3"},"(Object)")," Player"),(0,n.kt)("admonition",{type:"note"},(0,n.kt)("p",{parentName:"admonition"},"Not to be confused with ",(0,n.kt)("a",{parentName:"p",href:"/docs/players-api/player-type-definitions#object-player-details"},"Player Details"),", which extends ",(0,n.kt)("inlineCode",{parentName:"p"},"Player"),".")),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Field"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"id"),(0,n.kt)("td",{parentName:"tr",align:"left"},"integer"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's unique ID.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"username"),(0,n.kt)("td",{parentName:"tr",align:"left"},"string"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's usernam. (lowercase 1-12 characters)")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"displayName"),(0,n.kt)("td",{parentName:"tr",align:"left"},"string"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's display name, very similar to ",(0,n.kt)("inlineCode",{parentName:"td"},"username"),", except it supports capitalization. (1-12 characters)")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"type"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/docs/players-api/player-type-definitions#enum-player-type"},"PlayerType")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's account type. (Default: ",(0,n.kt)("inlineCode",{parentName:"td"},"unknown"),")")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"build"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/docs/players-api/player-type-definitions#enum-player-build"},"PlayerBuild")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's account build. (Default: ",(0,n.kt)("inlineCode",{parentName:"td"},"main"),")")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"country"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/docs/players-api/player-type-definitions#enum-country"},"Country"),"?"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's country of origin.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"flagged"),(0,n.kt)("td",{parentName:"tr",align:"left"},"boolean"),(0,n.kt)("td",{parentName:"tr",align:"left"},"Whether the player is flagged for having an invalid snapshot history. (Default: ",(0,n.kt)("inlineCode",{parentName:"td"},"false"),")")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"exp"),(0,n.kt)("td",{parentName:"tr",align:"left"},"integer"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's overall experience.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"ehp"),(0,n.kt)("td",{parentName:"tr",align:"left"},"float"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's (skilling) Efficient Hours Played.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"ehb"),(0,n.kt)("td",{parentName:"tr",align:"left"},"float"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's Efficient Hours Bossed.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"ttm"),(0,n.kt)("td",{parentName:"tr",align:"left"},"float"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's Time to Max (all 99s), in hours.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"ttm200m"),(0,n.kt)("td",{parentName:"tr",align:"left"},"float"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's Time to 200m All, in hours.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"registeredAt"),(0,n.kt)("td",{parentName:"tr",align:"left"},"date"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's registration date.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"updatedAt"),(0,n.kt)("td",{parentName:"tr",align:"left"},"date"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's last update date.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"lastChangedAt"),(0,n.kt)("td",{parentName:"tr",align:"left"},"date?"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's last change (gained exp, kc, etc) date.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"lastImportedAt"),(0,n.kt)("td",{parentName:"tr",align:"left"},"date?"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The date of the last CML history import.")))),(0,n.kt)("br",null),(0,n.kt)("h3",{id:"object-player-details"},(0,n.kt)("inlineCode",{parentName:"h3"},"(Object)")," Player Details"),(0,n.kt)("blockquote",null,(0,n.kt)("p",{parentName:"blockquote"},"extends ",(0,n.kt)("a",{parentName:"p",href:"/docs/players-api/player-type-definitions#object-player"},"Player"))),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Field"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"combatLevel"),(0,n.kt)("td",{parentName:"tr",align:"left"},"integer"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's combat level.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"latestSnapshot"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/docs/players-api/player-type-definitions#object-snapshot"},"Snapshot")," ?"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's latest snapshot.")))),(0,n.kt)("br",null),(0,n.kt)("h3",{id:"object-achievement"},(0,n.kt)("inlineCode",{parentName:"h3"},"(Object)")," Achievement"),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Field"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"playerId"),(0,n.kt)("td",{parentName:"tr",align:"left"},"integer"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The parent player's ID.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"name"),(0,n.kt)("td",{parentName:"tr",align:"left"},"string"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The achievement's description/name.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"metric"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/docs/global-type-definitions#enum-metric"},"Metric")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The achievement's metric (Ex: ",(0,n.kt)("inlineCode",{parentName:"td"},"agility"),").")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"measure"),(0,n.kt)("td",{parentName:"tr",align:"left"},(0,n.kt)("a",{parentName:"td",href:"/docs/players-api/player-type-definitions#enum-achievement-measure"},"AchievementMeasure")),(0,n.kt)("td",{parentName:"tr",align:"left"},"The achievement's measure (Ex: ",(0,n.kt)("inlineCode",{parentName:"td"},"experience"),").")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"threshold"),(0,n.kt)("td",{parentName:"tr",align:"left"},"integer"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The achievement's threshold. (Ex: ",(0,n.kt)("inlineCode",{parentName:"td"},"13034431"),")")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"createdAt"),(0,n.kt)("td",{parentName:"tr",align:"left"},"date"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The achievement's creation date.")))),(0,n.kt)("br",null),(0,n.kt)("h3",{id:"object-player-achievement-progress"},(0,n.kt)("inlineCode",{parentName:"h3"},"(Object)")," Player Achievement Progress"),(0,n.kt)("blockquote",null,(0,n.kt)("p",{parentName:"blockquote"},"extends ",(0,n.kt)("a",{parentName:"p",href:"/docs/players-api/player-type-definitions#object-achievement"},"Achievement"))),(0,n.kt)("table",null,(0,n.kt)("thead",{parentName:"table"},(0,n.kt)("tr",{parentName:"thead"},(0,n.kt)("th",{parentName:"tr",align:"left"},"Field"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Type"),(0,n.kt)("th",{parentName:"tr",align:"left"},"Description"))),(0,n.kt)("tbody",{parentName:"table"},(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"currentValue"),(0,n.kt)("td",{parentName:"tr",align:"left"},"integer"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's current value for that achievement's metric (& measure)")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"absoluteProgress"),(0,n.kt)("td",{parentName:"tr",align:"left"},"float"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's current progress (0-1, with 1 being 100%) towards an achievement.")),(0,n.kt)("tr",{parentName:"tbody"},(0,n.kt)("td",{parentName:"tr",align:"left"},"relativeProgress"),(0,n.kt)("td",{parentName:"tr",align:"left"},"float"),(0,n.kt)("td",{parentName:"tr",align:"left"},"The player's current progress (0-1, with 1 being 100%) towards an achievement, starting from the previous achievement for that metric and measure. ",(0,n.kt)("br",null)," ",(0,n.kt)("br",null)," Example: At 30M agility exp, you'd be (",(0,n.kt)("strong",{parentName:"td"},"absolutely"),") 60% of the way to the 50M agility achievement, but since the previous achievement is 13M (99) agility, you're (",(0,n.kt)("strong",{parentName:"td"},"relatively"),") at 46% between 99 agility and 50M agility.)")))),(0,n.kt)("br",null))}s.isMDXComponent=!0}}]);