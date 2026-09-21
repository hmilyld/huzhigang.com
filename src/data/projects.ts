export interface Project {
  name: string;
  url: string;
  description: string;
  tech: string;
  status: '活跃' | '维护' | '开发中';
}

/**
 * Hand-picked from github.com/hmilyld. Kept here rather than fetched so the
 * homepage can't silently change or break when a repo is renamed.
 */
export const projects: Project[] = [
  {
    name: 'fullstack-starter',
    url: 'https://fullstack.hmilyld.com',
    description: '常规前后端基础框架，支持 Vue / React × Java / Python 四种组合。',
    tech: 'TypeScript',
    status: '活跃',
  },
  {
    name: 'zerochat',
    url: 'https://zchat.cc',
    description: '端到端加密、阅后即焚的通讯，加密全部在浏览器端完成，服务器零信任。',
    tech: 'TypeScript',
    status: '活跃',
  },
  {
    name: 'ProjectEnc',
    url: 'https://dotnet.hmilyld.com',
    description: '合并、加密、打包 C# 程序的工具集，三合一。',
    tech: 'Inno Setup',
    status: '维护',
  },
  {
    name: 'PocketArk',
    url: 'https://pocketark.hmilyld.com',
    description: '基于 Tauri 的桌面端基础架构，含生命周期钩子与插件目录规范。',
    tech: 'Vue',
    status: '开发中',
  },
];

export interface Role {
  years: string;
  org: string;
}

export const roles: Role[] = [
  { years: '1987 — 2003', org: '河南 · 周口 · 沈丘' },
  { years: '2003 — 2007', org: '陕西 · 西安' },
  { years: '2008 — 2011', org: '河南电力试验研究院' },
  { years: '2011 — 2014', org: '西安格蒂电力有限公司' },
  { years: '2014 — 至今', org: '河南吉吉信息技术有限公司' },
];

export const stack = [
  'Java',
  'Python',
  'TypeScript',
  'C#',
  'Vue',
  'Astro',
  'Debian',
  'Docker',
  'Nginx',
];
