/* ============================================================
 * 共享导航注入脚本
 * 读取 <body data-page="页面标识">，据此渲染顶栏 + 侧边栏并高亮当前页。
 * ============================================================ */
(function () {
  'use strict';

  var SITE = 'Astral Game CLI';
  var VERSION = 'v1.4.2_4';
  var GITHUB = 'https://github.com/yumi-furry/AstralGame-cli';
  var BLOG = 'https://github.com/yumi-furry/AstralGame-Cli-blog';
  var LOGO = './screenshot.png';

  // pages: 路由页 → 文件名
  var PAGES = {
    'index': ['项目介绍', 'index.html'],
    'quick-start': ['快速开始', 'quick-start.html'],
    'cli-commands': ['命令行 CLI', 'cli-commands.html'],
    'build-from-source': ['从源码编译', 'build-from-source.html'],
    'configuration': ['配置参考', 'configuration.html'],
    'daemon-auto-connect': ['守护进程自动联网', 'daemon-auto-connect.html'],
    'rooms': ['联机房间操作', 'rooms.html'],
    'rest-api': ['REST API 参考', 'rest-api.html'],
    'websocket-events': ['WebSocket 事件推送', 'websocket-events.html'],
    'smtp-notifications': ['SMTP 邮件通知', 'smtp-notifications.html'],
    'relay-servers': ['中继服务器与游戏目录', 'relay-servers.html'],
    'online-update': ['在线更新', 'online-update.html'],
    'mcsm-custom-card': ['MCSM 自定义卡片', 'mcsm-custom-card.html']
  };

  var NAV = [
    { title: '入门', items: ['index', 'quick-start', 'build-from-source', 'cli-commands'] },
    { title: '配置与运维', items: ['configuration', 'daemon-auto-connect'] },
    { title: '接口与集成', items: ['websocket-events', 'rest-api', 'rooms', 'smtp-notifications'] },
    { title: '扩展功能', items: ['relay-servers', 'online-update'] },
    { title: '接入第三方', items: ['mcsm-custom-card'] }
  ];

  function currentPage() {
    var body = document.body;
    return body && body.getAttribute('data-page') || 'index';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function buildTopbar() {
    var cur = currentPage();
    var links = [
      ['#index', '介绍'],
      ['quick-start.html', '快速开始'],
      ['configuration.html', '配置'],
      ['rest-api.html', 'API']
    ];
    var html = '<header class="topbar">' +
      '<div style="display:flex;align-items:center;gap:12px;">' +
        '<button class="btn burger" id="burger" aria-label="菜单">☰</button>' +
        '<a class="topbar__brand" href="index.html">' +
          '<img class="topbar__logo" src="' + esc(LOGO) + '" alt="' + esc(SITE) + '">' +
          '<small>' + esc(VERSION) + '</small>' +
        '</a>' +
      '</div>' +
      '<nav class="topbar__links">';
    links.forEach(function (l) {
      var href = l[0] === '#index' ? 'index.html' : l[0];
      html += '<a href="' + esc(href) + '">' + esc(l[1]) + '</a>';
    });
    html += '<a href="' + esc(GITHUB) + '" target="_blank" rel="noopener">GitHub</a></nav></header>';
    return html;
  }

  function buildSidebar() {
    var cur = currentPage();
    var html = '<aside class="sidebar" id="sidebar">';
    NAV.forEach(function (group) {
      html += '<div class="sidebar__group"><div class="sidebar__title">' + esc(group.title) + '</div>';
      group.items.forEach(function (key) {
        var page = PAGES[key];
        if (!page) return;
        var active = key === cur ? ' active' : '';
        html += '<a class="sidebar__link' + active + '" href="' + esc(page[1]) + '">' + esc(page[0]) + '</a>';
      });
      html += '</div>';
    });
    html += '<div class="sidebar__group"><div class="sidebar__title">开源</div>' +
      '<a class="sidebar__link" href="' + esc(GITHUB) + '" target="_blank" rel="noopener">GitHub 源码 ↗</a>' +
      '<a class="sidebar__link" href="' + esc(BLOG) + '" target="_blank" rel="noopener">本站 Repo ↗</a>' +
      '</div></aside>';
    return html;
  }

  function buildFooter() {
    return '<footer class="footer" style="max-width:860px;margin:30px auto 0;padding:0 36px 30px;">' +
      '<div class="table-wrap" style="padding:18px 0;border:none;">' +
      '<strong>' + esc(SITE) + '</strong> ' + esc(VERSION) +
      ' · 基于 <a href="https://github.com/AstralNext/AstralGame" target="_blank" rel="noopener">Astral Game</a> 二次开发' +
      ' · 组网内核 <a href="https://easytier.cn" target="_blank" rel="noopener">EasyTier</a> · ' +
      '<a href="' + esc(GITHUB) + '" target="_blank" rel="noopener">源码</a> · ' +
      '<a href="' + esc(BLOG) + '" target="_blank" rel="noopener">博客仓库</a> · MIT License' +
      '</div></footer>';
  }

  function inject() {
    var top = document.createElement('div');
    top.innerHTML = buildTopbar();
    document.body.prepend(top.firstChild);

    document.body.insertAdjacentHTML('beforeend', buildSidebar());
    document.body.insertAdjacentHTML('beforeend', buildFooter());

    // 复制按钮（页面上 class="code__copy" 且带 data-copy）
    document.querySelectorAll('.code__copy').forEach(function (btn) {
      if (btn._bound) return; btn._bound = true;
      btn.addEventListener('click', function () {
        var text = btn.getAttribute('data-copy') || '';
        var done = function () {
          var old = btn.textContent; btn.textContent = '已复制';
          setTimeout(function () { btn.textContent = old; }, 1200);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(done).catch(function () { fallback(text); done(); });
        } else { fallback(text); done(); }
      });
    });

    // 移动端菜单
    var burger = document.getElementById('burger');
    var sidebar = document.getElementById('sidebar');
    if (burger && sidebar) {
      burger.addEventListener('click', function () { sidebar.classList.toggle('open'); });
    }
  }

  function fallback(text) {
    var ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inject);
  } else { inject(); }
})();