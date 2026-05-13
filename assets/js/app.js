/* ============================================
   Portfolio — App Logic
   ============================================ */

(function () {
  'use strict';

  // ---------- Config Loader ----------
  async function loadConfig() {
    try {
      const resp = await fetch('config.json');
      if (!resp.ok) throw new Error('Failed to load config.json');
      return await resp.json();
    } catch (err) {
      console.error('Config load error:', err);
      return null;
    }
  }

  // ---------- Theme Toggle ----------
  function initTheme() {
    const toggle = document.getElementById('theme-toggle');
    const icon = toggle.querySelector('.theme-icon');
    const saved = localStorage.getItem('portfolio-theme');

    if (saved === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
      icon.textContent = '☀️';
    }

    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      if (current === 'light') {
        document.documentElement.removeAttribute('data-theme');
        icon.textContent = '🌙';
        localStorage.setItem('portfolio-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
        icon.textContent = '☀️';
        localStorage.setItem('portfolio-theme', 'light');
      }
    });
  }

  // ---------- Particles ----------
  function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const colors = ['#667eea', '#764ba2', '#f093fb', '#00d2ff', '#43e97b', '#fa709a'];
    const count = 40;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('div');
      p.classList.add('particle');
      const size = Math.random() * 4 + 2;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const duration = Math.random() * 15 + 10;
      const delay = Math.random() * 15;

      p.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        left: ${left}%;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        box-shadow: 0 0 ${size * 3}px ${color};
      `;
      container.appendChild(p);
    }
  }

  // ---------- i18n ----------
  const LANG = {
    zh: {
      // Nav
      'About': '关于',
      'Goals': '目标',
      'Skills': '技能',
      'Achievements': '成就',
      'Projects': '项目',
      'Blog': '博客',
      'Timeline': '时间线',
      'Portfolio': '作品集',
      // Hero stats
      'Skills Progress': '技能进度',
      'Certifications': '认证',
      'Blog Posts': '博客文章',
      // Blog
      'All': '全部',
      'Read more': '阅读全文',
      'Back to Blog': '← 返回博客',
      'Could not load post content.': '无法加载文章内容。',
      'Add blog posts in <code>blog/</code> directory and list them in <code>config.json</code>': '在 <code>blog/</code> 目录添加 Markdown 文件，并在 <code>config.json</code> 中列出',
      'Loading...': '加载中...',
      'Post Not Found': '文章不存在',
      'Could not load the blog post. Make sure the file exists in the blog directory.': '无法加载文章，请确认文件存在于 blog 目录中。',
      // Projects
      'Add projects in <code>config.json</code>': '请在 <code>config.json</code> 中添加项目',
      // Achievements
      'Add ${label} in <code>config.json</code>': (_, label) => `请在 <code>config.json</code> 中添加${label}`,  // used in empty state
      // Footer
      'View Template on GitHub': '在 GitHub 查看模板',
      'Built with ❤️': '用心铸造 ❤️',
      // Timeline filter
      'All': '全部',
      'Certs': '认证',
      'Badges': '徽章',
      'Projects': '项目',
      'Career': '职业',
      'Education': '教育',
      'Blog': '博客',
      // Goals
      'Yearly Goals': '年度目标',
      'Learning Paths': '学习路径',
      'Path Progress': '路径进度',
      'Journey Timeline': '经历时间线',
    },
    en: {} // English is the default — no translations needed (keys == display)
  };

  let currentLang = 'en';

  function t(key, ...args) {
    if (currentLang === 'en') return key;
    const dict = LANG.zh;
    const val = dict[key];
    if (typeof val === 'function') return val(...args);
    return val || key;
  }

  function initLang() {
    const saved = localStorage.getItem('portfolio-lang');
    if (saved === 'zh') {
      currentLang = 'zh';
      document.getElementById('lang-icon').textContent = 'CN';
    }

    document.getElementById('lang-toggle').addEventListener('click', () => {
      currentLang = currentLang === 'en' ? 'zh' : 'en';
      const icon = document.getElementById('lang-icon');
      icon.textContent = currentLang === 'en' ? 'EN' : 'CN';
      localStorage.setItem('portfolio-lang', currentLang);

      // Re-render everything
      if (configData) {
        reRenderAll();
        handleRoute();
      }
    });

    // Apply nav links translation on init
    translateNavLinks();
  }

  function translateNavLinks() {
    document.querySelectorAll('.nav-link').forEach(link => {
      const page = link.dataset.page;
      if (page) {
        const key = page.charAt(0).toUpperCase() + page.slice(1);
        link.textContent = t(key);
      }
    });
  }

  function reRenderAll() {
    renderedPages.clear();
    translateNavLinks();
    translateStaticText();
    // Update hero name / nav logo (these use profile data, not t())
    // But Portfolio fallback needs translation
    const logoEl = document.getElementById('nav-logo');
    const fallback = configData?.profile?.name;
    if (!fallback) logoEl.textContent = t('Portfolio');
  }

  function translateStaticText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.dataset.i18n;
      if (key) {
        // Keep any leading emoji/arrows
        const prefix = el.innerHTML.match(/^[←→▶]+\s*/);
        const translated = t(key);
        el.innerHTML = (prefix ? prefix[0] : '') + translated;
      }
    });
  }

  // ---------- Link Icons ----------
  const LINK_ICONS = {
    github: '🐙',
    linkedin: '💼',
    email: '✉️',
    twitter: '🐦',
    website: '🌐'
  };

  // ---------- Render Profile ----------
  function renderProfile(profile) {
    if (!profile) return;

    // Name
    const nameEl = document.getElementById('hero-name');
    nameEl.textContent = profile.name || t('Your Name');

    // Update nav logo
    document.getElementById('nav-logo').textContent = profile.name || t('Portfolio');

    // Title(s)
    const titleEl = document.getElementById('hero-title');
    const titles = profile.titles || (profile.title ? [profile.title] : []);
    if (titles.length > 0) {
      titleEl.innerHTML = titles.map((t, i) => {
        const sep = i < titles.length - 1 ? '<span class="hero-title-separator">|</span>' : '';
        return `<span class="hero-title-item">${t}</span>${sep}`;
      }).join('');
    }

    // Bio
    document.getElementById('hero-bio').textContent = profile.bio || '';

    // Avatar
    if (profile.avatar) {
      const avatarEl = document.getElementById('hero-avatar');
      const img = new Image();
      img.onload = () => {
        avatarEl.innerHTML = '';
        avatarEl.appendChild(img);
      };
      img.src = profile.avatar;
      img.alt = profile.name || 'Avatar';
    }

    // Links
    const linksEl = document.getElementById('hero-links');
    linksEl.innerHTML = ''; // Clear before re-rendering to avoid duplicates
    if (profile.links) {
      Object.entries(profile.links).forEach(([key, url]) => {
        if (!url) return;
        const href = key === 'email' ? `mailto:${url}` : url;
        const a = document.createElement('a');
        a.href = href;
        a.target = key === 'email' ? '_self' : '_blank';
        a.rel = 'noopener noreferrer';
        a.className = 'hero-link';
        a.innerHTML = `<span class="link-icon">${LINK_ICONS[key] || '🔗'}</span>${capitalize(key)}`;
        linksEl.appendChild(a);
      });
    }

    // Page title
    document.title = `${profile.name || t('Portfolio')} — ${t('Portfolio')}`;
  }

  // ---------- Render Skills ----------
  let skillsData = null;
  let activePathIndex = 0;

  function renderSkills(skills) {
    if (!skills) return;

    // Normalize: support both old single-path format and new multi-path
    if (skills.paths && Array.isArray(skills.paths)) {
      skillsData = skills.paths;
    } else if (skills.categories) {
      // Legacy single path
      skillsData = [{
        name: skills.title || t('Learning Path'),
        icon: '🚀',
        year: '',
        categories: skills.categories
      }];
    } else {
      return;
    }

    // Add SVG gradient definition
    const svgDef = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgDef.style.width = '0';
    svgDef.style.height = '0';
    svgDef.style.position = 'absolute';
    svgDef.innerHTML = `
      <defs>
        <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#667eea"/>
          <stop offset="100%" stop-color="#f093fb"/>
        </linearGradient>
      </defs>
    `;
    document.body.appendChild(svgDef);

    // Render tabs (only if more than 1 path)
    renderSkillsTabs();

    // Render first path
    renderPathContent(0);
  }

  function renderSkillsTabs() {
    const tabsEl = document.getElementById('skills-tabs');
    if (skillsData.length <= 1) {
      tabsEl.style.display = 'none';
      return;
    }

    tabsEl.innerHTML = '';
    skillsData.forEach((path, idx) => {
      const pct = getPathProgress(path);
      const tab = document.createElement('button');
      tab.className = `skills-tab ${idx === 0 ? 'active' : ''}`;
      tab.innerHTML = `
        <span class="skills-tab-icon">${path.icon || '📌'}</span>
        <span>${path.name}</span>
        <span class="skills-tab-pct">${pct}%</span>
      `;
      tab.addEventListener('click', () => switchPath(idx));
      tabsEl.appendChild(tab);
    });
  }

  function switchPath(idx) {
    if (idx === activePathIndex) return;
    activePathIndex = idx;

    // Update tab active state
    document.querySelectorAll('.skills-tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === idx);
      // Update percentage on tab
      const pctEl = tab.querySelector('.skills-tab-pct');
      if (pctEl) pctEl.textContent = getPathProgress(skillsData[i]) + '%';
    });

    // Re-render content with animation
    const grid = document.getElementById('skills-grid');
    grid.style.opacity = '0';
    grid.style.transform = 'translateY(16px)';

    setTimeout(() => {
      renderPathContent(idx);
      grid.style.opacity = '1';
      grid.style.transform = 'translateY(0)';
    }, 200);
  }

  function renderPathContent(idx) {
    const path = skillsData[idx];
    const grid = document.getElementById('skills-grid');
    grid.innerHTML = '';
    grid.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

    let totalDone = 0;
    let totalItems = 0;

    (path.categories || []).forEach((cat, catIdx) => {
      const done = cat.items.filter(i => i.done).length;
      const total = cat.items.length;
      const pct = total > 0 ? Math.round((done / total) * 100) : 0;

      totalDone += done;
      totalItems += total;

      const card = document.createElement('div');
      card.className = 'skill-card fade-in';
      card.style.setProperty('--card-accent', `linear-gradient(90deg, ${cat.color || '#667eea'}, ${lighten(cat.color || '#667eea')})`);
      card.style.animationDelay = `${catIdx * 0.08}s`;

      card.innerHTML = `
        <div class="skill-card-header">
          <div class="skill-card-title">
            <span class="skill-card-icon">${cat.icon || '📌'}</span>
            <span class="skill-card-name">${cat.name}</span>
          </div>
          <span class="skill-card-progress">${done}/${total}</span>
        </div>
        <div class="skill-progress-bar">
          <div class="skill-progress-fill" data-width="${pct}%" style="background: linear-gradient(90deg, ${cat.color || '#667eea'}, ${lighten(cat.color || '#667eea')})"></div>
        </div>
        <div class="skill-items">
          ${cat.items.map(item => `
            <div class="skill-item">
              <div class="skill-checkbox ${item.done ? 'checked' : ''}" style="${item.done ? `background: ${cat.color || '#667eea'}; color: #fff;` : ''}">
                ${item.done ? '✓' : ''}
              </div>
              <span class="skill-item-name ${item.done ? 'done' : ''}">${item.name}</span>
            </div>
          `).join('')}
        </div>
      `;

      grid.appendChild(card);
    });

    // Update progress ring for this path
    const overallPct = totalItems > 0 ? Math.round((totalDone / totalItems) * 100) : 0;
    const ring = document.getElementById('overall-progress-ring');
    const circumference = 2 * Math.PI * 52;
    const offset = circumference - (overallPct / 100) * circumference;

    setTimeout(() => {
      ring.style.strokeDashoffset = offset;
      document.getElementById('overall-progress-text').textContent = `${overallPct}%`;
    }, 100);

    // Re-init scroll animations for new cards
    requestAnimationFrame(() => initScrollAnimations());
  }

  function getPathProgress(path) {
    let done = 0, total = 0;
    (path.categories || []).forEach(cat => {
      cat.items.forEach(item => {
        total++;
        if (item.done) done++;
      });
    });
    return total > 0 ? Math.round((done / total) * 100) : 0;
  }

  // ---------- Render Achievements ----------
  const ACHIEVEMENT_TABS = [
    { key: 'badges', label: t('Badges'), icon: '🏅' },
    { key: 'certifications', label: t('Certifications'), icon: '📜' },
    { key: 'education', label: t('Education'), icon: '🎓' }
  ];

  let achievementsData = null;
  let activeAchievementTab = 0;

  function renderAchievements(achievements) {
    if (!achievements) return;
    achievementsData = achievements;

    // Render tabs
    const tabsEl = document.getElementById('achievements-tabs');
    tabsEl.innerHTML = '';

    ACHIEVEMENT_TABS.forEach((tab, idx) => {
      const items = achievements[tab.key] || [];
      const btn = document.createElement('button');
      btn.className = `achievements-tab ${idx === 0 ? 'active' : ''}`;
      btn.innerHTML = `
        <span class="achievements-tab-icon">${tab.icon}</span>
        <span>${tab.label}</span>
        <span class="achievements-tab-count">${items.length}</span>
      `;
      btn.addEventListener('click', () => switchAchievementTab(idx));
      tabsEl.appendChild(btn);
    });

    // Render first tab content
    renderAchievementContent(0);
  }

  function switchAchievementTab(idx) {
    if (idx === activeAchievementTab) return;
    activeAchievementTab = idx;

    // Update tab active state
    document.querySelectorAll('.achievements-tab').forEach((tab, i) => {
      tab.classList.toggle('active', i === idx);
    });

    // Animate content switch
    const content = document.getElementById('achievements-content');
    content.style.opacity = '0';
    content.style.transform = 'translateY(16px)';

    setTimeout(() => {
      renderAchievementContent(idx);
      content.style.opacity = '1';
      content.style.transform = 'translateY(0)';
    }, 200);
  }

  function renderAchievementContent(idx) {
    const content = document.getElementById('achievements-content');
    content.innerHTML = '';

    const tabInfo = ACHIEVEMENT_TABS[idx];
    const items = achievementsData[tabInfo.key] || [];

    // Create grid container
    const grid = document.createElement('div');
    grid.className = 'cards-grid';

    if (items.length === 0) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-icon">${tabInfo.icon}</div>${t('Add ${label} in <code>config.json</code>', tabInfo.label.toLowerCase())}</div>`;
      content.appendChild(grid);
      requestAnimationFrame(() => initScrollAnimations());
      return;
    }

    switch (tabInfo.key) {
      case 'badges':
        renderBadgeCards(items, grid);
        break;
      case 'certifications':
        renderCertCards(items, grid);
        break;
      case 'education':
        renderEduCards(items, grid);
        break;
    }

    content.appendChild(grid);
    requestAnimationFrame(() => initScrollAnimations());
  }

  function renderBadgeCards(badges, grid) {
    badges.forEach((badge, idx) => {
      const card = document.createElement('div');
      card.className = 'achievement-card badge-card fade-in';
      card.style.animationDelay = `${idx * 0.1}s`;

      const imgHtml = badge.image
        ? `<img src="${badge.image}" alt="${badge.name}" onerror="this.parentElement.innerHTML='<span class=\\'badge-placeholder\\'>🏅</span>'">`
        : '<span class="badge-placeholder">🏅</span>';

      card.innerHTML = `
        <div class="badge-image-wrapper">${imgHtml}</div>
        <div class="badge-name">${badge.name}</div>
        <div class="badge-issuer">${badge.issuer || ''}</div>
        <div class="badge-date">${badge.date || ''}</div>
      `;

      if (badge.url) {
        card.style.cursor = 'pointer';
        card.addEventListener('click', () => window.open(badge.url, '_blank'));
      }

      grid.appendChild(card);
    });
  }

  function renderCertCards(certs, grid) {
    certs.forEach((cert, idx) => {
      const card = document.createElement('div');
      card.className = 'achievement-card cert-card fade-in';
      card.style.animationDelay = `${idx * 0.1}s`;

      const hasImage = cert.image;
      if (hasImage) {
        card.classList.add('clickable');
        card.addEventListener('click', () => openModal(cert.image, cert.name));
      }

      const imgHtml = hasImage
        ? `<img src="${cert.image}" alt="${cert.abbr || cert.name}" onerror="this.parentElement.innerHTML='<span class=\\'cert-placeholder\\'>📜</span>'">`
        : '<span class="cert-placeholder">📜</span>';

      const expiryHtml = cert.expiry ? ` → ${cert.expiry}` : '';

      // Credential line (credentialId and/or credentialUrl, either can be null)
      let credentialHtml = '';
      if (cert.credentialId || cert.credentialUrl) {
        const idText = cert.credentialId || 'View';
        if (cert.credentialUrl) {
          credentialHtml = `<div class="cert-credential"><a href="${cert.credentialUrl}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">🔗 ${idText}</a></div>`;
        } else {
          credentialHtml = `<div class="cert-credential">🆔 ${idText}</div>`;
        }
      }

      card.innerHTML = `
        <div class="cert-image-wrapper">${imgHtml}</div>
        <div class="cert-info">
          <div class="cert-abbr">${cert.abbr || cert.name}</div>
          <div class="cert-name">${cert.name}</div>
          <div class="cert-issuer">${cert.issuer || ''}</div>
          <div class="cert-dates">${cert.date || ''}${expiryHtml}</div>
          ${credentialHtml}
        </div>
      `;

      grid.appendChild(card);
    });
  }

  function renderEduCards(edu, grid) {
    edu.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'achievement-card edu-card fade-in';
      card.style.animationDelay = `${idx * 0.1}s`;

      const logoHtml = item.logo
        ? `<img src="${item.logo}" alt="${item.school}" onerror="this.parentElement.innerHTML='<span class=\\'edu-placeholder\\'>🎓</span>'">`
        : '<span class="edu-placeholder">🎓</span>';

      card.innerHTML = `
        <div class="edu-logo-wrapper">${logoHtml}</div>
        <div class="edu-info">
          <div class="edu-degree">${item.degree}</div>
          <div class="edu-school">${item.school}</div>
          <div class="edu-year">${item.year || ''}</div>
          ${item.details ? `<div class="edu-details">${item.details}</div>` : ''}
        </div>
      `;

      grid.appendChild(card);
    });
  }

  // ---------- Render Projects ----------
  function renderProjects(projects) {
    if (!projects) {
      document.getElementById('projects').style.display = 'none';
      return;
    }

    const grid = document.getElementById('projects-grid');
    grid.innerHTML = '';
    const repos = projects.repos || [];

    if (repos.length === 0) {
      grid.innerHTML = `<div class="empty-state"><div class="empty-icon">💻</div>${t('Add projects in <code>config.json</code>')}</div>`;
      return;
    }

    repos.forEach((repo, idx) => {
      const card = document.createElement('div');
      card.className = 'project-card fade-in';
      card.style.animationDelay = `${idx * 0.08}s`;

      if (repo.url) {
        card.addEventListener('click', () => window.open(repo.url, '_blank'));
      }

      const tagsHtml = (repo.tags || []).map(t => `<span class="project-tag">${t}</span>`).join('');
      const starsHtml = repo.stars ? `<div class="project-stars">⭐ ${repo.stars}</div>` : '';
      const langHtml = repo.language
        ? `<div class="project-language"><span class="language-dot" style="background: ${repo.languageColor || '#ccc'}"></span>${repo.language}</div>`
        : '';

      card.innerHTML = `
        <div class="project-header">
          <div class="project-name"><span class="repo-icon">📂</span>${repo.name}</div>
          ${starsHtml}
        </div>
        <div class="project-desc">${repo.desc || ''}</div>
        <div class="project-footer">
          ${langHtml}
          <div class="project-tags">${tagsHtml}</div>
        </div>
      `;

      grid.appendChild(card);
    });
  }

  // ---------- Render Blog ----------
  let blogData = null;
  let activeBlogTag = 'all';

  function renderBlog(blog) {
    if (!blog) {
      document.getElementById('blog').style.display = 'none';
      return;
    }

    const posts = blog.posts || [];
    blogData = posts;

    if (posts.length === 0) {
      document.getElementById('blog-grid').innerHTML = `<div class="empty-state"><div class="empty-icon">✍️</div>${t('Add blog posts in <code>blog/</code> directory and list them in <code>config.json</code>')}</div>`;
      return;
    }

    // Collect all tags
    const allTags = new Set();
    posts.forEach(p => (p.tags || []).forEach(t => allTags.add(t)));

    // Render tag filter
    const filterEl = document.getElementById('blog-tags-filter');
    filterEl.innerHTML = '';
    if (allTags.size > 0) {
      const allBtn = document.createElement('button');
      allBtn.className = 'blog-tag-btn active';
      allBtn.textContent = t('All');
      allBtn.dataset.tag = 'all';
      allBtn.addEventListener('click', () => filterBlogByTag('all'));
      filterEl.appendChild(allBtn);

      allTags.forEach(tag => {
        const btn = document.createElement('button');
        btn.className = 'blog-tag-btn';
        btn.textContent = tag;
        btn.dataset.tag = tag;
        btn.addEventListener('click', () => filterBlogByTag(tag));
        filterEl.appendChild(btn);
      });
    }

    renderBlogCards('all');
  }

  function filterBlogByTag(tag) {
    if (tag === activeBlogTag) return;
    activeBlogTag = tag;

    document.querySelectorAll('.blog-tag-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tag === tag);
    });

    const grid = document.getElementById('blog-grid');
    grid.style.opacity = '0';

    setTimeout(() => {
      renderBlogCards(tag);
      grid.style.opacity = '1';
    }, 200);
  }

  function renderBlogCards(tag) {
    const grid = document.getElementById('blog-grid');
    grid.innerHTML = '';

    const posts = tag === 'all' ? blogData : blogData.filter(p => (p.tags || []).includes(tag));

    posts.forEach((post, idx) => {
      const card = document.createElement('div');
      card.className = 'blog-card fade-in';
      card.style.animationDelay = `${idx * 0.08}s`;

      const tagsHtml = (post.tags || []).map(t => `<span class="blog-tag">${t}</span>`).join('');
      const dateFormatted = formatBlogDate(post.date);

      card.innerHTML = `
        <div class="blog-card-header">
          <span class="blog-date">${dateFormatted}</span>
          ${post.readTime ? `<span class="blog-read-time">📖 ${post.readTime}</span>` : ''}
        </div>
        <div class="blog-title">${post.title}</div>
        <div class="blog-summary">${post.summary || ''}</div>
        <div class="blog-tags">${tagsHtml}</div>
        ${post.file ? `<button class="blog-expand-btn" data-file="${post.file}">${t('Read more')}</button>` : ''}
      `;

      // Navigate to blog detail page
      const expandBtn = card.querySelector('.blog-expand-btn');
      if (expandBtn) {
        expandBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          const encodedFile = encodeURIComponent(expandBtn.dataset.file);
          window.location.hash = `#/blog/detail/${encodedFile}`;
        });
      }

      grid.appendChild(card);
    });

    requestAnimationFrame(() => initScrollAnimations());
  }

  // Simple Markdown renderer (no external deps)
  function renderMarkdown(md) {
    let html = md
      // Code blocks
      .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      // Headers
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Blockquotes
      .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
      // Unordered lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      // Paragraphs (double newline)
      .replace(/\n\n/g, '</p><p>')
      // Single newlines in context
      .replace(/\n/g, '<br>');

    // Wrap consecutive <li> in <ul>
    html = html.replace(/(<li>.*?<\/li>(?:<br>)?)+/g, (match) => {
      return '<ul>' + match.replace(/<br>/g, '') + '</ul>';
    });

    // Merge consecutive blockquotes
    html = html.replace(/(<blockquote>.*?<\/blockquote>(?:<br>)?)+/g, (match) => {
      return match.replace(/<\/blockquote>(?:<br>)?<blockquote>/g, '<br>');
    });

    return '<p>' + html + '</p>';
  }

  function formatBlogDate(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length >= 3) {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${months[monthIdx] || parts[1]} ${parseInt(parts[2], 10)}, ${parts[0]}`;
    }
    return dateStr;
  }

  // ---------- Render Goals Dashboard ----------
  let goalsData = null;
  let activeGoalYear = 0;

  function renderGoals(goals) {
    if (!goals || !goals.years || goals.years.length === 0) {
      document.getElementById('goals').style.display = 'none';
      return;
    }
    goalsData = goals.years;

    // Year selector buttons
    const selector = document.getElementById('goals-year-selector');
    selector.innerHTML = '';
    goalsData.forEach((yearData, idx) => {
      const btn = document.createElement('button');
      btn.className = `goals-year-btn ${idx === 0 ? 'active' : ''}`;
      btn.textContent = yearData.year;
      btn.addEventListener('click', () => switchGoalYear(idx));
      selector.appendChild(btn);
    });

    renderGoalCards(0);
  }

  function switchGoalYear(idx) {
    if (idx === activeGoalYear) return;
    activeGoalYear = idx;

    document.querySelectorAll('.goals-year-btn').forEach((btn, i) => {
      btn.classList.toggle('active', i === idx);
    });

    const dashboard = document.getElementById('goals-dashboard');
    dashboard.style.opacity = '0';
    dashboard.style.transform = 'translateY(16px)';

    setTimeout(() => {
      renderGoalCards(idx);
      dashboard.style.opacity = '1';
      dashboard.style.transform = 'translateY(0)';
    }, 200);
  }

  function renderGoalCards(idx) {
    const yearData = goalsData[idx];
    const dashboard = document.getElementById('goals-dashboard');
    dashboard.innerHTML = '';

    (yearData.goals || []).forEach((goal, i) => {
      const card = document.createElement('div');
      card.className = `goal-card fade-in ${goal.progress >= 100 ? 'complete' : ''}`;
      card.style.animationDelay = `${i * 0.08}s`;

      const circumference = 2 * Math.PI * 22; // r=22
      const offset = circumference - (goal.progress / 100) * circumference;

      card.innerHTML = `
        <div class="goal-card-header">
          <div class="goal-card-left">
            <span class="goal-icon">${goal.icon || '🎯'}</span>
            <span class="goal-name">${goal.name}</span>
          </div>
          <div class="goal-ring-container">
            <svg class="goal-ring" viewBox="0 0 50 50">
              <circle class="goal-ring-bg" cx="25" cy="25" r="22" />
              <circle class="goal-ring-fill" cx="25" cy="25" r="22"
                style="stroke: ${goal.color || '#667eea'}; stroke-dasharray: ${circumference}; stroke-dashoffset: ${circumference}"
                data-target-offset="${offset}" />
            </svg>
            <div class="goal-ring-text">${goal.progress}%</div>
          </div>
        </div>
        <div class="goal-target">${goal.target || ''}</div>
        <div class="goal-bar">
          <div class="goal-bar-fill" data-width="${goal.progress}%" style="background: linear-gradient(90deg, ${goal.color || '#667eea'}, ${lighten(goal.color || '#667eea')})"></div>
        </div>
      `;

      dashboard.appendChild(card);
    });

    requestAnimationFrame(() => initGoalAnimations());
  }

  function initGoalAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Animate goal rings
            const ring = entry.target.querySelector('.goal-ring-fill');
            if (ring) {
              ring.style.strokeDashoffset = ring.dataset.targetOffset;
            }

            // Animate goal bars
            const bar = entry.target.querySelector('.goal-bar-fill');
            if (bar) {
              bar.style.width = bar.dataset.width;
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.goal-card.fade-in').forEach(el => observer.observe(el));
  }

  // ---------- Render Timeline (Calendar Grid) ----------
  let timelineData = null;
  let activeTimelineFilter = 'all';
  let activeEvent = null;

  const TIMELINE_TYPES = [
    { key: 'all', label: t('All'), icon: '📍' },
    { key: 'certification', label: t('Certs'), icon: '🏆' },
    { key: 'badge', label: t('Badges'), icon: '🏅' },
    { key: 'project', label: t('Projects'), icon: '🚀' },
    { key: 'career', label: t('Career'), icon: '💼' },
    { key: 'education', label: t('Education'), icon: '🎓' },
    { key: 'blog', label: t('Blog'), icon: '✍️' }
  ];

  const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function renderTimeline(timeline) {
    if (!timeline || timeline.length === 0) return;

    timelineData = [...timeline].sort((a, b) => a.date.localeCompare(b.date));

    // Render filter buttons
    const filtersEl = document.getElementById('timeline-filters');
    filtersEl.innerHTML = '';

    const existingTypes = new Set(timelineData.map(e => e.type));
    const activeTypes = TIMELINE_TYPES.filter(t => t.key === 'all' || existingTypes.has(t.key));

    activeTypes.forEach((type) => {
      const btn = document.createElement('button');
      btn.className = `timeline-filter ${type.key === 'all' ? 'active' : ''}`;
      btn.textContent = `${type.icon} ${type.label}`;
      btn.dataset.type = type.key;
      btn.addEventListener('click', () => filterTimeline(type.key));
      filtersEl.appendChild(btn);
    });

    renderCalendarGrid();
    initTimelineDrag();
    initTimelineScrollBtns();
  }

  function filterTimeline(type) {
    if (type === activeTimelineFilter) return;
    activeTimelineFilter = type;
    activeEvent = null;

    document.querySelectorAll('.timeline-filter').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.type === type);
    });

    // Dim/show events
    document.querySelectorAll('.timeline-event').forEach(ev => {
      if (type === 'all' || ev.dataset.type === type) {
        ev.classList.remove('dimmed');
      } else {
        ev.classList.add('dimmed');
        ev.classList.remove('active');
      }
    });

    // Hide popups
    document.querySelectorAll('.timeline-event-popup.visible').forEach(p => p.classList.remove('visible'));

    // Update month track highlights — only highlight if month has matching events
    document.querySelectorAll('.timeline-month').forEach(monthEl => {
      const events = monthEl.querySelectorAll('.timeline-event');
      const hasVisible = Array.from(events).some(ev => !ev.classList.contains('dimmed'));
      if (type === 'all') {
        monthEl.classList.toggle('has-events', events.length > 0);
      } else {
        monthEl.classList.toggle('has-events', hasVisible);
      }
    });
  }

  function renderCalendarGrid() {
    const calendar = document.getElementById('timeline-calendar');
    calendar.innerHTML = '';

    // Group events by year-month
    const eventMap = {}; // { "2025-03": [event, ...] }
    timelineData.forEach(ev => {
      const key = ev.date.substring(0, 7); // "YYYY-MM"
      if (!eventMap[key]) eventMap[key] = [];
      eventMap[key].push(ev);
    });

    // Determine year range
    const years = [...new Set(timelineData.map(e => parseInt(e.date.split('-')[0])))];
    const minYear = Math.min(...years);
    const maxYear = Math.max(...years);

    // Build year blocks
    for (let year = minYear; year <= maxYear; year++) {
      if (year > minYear) {
        // Add year separator
        const sep = document.createElement('div');
        sep.className = 'timeline-year-separator';
        calendar.appendChild(sep);
      }

      const yearBlock = document.createElement('div');
      yearBlock.className = 'timeline-year-block';

      // Year label
      const yearLabel = document.createElement('div');
      yearLabel.className = 'timeline-year-label';
      yearLabel.textContent = year;
      yearBlock.appendChild(yearLabel);

      // Months row
      const monthsRow = document.createElement('div');
      monthsRow.className = 'timeline-months';

      for (let m = 0; m < 12; m++) {
        const monthKey = `${year}-${String(m + 1).padStart(2, '0')}`;
        const events = eventMap[monthKey] || [];

        const monthCol = document.createElement('div');
        monthCol.className = `timeline-month ${events.length > 0 ? 'has-events' : ''}`;

        // Month label
        const mLabel = document.createElement('div');
        mLabel.className = 'timeline-month-label';
        mLabel.textContent = MONTH_LABELS[m];
        monthCol.appendChild(mLabel);

        // Track segment
        const trackSeg = document.createElement('div');
        trackSeg.className = 'timeline-month-track';
        monthCol.appendChild(trackSeg);

        // Events stack
        const eventsContainer = document.createElement('div');
        eventsContainer.className = 'timeline-month-events';

        events.forEach(ev => {
          const eventEl = document.createElement('div');
          eventEl.className = 'timeline-event';
          eventEl.dataset.type = ev.type;
          eventEl.textContent = ev.icon || '●';

          const dateFormatted = `${MONTH_LABELS[m]} ${year}`;

          // Popup (appended to body for no clipping)
          const popup = document.createElement('div');
          popup.className = 'timeline-event-popup';
          popup.innerHTML = `
            <div class="timeline-popup-date">${dateFormatted}</div>
            <div class="timeline-popup-title">${ev.title}</div>
            ${ev.desc ? `<div class="timeline-popup-desc">${ev.desc}</div>` : ''}
            <span class="timeline-popup-badge ${ev.type}">${ev.type}</span>
          `;
          document.body.appendChild(popup);

          // Position popup relative to event icon
          function showPopup() {
            const rect = eventEl.getBoundingClientRect();
            const popupWidth = 260;
            let left = rect.left + rect.width / 2 - popupWidth / 2;
            let top = rect.bottom + 10;

            // Keep within viewport
            if (left < 8) left = 8;
            if (left + popupWidth > window.innerWidth - 8) left = window.innerWidth - popupWidth - 8;
            if (top + 200 > window.innerHeight) {
              top = rect.top - 10;
              popup.style.transform = 'translateY(-100%)';
            } else {
              popup.style.transform = 'translateY(0)';
            }

            popup.style.left = `${left}px`;
            popup.style.top = `${top}px`;
            popup.classList.add('visible');
          }

          function hidePopup() {
            popup.classList.remove('visible');
          }

          // Hover
          eventEl.addEventListener('mouseenter', () => {
            if (!eventEl.classList.contains('dimmed')) showPopup();
          });
          eventEl.addEventListener('mouseleave', () => {
            if (activeEvent !== eventEl) hidePopup();
          });

          // Click to toggle (mobile)
          eventEl.addEventListener('click', (e) => {
            e.stopPropagation();
            if (eventEl.classList.contains('dimmed')) return;

            if (activeEvent === eventEl) {
              eventEl.classList.remove('active');
              hidePopup();
              activeEvent = null;
            } else {
              if (activeEvent) {
                activeEvent.classList.remove('active');
                // Hide previous popup
                document.querySelectorAll('.timeline-event-popup.visible').forEach(p => p.classList.remove('visible'));
              }
              eventEl.classList.add('active');
              showPopup();
              activeEvent = eventEl;
            }
          });

          // Store popup ref for cleanup
          eventEl._popup = popup;

          eventsContainer.appendChild(eventEl);
        });

        monthCol.appendChild(eventsContainer);
        monthsRow.appendChild(monthCol);
      }

      yearBlock.appendChild(monthsRow);
      calendar.appendChild(yearBlock);
    }

    // Close popup on outside click
    document.addEventListener('click', () => {
      if (activeEvent) {
        activeEvent.classList.remove('active');
        document.querySelectorAll('.timeline-event-popup.visible').forEach(p => p.classList.remove('visible'));
        activeEvent = null;
      }
    });

    // Scroll to latest (rightmost)
    const scrollEl = document.getElementById('timeline-track-scroll');
    setTimeout(() => {
      scrollEl.scrollLeft = scrollEl.scrollWidth;
    }, 300);
  }

  // Drag to scroll
  function initTimelineDrag() {
    const scrollEl = document.getElementById('timeline-track-scroll');
    let isDragging = false;
    let startX, scrollLeft;

    scrollEl.addEventListener('mousedown', (e) => {
      isDragging = true;
      startX = e.pageX - scrollEl.offsetLeft;
      scrollLeft = scrollEl.scrollLeft;
    });

    scrollEl.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
      const x = e.pageX - scrollEl.offsetLeft;
      const walk = (x - startX) * 1.5;
      scrollEl.scrollLeft = scrollLeft - walk;
    });

    document.addEventListener('mouseup', () => { isDragging = false; });
    scrollEl.addEventListener('mouseleave', () => { isDragging = false; });

    // Touch
    scrollEl.addEventListener('touchstart', (e) => {
      startX = e.touches[0].pageX - scrollEl.offsetLeft;
      scrollLeft = scrollEl.scrollLeft;
    }, { passive: true });

    scrollEl.addEventListener('touchmove', (e) => {
      const x = e.touches[0].pageX - scrollEl.offsetLeft;
      const walk = (x - startX) * 1.5;
      scrollEl.scrollLeft = scrollLeft - walk;
    }, { passive: true });
  }

  // Scroll buttons
  function initTimelineScrollBtns() {
    const scrollEl = document.getElementById('timeline-track-scroll');
    const leftBtn = document.getElementById('tl-scroll-left');
    const rightBtn = document.getElementById('tl-scroll-right');

    if (leftBtn) {
      leftBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        scrollEl.scrollBy({ left: -300, behavior: 'smooth' });
      });
    }
    if (rightBtn) {
      rightBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        scrollEl.scrollBy({ left: 300, behavior: 'smooth' });
      });
    }
  }

  function formatTimelineDate(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length >= 2) {
      const monthIdx = parseInt(parts[1], 10) - 1;
      return `${MONTH_LABELS[monthIdx] || parts[1]} ${parts[0]}`;
    }
    return dateStr;
  }

  // ---------- Modal ----------
  function openModal(src, caption) {
    const overlay = document.getElementById('modal-overlay');
    const img = document.getElementById('modal-image');
    const cap = document.getElementById('modal-caption');

    img.src = src;
    cap.textContent = caption || '';
    overlay.classList.add('active');
  }

  function initModal() {
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('modal-close');

    closeBtn.addEventListener('click', () => overlay.classList.remove('active'));
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('active');
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') overlay.classList.remove('active');
    });
  }

  // ---------- Scroll Animations ----------
  function initScrollAnimations() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');

            // Animate progress bars when visible
            const progressFill = entry.target.querySelector('.skill-progress-fill');
            if (progressFill) {
              progressFill.style.width = progressFill.dataset.width;
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));
  }

  // ---------- Nav Scroll Effect ----------
  // (removed — nav is always visible in multi-page mode)

  // ---------- Mobile Hamburger ----------
  function initHamburger() {
    const hamburger = document.getElementById('nav-hamburger');
    const navLinks = document.getElementById('nav-links');

    if (!hamburger) return;

    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('open');
      navLinks.classList.toggle('open');
    });

    // Close menu on nav link click
    navLinks.addEventListener('click', (e) => {
      if (e.target.classList.contains('nav-link')) {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
      }
    });
  }

  // ---------- Router ----------
  const PAGES = ['about', 'goals', 'skills', 'achievements', 'projects', 'blog', 'timeline', 'blog-detail'];
  let currentPage = 'about';
  let configData = null;
  const renderedPages = new Set();

  function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
  }

  function handleRoute() {
    const hash = window.location.hash.replace('#/', '').replace('#', '') || 'about';

    // Check for blog detail route: blog/detail/{filepath}
    const blogDetailMatch = hash.match(/^blog\/detail\/(.+)/);
    if (blogDetailMatch) {
      navigateTo('blog-detail', blogDetailMatch[1]);
      return;
    }

    const page = PAGES.includes(hash) ? hash : 'about';
    navigateTo(page);
  }

  function navigateTo(page, param) {
    if (page === currentPage && renderedPages.has(page) && !param) return;

    // Blog detail: always re-render when param changes
    if (page === 'blog-detail' && param && currentPage === 'blog-detail' && renderedPages.has('blog-detail')) {
      // Just re-render the content without page transition
      renderBlogDetail(param);
      window.scrollTo(0, 0);
      currentPage = page;
      return;
    }

    const oldPage = document.querySelector('.page.active');
    const newPage = document.querySelector(`.page[data-page="${page}"]`);

    if (!newPage) return;

    // Update nav active state (hide for blog-detail)
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.page === page);
    });

    // Lazy render page content on first visit
    if (!renderedPages.has(page) && configData) {
      renderPage(page, param);
      renderedPages.add(page);
    } else if (page === 'blog-detail') {
      // Re-render blog detail on nav
      renderBlogDetail(param);
      renderedPages.add(page);
    }

    // Page transition
    if (oldPage && oldPage !== newPage) {
      oldPage.classList.add('leaving');
      oldPage.classList.remove('active');

      setTimeout(() => {
        oldPage.classList.remove('leaving');
      }, 250);
    }

    // Show new page
    setTimeout(() => {
      newPage.classList.add('active');
      window.scrollTo(0, 0);

      // Trigger animations on the new page
      requestAnimationFrame(() => initScrollAnimations());

      // Special: re-trigger goal ring animations when revisiting
      if (page === 'goals') {
        setTimeout(() => initGoalAnimations(), 100);
      }
    }, oldPage && oldPage !== newPage ? 100 : 0);

    currentPage = page;

    // Update page title
    let pageName = '';
    if (page === 'blog-detail') {
      pageName = ' — Blog';
    } else if (page !== 'about') {
      pageName = ` — ${capitalize(page)}`;
    }
    const name = configData?.profile?.name || 'Portfolio';
    document.title = `${name}${pageName}`;
  }

  function renderPage(page, param) {
    switch (page) {
      case 'about':
        renderProfile(configData.profile);
        renderHeroStats();
        break;
      case 'goals':
        renderGoals(configData.goals);
        break;
      case 'skills':
        renderSkills(configData.skills);
        break;
      case 'achievements':
        renderAchievements(configData.achievements);
        break;
      case 'projects':
        renderProjects(configData.projects);
        break;
      case 'blog':
        renderBlog(configData.blog);
        break;
      case 'blog-detail':
        renderBlogDetail(param);
        break;
      case 'timeline':
        renderTimeline(configData.timeline);
        break;
    }
  }

  // ---------- Blog Detail Page ----------
  function renderBlogDetail(filePath) {
    if (!filePath) {
      window.location.hash = '#/blog';
      return;
    }

    const decodedFile = decodeURIComponent(filePath);
    const headerEl = document.getElementById('blog-detail-header');
    const contentEl = document.getElementById('blog-detail-content');

    headerEl.innerHTML = '<div class="blog-detail-loading">Loading...</div>';
    contentEl.innerHTML = '';

    // Find post metadata from config
    const post = (blogData || []).find(p => p.file === decodedFile);

    // Update page title with post title
    if (post) {
      const name = configData?.profile?.name || 'Portfolio';
      document.title = `${post.title} — ${name}`;
    }

    // Fetch and render markdown
    fetch(decodedFile)
      .then(resp => {
        if (!resp.ok) throw new Error('Failed to load post');
        return resp.text();
      })
      .then(md => {
        const dateFormatted = post ? formatBlogDate(post.date) : '';
        const tagsHtml = post ? (post.tags || []).map(t => `<span class="blog-tag">${t}</span>`).join('') : '';

        headerEl.innerHTML = `
          <div class="blog-detail-meta">
            <span class="blog-date">${dateFormatted}</span>
            ${post?.readTime ? `<span class="blog-read-time">📖 ${post.readTime}</span>` : ''}
          </div>
          <h1 class="blog-detail-title">${post?.title || 'Blog Post'}</h1>
          <div class="blog-tags">${tagsHtml}</div>
        `;

        contentEl.innerHTML = renderMarkdown(md);
        contentEl.classList.add('loaded');

        requestAnimationFrame(() => initScrollAnimations());
      })
      .catch(() => {
        headerEl.innerHTML = '<h1 class="blog-detail-title">Post Not Found</h1>';
        contentEl.innerHTML = '<p class="blog-detail-error">Could not load the blog post. Make sure the file exists in the blog directory.</p>';
      });
  }

  // ---------- Hero Stats (About page overview) ----------
  function renderHeroStats() {
    const statsEl = document.getElementById('hero-stats');
    if (!statsEl || !configData) return;

    const stats = [];

    // Skills progress
    if (configData.skills) {
      const paths = configData.skills.paths || (configData.skills.categories ? [{ categories: configData.skills.categories }] : []);
      let done = 0, total = 0;
      paths.forEach(p => (p.categories || []).forEach(c => c.items.forEach(i => { total++; if (i.done) done++; })));
      if (total > 0) stats.push({ value: Math.round((done / total) * 100) + '%', label: 'Skills Progress', page: 'skills' });
    }

    // Certifications count
    if (configData.achievements?.certifications) {
      stats.push({ value: configData.achievements.certifications.length, label: 'Certifications', page: 'achievements' });
    }

    // Projects count
    if (configData.projects?.repos) {
      stats.push({ value: configData.projects.repos.length, label: 'Projects', page: 'projects' });
    }

    // Blog posts
    if (configData.blog?.posts) {
      stats.push({ value: configData.blog.posts.length, label: 'Blog Posts', page: 'blog' });
    }

    statsEl.innerHTML = stats.map(s => `
      <a href="#/${s.page}" class="hero-stat">
        <div class="hero-stat-value">${s.value}</div>
        <div class="hero-stat-label">${s.label}</div>
      </a>
    `).join('');
  }

  // ---------- Utilities ----------
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function lighten(hex, amt = 40) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);
    r = Math.min(255, r + amt);
    g = Math.min(255, g + amt);
    b = Math.min(255, b + amt);
    return `rgb(${r}, ${g}, ${b})`;
  }

  // ---------- Init ----------
  async function init() {
    initTheme();
    initLang();
    initParticles();
    initModal();
    initHamburger();

    const config = await loadConfig();
    if (!config) {
      document.getElementById('hero-name').textContent = 'Config Error';
      return;
    }

    configData = config;

    // Always render About page first
    renderProfile(config.profile);
    renderHeroStats();
    renderedPages.add('about');

    // Init router (will render the current hash page)
    initRouter();
  }

  // Start
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
