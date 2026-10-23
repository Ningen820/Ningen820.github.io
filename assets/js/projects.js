(() => {
  'use strict';

  // Change this one value to alter the number of homepage project recommendations.
  const homeProjectLimit = 2;
  const apiRoot = 'https://api.github.com';

  const decodeBase64 = (value) => {
    try {
      const binary = atob(value.replace(/\n/g, ''));
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      return new TextDecoder().decode(bytes);
    } catch (_) { return ''; }
  };

  const unquote = (value) => {
    const clean = String(value || '').trim();
    if ((clean.startsWith('"') && clean.endsWith('"')) || (clean.startsWith("'") && clean.endsWith("'"))) return clean.slice(1, -1);
    return clean;
  };

  const parseReadme = (text, fallbackName) => {
    const result = { title: fallbackName.replace(/[-_]+/g, ' '), description: '', release_date: '', repository: '', image: '', image_alt: '', draft: false };
    let body = text || '';
    const frontMatter = body.match(/^---\s*\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
    if (frontMatter) {
      frontMatter[1].split(/\r?\n/).forEach((line) => {
        const match = line.match(/^\s*([A-Za-z_][\w-]*)\s*:\s*(.*?)\s*$/);
        if (!match) return;
        const key = match[1].toLowerCase();
        const value = unquote(match[2]);
        if (key === 'title' || key === 'description' || key === 'release_date' || key === 'repository' || key === 'image' || key === 'image_alt') result[key] = value;
        if (key === 'releasedate' && !result.release_date) result.release_date = value;
        if (key === 'draft') result.draft = value.toLowerCase() === 'true';
      });
      body = body.slice(frontMatter[0].length);
    }
    const firstHeading = body.match(/^#\s+(.+)$/m);
    if (!frontMatter || !frontMatter[1].match(/^\s*title\s*:/mi)) {
      if (firstHeading) result.title = firstHeading[1].replace(/`/g, '').trim();
    }
    if (!result.description) {
      const paragraphs = body.split(/\r?\n\s*\r?\n/).map((p) => p.trim()).filter(Boolean);
      const paragraph = paragraphs.find((p) => !p.startsWith('#') && !p.startsWith('![') && !p.startsWith('```') && !p.startsWith('>'));
      if (paragraph) result.description = paragraph.replace(/[`*_~]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').slice(0, 210);
    }
    if (!result.release_date) {
      const dateHeading = body.match(/(?:release date|released)\s*:\s*(\d{4}-\d{2}-\d{2})/i);
      if (dateHeading) result.release_date = dateHeading[1];
    }
    return result;
  };

  const fetchJson = async (url) => {
    const response = await fetch(url, { headers: { Accept: 'application/vnd.github+json' } });
    if (!response.ok) throw new Error(`GitHub API returned ${response.status}`);
    return response.json();
  };

  const fetchDirectoryReadme = async (repo, folder) => {
    const entries = await fetchJson(`${apiRoot}/repos/${repo}/contents/projects/${encodeURIComponent(folder)}`);
    const readme = entries.find((entry) => entry.type === 'file' && /^readme\.md$/i.test(entry.name));
    if (!readme) return { text: '', url: '' };
    const response = await fetch(readme.download_url);
    if (!response.ok) return { text: '', url: readme.html_url || '' };
    return { text: await response.text(), url: readme.html_url || '' };
  };

  const resolveReleaseDate = async (project) => {
    if (project.repository && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(project.repository)) {
      try {
        const release = await fetchJson(`${apiRoot}/repos/${project.repository}/releases/latest`);
        if (release && release.published_at) return release.published_at.slice(0, 10);
      } catch (_) { /* An unavailable release endpoint falls back to README front matter. */ }
    }
    return /^\d{4}-\d{2}-\d{2}$/.test(project.release_date) ? project.release_date : '';
  };

  const resolveProjectImage = (repo, folder, imagePath) => {
    if (!imagePath) return '';
    const path = imagePath.trim();
    if (/^https?:\/\//i.test(path)) return path;
    if (path.startsWith('/')) return `https://raw.githubusercontent.com/${repo}/HEAD${path}`;
    // Paths are relative to the project's own folder. Accept both image.png and project-name/image.png.
    const relative = path.replace(/^\.\//, '').replace(new RegExp(`^${folder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/`), '');
    return `https://raw.githubusercontent.com/${repo}/HEAD/projects/${encodeURIComponent(folder)}/${relative.split('/').map(encodeURIComponent).join('/')}`;
  };

  const makeFallbackSymbol = () => { const symbol = document.createElement('span'); symbol.className = 'project-symbol'; symbol.textContent = './'; symbol.setAttribute('aria-hidden', 'true'); return symbol; };

  const makeCard = (project) => {
    const card = document.createElement('a');
    card.className = 'project-card spotlight';
    card.href = project.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';
    const head = document.createElement('div'); head.className = 'project-card-head';
    if (project.image) {
      const image = document.createElement('img'); image.className = 'project-symbol project-symbol-image'; image.src = project.image; image.alt = project.imageAlt || `${project.title} project image`; image.loading = 'lazy';
      image.addEventListener('error', () => { image.replaceWith(makeFallbackSymbol()); }, { once: true });
      head.append(image);
    } else { head.append(makeFallbackSymbol()); }
    const date = document.createElement('span'); date.className = 'project-date';
    date.textContent = project.releaseDate ? `RELEASE / ${project.releaseDate}` : 'RELEASE / NOT SET';
    head.append(date);
    const title = document.createElement('h3'); title.textContent = project.title;
    const description = document.createElement('p'); description.textContent = project.description || 'Project folder found. Add a short description to its README front matter or opening paragraph.';
    const foot = document.createElement('div'); foot.className = 'project-card-foot';
    const folder = document.createElement('span'); folder.className = 'project-folder'; folder.textContent = `projects/${project.name}/`;
    const open = document.createElement('span'); open.className = 'project-open'; open.textContent = 'Open on GitHub ';
    const arrow = document.createElement('span'); arrow.textContent = '↗'; arrow.setAttribute('aria-hidden', 'true'); open.append(arrow);
    foot.append(folder, open);
    card.append(head, title, description, foot);
    return card;
  };

  const initContainer = async (container) => {
    const repo = container.dataset.repo || document.body.dataset.repo;
    const mode = container.dataset.projectMode || 'all';
    if (!repo || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repo)) {
      container.innerHTML = '<div class="loading-state">Project discovery is not configured. Set <code>repository</code> in _config.yml.</div>';
      return;
    }
    const status = container.parentElement?.querySelector('[data-project-status]') || document.querySelector('[data-project-status]');
    const count = document.querySelector('[data-project-count]');
    const profileRepoUrl = `https://github.com/${repo}`;
    try {
      const directories = await fetchJson(`${apiRoot}/repos/${repo}/contents/projects`);
      const folders = directories.filter((entry) => entry.type === 'dir');
      const projects = await Promise.all(folders.map(async (folder) => {
        const readme = await fetchDirectoryReadme(repo, folder.name).catch(() => ({ text: '', url: '' }));
        const meta = parseReadme(readme.text, folder.name);
        const project = {
          name: folder.name,
          title: meta.title,
          description: meta.description,
          repository: meta.repository,
          release_date: meta.release_date,
          image: resolveProjectImage(repo, folder.name, meta.image),
          imageAlt: meta.image_alt,
          url: folder.html_url || `${profileRepoUrl}/tree/HEAD/projects/${encodeURIComponent(folder.name)}`,
          draft: meta.draft,
        };
        project.releaseDate = await resolveReleaseDate(project);
        return project;
      }));
      const visible = projects.filter((project) => !project.draft);
      visible.sort((a, b) => {
        if (a.releaseDate && b.releaseDate) return b.releaseDate.localeCompare(a.releaseDate) || a.title.localeCompare(b.title);
        if (a.releaseDate) return -1;
        if (b.releaseDate) return 1;
        return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
      });
      const selected = mode === 'home' ? visible.slice(0, homeProjectLimit) : visible;
      container.replaceChildren();
      if (selected.length) selected.forEach((project) => container.append(makeCard(project)));
      else {
        const empty = document.createElement('div'); empty.className = 'loading-state';
        empty.textContent = mode === 'home' ? 'No published project folders yet. Add a README to a folder in projects/.' : 'No published project folders found. Draft folders are hidden until draft: false.';
        container.append(empty);
      }
      if (status) status.textContent = `${visible.length} published project folder${visible.length === 1 ? '' : 's'} found.`;
      if (count) count.textContent = `${visible.length} project folder${visible.length === 1 ? '' : 's'} found`;
    } catch (error) {
      container.replaceChildren();
      const fallback = document.createElement('div'); fallback.className = 'loading-state';
      fallback.textContent = 'Could not load the project directory from GitHub. Check the repository name, public access, and API rate limit.';
      const link = document.createElement('a'); link.href = `${profileRepoUrl}/tree/HEAD/projects`; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.className = 'text-link'; link.textContent = 'Open projects directory on GitHub ↗';
      fallback.append(document.createTextNode(' '), link);
      container.append(fallback);
      if (status) status.textContent = error.message;
      if (count) count.textContent = 'Project discovery unavailable';
    }
  };

  document.querySelectorAll('[data-projects-root]').forEach((container) => { initContainer(container); });
})();
