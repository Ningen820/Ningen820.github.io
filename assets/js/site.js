(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const menuToggle = document.querySelector('[data-menu-toggle]');
  const navLinks = document.querySelector('[data-nav-links]');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const open = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!open));
      menuToggle.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
      navLinks.classList.toggle('is-open', !open);
    });
    navLinks.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Open navigation');
    }));
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        navLinks.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // A low-contrast matrix background is decorative only and pauses for reduced-motion settings.
  const canvas = document.getElementById('matrix-canvas');
  if (canvas && !reducedMotion) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const glyphs = 'ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉ012345789ABCDEF';
      let width = 0;
      let height = 0;
      let columns = 0;
      let drops = [];
      let raf = 0;
      let lastDraw = 0;
      const fontSize = 13;
      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(height * dpr);
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        columns = Math.ceil(width / fontSize);
        drops = Array.from({ length: columns }, () => Math.random() * (height / fontSize));
      };
      const draw = (time) => {
        if (time - lastDraw < 90) { raf = requestAnimationFrame(draw); return; }
        lastDraw = time;
        ctx.fillStyle = 'rgba(8, 11, 17, 0.13)';
        ctx.fillRect(0, 0, width, height);
        ctx.font = `${fontSize}px ${getComputedStyle(document.body).fontFamily}`;
        for (let i = 0; i < drops.length; i += 1) {
          const char = glyphs[Math.floor(Math.random() * glyphs.length)];
          ctx.fillStyle = i % 9 === 0 ? 'rgba(0, 245, 160, 0.52)' : 'rgba(0, 178, 119, 0.26)';
          ctx.fillText(char, i * fontSize, drops[i] * fontSize);
          if (drops[i] * fontSize > height && Math.random() > 0.98) drops[i] = 0;
          drops[i] += 0.22;
        }
        raf = requestAnimationFrame(draw);
      };
      resize();
      canvas.style.opacity = '0.11';
      raf = requestAnimationFrame(draw);
      window.addEventListener('resize', resize, { passive: true });
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) cancelAnimationFrame(raf);
        else raf = requestAnimationFrame(draw);
      });
    }
  }

  // Mouse-following highlights on panels: CSS only, and only when a pointing device is present.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.querySelectorAll('.spotlight').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        card.style.setProperty('--mx', `${event.clientX - rect.left}px`);
        card.style.setProperty('--my', `${event.clientY - rect.top}px`);
      }, { passive: true });
    });
  }

  // Scroll reveal is intentionally subtle; no hidden content depends on JavaScript.
  const revealTargets = document.querySelectorAll('.content-section, .page-intro, .writeup-card, .achievement-card, .cert-card, .experience-row');
  if ('IntersectionObserver' in window && !reducedMotion) {
    const observer = new IntersectionObserver((entries, instance) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          instance.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06 });
    revealTargets.forEach((element) => {
      element.classList.add('reveal');
      observer.observe(element);
    });
  }

  // Build the long-form table of contents from rendered Markdown headings.
  const article = document.querySelector('[data-writeup-content]');
  const toc = document.getElementById('writeup-toc');
  if (article && toc) {
    const headings = Array.from(article.querySelectorAll('h2, h3'));
    toc.replaceChildren();
    if (!headings.length) {
      const note = document.createElement('p');
      note.className = 'toc-loading';
      note.textContent = 'No sections found.';
      toc.append(note);
    } else {
      const used = new Set();
      headings.forEach((heading, index) => {
        const base = heading.textContent.trim().toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `section-${index + 1}`;
        let id = base;
        let suffix = 2;
        while (used.has(id) || (document.getElementById(id) && document.getElementById(id) !== heading)) {
          id = `${base}-${suffix}`;
          suffix += 1;
        }
        used.add(id);
        heading.id = id;
        const link = document.createElement('a');
        link.href = `#${id}`;
        link.textContent = heading.textContent.replace(/^\d+\s*\/\s*/, '');
        if (heading.tagName === 'H3') link.classList.add('toc-h3');
        link.addEventListener('click', () => {
          if (window.innerWidth <= 850) link.scrollIntoView({ block: 'nearest' });
        });
        toc.append(link);
      });
      if ('IntersectionObserver' in window) {
        const tocLinks = Array.from(toc.querySelectorAll('a'));
        const byId = new Map(tocLinks.map((link) => [link.hash.slice(1), link]));
        const activeObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              tocLinks.forEach((link) => link.classList.remove('is-active'));
              byId.get(entry.target.id)?.classList.add('is-active');
            }
          });
        }, { rootMargin: '-12% 0px -72% 0px' });
        headings.forEach((heading) => activeObserver.observe(heading));
      }
    }
  }

  // Add copy buttons to real code blocks; code remains selectable if clipboard access is unavailable.
  document.querySelectorAll('[data-writeup-content] pre').forEach((pre) => {
    if (pre.querySelector('.copy-code-button')) return;
    pre.style.position = 'relative';
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code-button';
    button.textContent = 'COPY';
    button.setAttribute('aria-label', 'Copy code block');
    button.addEventListener('click', async () => {
      const code = pre.querySelector('code')?.innerText || pre.innerText;
      const original = button.textContent;
      try {
        await navigator.clipboard.writeText(code);
        button.textContent = 'COPIED';
      } catch (_) {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(pre.querySelector('code') || pre);
        selection.removeAllRanges();
        selection.addRange(range);
        button.textContent = 'SELECTED';
      }
      window.setTimeout(() => { button.textContent = original; }, 1500);
    });
    pre.append(button);
  });

  // Functional search, filters, statistics and sorting for the Jekyll-generated writeup archive.
  const archive = document.querySelector('[data-writeup-archive]');
  if (archive) {
    const list = document.getElementById('writeup-results');
    const rows = Array.from(list.querySelectorAll('[data-writeup-row]'));
    const search = document.getElementById('writeup-search');
    const category = document.getElementById('filter-category');
    const difficulty = document.getElementById('filter-difficulty');
    const platform = document.getElementById('filter-platform');
    const os = document.getElementById('filter-os');
    const sort = document.getElementById('sort-writeups');
    const clear = document.getElementById('clear-writeup-filters');
    const empty = document.querySelector('[data-empty-writeups]');
    const resultCount = document.querySelector('[data-result-count]');
    const setText = (selector, value) => { const node = archive.querySelector(selector); if (node) node.textContent = String(value); };
    const norm = (value) => (value || '').trim();
    const unique = (field) => [...new Set(rows.map((row) => norm(row.dataset[field])).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
    const populate = (select, field, allLabel) => {
      unique(field).forEach((value) => {
        const option = document.createElement('option'); option.value = value; option.textContent = value; select.append(option);
      });
      select.setAttribute('aria-label', allLabel);
    };
    populate(category, 'category', 'Filter by category');
    populate(difficulty, 'difficulty', 'Filter by difficulty');
    populate(platform, 'platform', 'Filter by platform');
    populate(os, 'os', 'Filter by operating system');
    setText('[data-stat-total]', rows.length);
    setText('[data-stat-categories]', unique('category').length);
    setText('[data-stat-difficulties]', unique('difficulty').length);
    setText('[data-stat-platforms]', unique('platform').length);
    const breakdown = archive.querySelector('[data-category-summary]');
    unique('category').forEach((value) => {
      const count = rows.filter((row) => norm(row.dataset.category) === value).length;
      const chip = document.createElement('span'); chip.className = 'category-count';
      const label = document.createElement('span'); label.textContent = value;
      const amount = document.createElement('strong'); amount.textContent = count;
      chip.append(label, amount); breakdown.append(chip);
    });
    const difficultyRank = (value) => ({ easy: 1, medium: 2, hard: 3, insane: 4, unrated: 99 }[(value || '').toLowerCase()] || 98);
    const apply = () => {
      const query = norm(search.value).toLowerCase();
      const visible = rows.filter((row) => {
        const searchable = [row.dataset.title, row.dataset.summary, row.dataset.category, row.dataset.difficulty, row.dataset.platform, row.dataset.os].join(' ').toLowerCase();
        return (!query || searchable.includes(query))
          && (!category.value || row.dataset.category === category.value)
          && (!difficulty.value || row.dataset.difficulty === difficulty.value)
          && (!platform.value || row.dataset.platform === platform.value)
          && (!os.value || row.dataset.os === os.value);
      });
      const mode = sort.value;
      visible.sort((a, b) => {
        if (mode === 'title') return norm(a.dataset.title).localeCompare(norm(b.dataset.title), undefined, { sensitivity: 'base' });
        if (mode === 'difficulty') return difficultyRank(a.dataset.difficulty) - difficultyRank(b.dataset.difficulty) || norm(a.dataset.title).localeCompare(norm(b.dataset.title));
        if (mode === 'date') return (Date.parse(b.dataset.date || '') || -Infinity) - (Date.parse(a.dataset.date || '') || -Infinity) || norm(a.dataset.title).localeCompare(norm(b.dataset.title));
        return (Number(b.dataset.readTime) || 0) - (Number(a.dataset.readTime) || 0) || norm(a.dataset.title).localeCompare(norm(b.dataset.title));
      });
      rows.forEach((row) => { row.hidden = !visible.includes(row); });
      visible.forEach((row) => list.append(row));
      resultCount.textContent = visible.length;
      empty.hidden = visible.length !== 0;
    };
    [search, category, difficulty, platform, os, sort].forEach((control) => control.addEventListener(control === search ? 'input' : 'change', apply));
    clear.addEventListener('click', () => {
      search.value = ''; category.value = ''; difficulty.value = ''; platform.value = ''; os.value = ''; sort.value = 'reading_time'; apply(); search.focus();
    });
    apply();
  }
})();
