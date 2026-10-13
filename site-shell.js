/* Shared page navigation and footer for the separate site views. */
(() => {
  const page = document.body.dataset.page || 'home';
  const routes = [
    ['home', '首页', 'index.html'],
    ['store', '鲜果商城', 'store.html'],
    ['origin', '产地故事', 'origin.html'],
    ['trace', '品质溯源', 'trace.html'],
    ['harvest', '采摘节', 'harvest.html'],
    ['contact', '联系购买', 'contact.html']
  ];
  const header = document.getElementById('siteHeader');
  const footer = document.getElementById('siteFooter');
  if (header) {
    header.innerHTML = `<header class="site-header" id="top"><nav class="nav-shell" aria-label="主导航"><a class="brand" href="index.html" aria-label="山野有橙，返回首页"><span class="brand-mark" aria-hidden="true">橙</span><span class="brand-name">山野有橙<small>GANNAN · ORCHARD</small></span></a><button class="menu-toggle" id="menuToggle" type="button" aria-label="打开导航菜单" aria-expanded="false" aria-controls="primaryNav"><span></span><span></span></button><div class="nav-links" id="primaryNav">${routes.map(([key, label, href]) => `<a href="${href}"${key === page ? ' class="active" aria-current="page"' : ''}>${label}</a>`).join('')}</div><div class="nav-actions"><button class="sound-toggle" id="soundToggle" type="button" aria-pressed="false" aria-label="开启轻柔提示音"><span class="sound-glyph" aria-hidden="true">♪</span><span class="sound-label">声音已关</span></button><a class="cart-link" href="store.html" aria-label="前往鲜果商城"><span aria-hidden="true">袋</span><b id="cartCount">0</b></a></div></nav></header>`;
  }
  if (footer) {
    footer.innerHTML = `<footer class="footer" id="contact"><div class="footer-oranges" aria-hidden="true"><span>橙</span><span>橙</span><span>橙</span></div><div class="wrap footer-main"><div class="footer-brand"><a class="brand footer-logo" href="index.html"><span class="brand-mark" aria-hidden="true">橙</span><span class="brand-name">山野有橙<small>GANNAN · ORCHARD</small></span></a><p>让每一颗橙子，<br>都有一段看得见的来路。</p></div><div class="footer-links"><div><b>继续探索</b><a href="store.html">鲜果商城</a><a href="origin.html">产地故事</a><a href="trace.html">品质溯源</a></div><div><b>联系与帮助</b><a href="contact.html">联系购买</a><a href="mailto:care@gannanor.example">售后服务</a><a href="harvest.html">采摘节提醒</a></div><div class="qr-block"><span class="qr-placeholder" aria-label="公众号二维码占位"></span><small>公众号二维码占位<br>替换为正式二维码</small></div></div></div><div class="wrap footer-bottom"><span>© 2026 山野有橙 · 赣南脐橙品牌示例</span><span>产地地址、备案与联系方式请在上线前补全</span><a href="index.html">回到首页 ↑</a></div></footer>`;
  }
})();

