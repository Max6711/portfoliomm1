// Build-time renderer: turns src/content.json into static HTML.
// Runs in Node (via the Vite plugin in vite.config.js) — nothing here ships to the browser.

const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const ext = 'target="_blank" rel="noopener noreferrer"';

/* ---------- Icons (inline SVG, decorative) ---------- */
const ICONS = {
  download: '<path d="M12 4v11m0 0-4.5-4.5M12 15l4.5-4.5M5 19h14"/>',
  linkedin:
    '<path fill="currentColor" stroke="none" d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4v11H3v-11Zm6.5 0h3.83v1.5h.06c.53-1 1.84-2.06 3.79-2.06 4.05 0 4.8 2.67 4.8 6.13v5.43h-4v-4.82c0-1.15-.02-2.63-1.6-2.63-1.6 0-1.85 1.25-1.85 2.55v4.9h-4v-11Z"/>',
  github:
    '<path fill="currentColor" stroke="none" d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.33-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02A9.56 9.56 0 0 1 12 6.84c.85 0 1.71.11 2.51.34 1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
  phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>',
  arrow: '<path d="M7 17 17 7M8 7h9v9"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>',
  moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h8"/>',
  check: '<path d="m5 12 5 5 9-10"/>',
  lock: '<rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
};

const icon = (name, size = 18, cls = '') =>
  `<svg class="icon${cls ? ' ' + cls : ''}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONS[name]}</svg>`;

/* ---------- Architecture diagram (Bartali) ---------- */
function node(x, y, w, h, title, sub, accent = false) {
  return `<g class="dg-node${accent ? ' dg-node--accent' : ''}">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>
    <text x="${x + w / 2}" y="${y + h / 2 - 3}" class="dg-title" text-anchor="middle">${esc(title)}</text>
    <text x="${x + w / 2}" y="${y + h / 2 + 15}" class="dg-sub" text-anchor="middle">${esc(sub)}</text>
  </g>`;
}
const edge = (d) => `<path class="dg-edge" d="${d}" marker-end="url(#dg-arrow-__ID__)"/>`;

function diagramSvg(layout) {
  const id = layout;
  const marker = `<defs><marker id="dg-arrow-${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0 10 5 0 10z" class="dg-head"/></marker></defs>`;
  const title = `<title id="dg-title-${id}">Bartali platform architecture</title><desc id="dg-desc-${id}">The PWA client talks to a FastAPI backend. FastAPI uses SQLite for application data and a PostgreSQL knowledge base protected by row-level security. A content pipeline loads materials into the knowledge base.</desc>`;
  let body;
  let vb;
  if (layout === 'wide') {
    vb = '0 0 820 250';
    body =
      node(10, 95, 150, 60, 'PWA client', 'HTML · CSS · JS') +
      node(220, 95, 150, 60, 'FastAPI', 'Python backend', true) +
      node(440, 20, 170, 60, 'SQLite', 'application data') +
      node(440, 170, 170, 60, 'PostgreSQL', 'knowledge base · RLS') +
      node(660, 170, 150, 60, 'Content pipeline', 'schema & catalog') +
      edge('M160 125 H214') +
      edge('M370 112 H400 V50 H434') +
      edge('M370 138 H400 V200 H434') +
      edge('M660 200 H616');
  } else {
    vb = '0 0 340 420';
    body =
      node(95, 10, 150, 58, 'PWA client', 'HTML · CSS · JS') +
      node(95, 118, 150, 58, 'FastAPI', 'Python backend', true) +
      node(5, 236, 150, 58, 'SQLite', 'application data') +
      node(185, 236, 150, 58, 'PostgreSQL', 'knowledge base · RLS') +
      node(185, 352, 150, 58, 'Content pipeline', 'schema & catalog') +
      edge('M170 68 V112') +
      edge('M150 176 V206 H80 V230') +
      edge('M190 176 V206 H260 V230') +
      edge('M260 352 V300');
  }
  return `<svg class="diagram diagram--${layout}" viewBox="${vb}" role="img" aria-labelledby="dg-title-${id} dg-desc-${id}" xmlns="http://www.w3.org/2000/svg">${title}${marker}${body.replaceAll('__ID__', id)}</svg>`;
}

function diagram(ui) {
  return `<figure class="diagram-wrap">
    <figcaption class="diagram-cap">${esc(ui.diagramTitle)}</figcaption>
    ${diagramSvg('wide')}
    ${diagramSvg('tall')}
  </figure>`;
}

/* ---------- Sections ---------- */
function header(t, site) {
  const n = t.ui.nav;
  const links = [
    ['#work', n.work],
    ['#experience', n.experience],
    ['#skills', n.skills],
    ['#contact', n.contact],
  ];
  return `<header class="header" id="header">
  <div class="container header__bar">
    <a class="brand" href="#top">
      <span class="brand__mark" aria-hidden="true">${esc(t.person.initials)}</span>
      <span class="brand__name">${esc(t.person.name)}</span>
    </a>
    <nav class="nav" id="nav" aria-label="Main">
      <ul>${links.map(([h, l]) => `<li><a href="${h}">${esc(l)}</a></li>`).join('')}</ul>
    </nav>
    <div class="header__tools">
      <button class="icon-btn theme-btn" type="button" id="theme-toggle" aria-label="${esc(t.ui.themeToggle)}" title="${esc(t.ui.themeToggle)}">
        ${icon('sun', 18, 'icon-sun')}${icon('moon', 18, 'icon-moon')}
      </button>
      <a class="btn btn--sm btn--primary header__cv" href="${esc(site.cv)}" download>${icon('download', 16)}<span>CV</span></a>
      <button class="icon-btn menu-btn" type="button" id="menu-toggle" aria-expanded="false" aria-controls="nav" aria-label="${esc(t.ui.menuOpen)}" data-label-open="${esc(t.ui.menuOpen)}" data-label-close="${esc(t.ui.menuClose)}">
        ${icon('menu', 22, 'icon-menu')}${icon('close', 22, 'icon-close')}
      </button>
    </div>
  </div>
</header>`;
}

function hero(t, site) {
  const p = t.person;
  return `<section class="hero" id="top" aria-labelledby="hero-name">
  <div class="container">
    <p class="badge"><span class="badge__dot" aria-hidden="true"></span>${esc(p.badge)}</p>
    <div class="hero__id">
      ${
        p.photo
          ? `<img class="avatar" src="${esc(p.photo.src)}" alt="${esc(p.photo.alt)}" width="${p.photo.width}" height="${p.photo.height}" decoding="async">`
          : ''
      }
      <h1 class="hero__name" id="hero-name">${esc(p.name)}</h1>
    </div>
    <p class="hero__headline">${esc(p.headline)} <span class="hero__sep" aria-hidden="true">|</span> <span class="hero__suffix">${esc(p.headlineSuffix)}</span></p>
    <p class="hero__lead">${esc(p.oneLiner)}</p>
    <div class="hero__actions">
      <a class="btn btn--primary" href="${esc(site.cv)}" download>${icon('download')}${esc(t.ui.downloadCv)}</a>
      <a class="btn btn--secondary" href="${esc(p.linkedin)}" ${ext}>${icon('linkedin')}${esc(t.ui.linkedin)}</a>
      <a class="btn btn--ghost" href="#contact">${icon('mail')}${esc(t.ui.contact)}</a>
    </div>
    <dl class="hero__meta">
      <div class="hero__meta-roles">
        <dt>${esc(t.ui.targeting)}</dt>
        <dd><ul class="chips">${p.roles.map((r) => `<li>${esc(r)}</li>`).join('')}</ul></dd>
      </div>
      <div>
        <dt>${esc(t.ui.level)}</dt>
        <dd>${esc(p.level)}</dd>
      </div>
      <div>
        <dt>${esc(t.ui.location)}</dt>
        <dd>${esc(p.location)}</dd>
      </div>
      <div>
        <dt>${esc(t.ui.languages)}</dt>
        <dd>${p.languages.map((l) => `${esc(l.name)} <span class="muted">(${esc(l.level)})</span>`).join(', ')}</dd>
      </div>
    </dl>
  </div>
</section>`;
}

function proof(t) {
  return `<section class="proof" aria-label="Key numbers">
  <div class="container">
    <ul class="proof__list">
      ${t.proof
        .map(
          (s) => `<li class="proof__item">
        <span class="proof__value">${esc(s.value)}</span>
        <span class="proof__label">${esc(s.label)}${s.source ? ` <span class="proof__source">· ${esc(s.source)}</span>` : ''}</span>
      </li>`
        )
        .join('')}
    </ul>
  </div>
</section>`;
}

function sectionHead(eyebrow, title, id) {
  return `<div class="section-head">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h2 id="${id}">${esc(title)}</h2>
  </div>`;
}

function caseSection(s, project, ui) {
  const body = s.text ? `<p>${esc(s.text)}</p>` : `<ul class="ticks">${s.list.map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
  const isArch = project.diagram && /^architecture/i.test(s.heading);
  return `<div class="case__block${isArch ? ' case__block--wide' : ''}">
    <h4>${esc(s.heading)}</h4>
    ${body}
    ${isArch ? diagram(ui) : ''}
  </div>`;
}

function media(p, ui) {
  const m = p.media;
  if (!m) return '';
  const img = (src, cls, alt) =>
    `<img class="${cls}" src="${esc(src)}" alt="${esc(alt)}" width="${m.width}" height="${m.height}" loading="lazy" decoding="async">`;
  const imgs =
    m.light && m.dark && m.light !== m.dark
      ? img(m.dark, 'only-dark', m.alt) + img(m.light, 'only-light', m.alt)
      : img(m.light || m.dark, '', m.alt);
  return `<figure class="case__media">
    <div class="frame">
      <div class="frame__bar" aria-hidden="true"><span></span><span></span><span></span><em>${icon('lock', 11)}${esc(p.urlLabel)}</em></div>
      ${imgs}
    </div>
    ${m.caption ? `<figcaption>${esc(m.caption)}</figcaption>` : ''}
  </figure>`;
}

function project(p, i, ui) {
  const meta = [p.period, p.org].filter(Boolean).map(esc).join(' · ');
  return `<article class="case${p.media ? ' case--media' : ''}" id="project-${esc(p.id)}" aria-labelledby="project-${esc(p.id)}-title">
    <div class="case__main">
      <div class="case__head">
        <p class="case__meta">
          <span class="case__num">${String(i + 1).padStart(2, '0')}</span>
          ${p.status ? `<span class="status">${esc(p.status)}</span>` : ''}
          <span>${meta}</span>
        </p>
        <h3 id="project-${esc(p.id)}-title">${esc(p.title)}</h3>
        <p class="case__summary">${esc(p.summary)}</p>
        ${p.metric ? `<p class="metric"><strong>${esc(p.metric.value)}</strong> ${esc(p.metric.label)}</p>` : ''}
        <ul class="tags" aria-label="Stack">${p.tags.map((tg) => `<li>${esc(tg)}</li>`).join('')}</ul>
        ${
          p.url
            ? `<p class="case__links"><a class="link" href="${esc(p.url)}" ${ext}>${esc(ui.visit)} ${esc(p.urlLabel)}${icon('arrow', 16)}<span class="sr-only"> (opens in a new tab)</span></a>${
                p.loginRequired ? `<span class="note">${icon('lock', 13)}${esc(ui.loginNote)}</span>` : ''
              }</p>`
            : ''
        }
      </div>
      ${media(p, ui)}
    </div>
    <details class="case__details"${p.open ? ' open' : ''}>
      <summary>
        <span class="when-closed">${esc(ui.caseStudy)}</span>
        <span class="when-open">${esc(ui.caseStudyHide)}</span>
        ${icon('chevron', 18, 'chev')}
      </summary>
      <div class="case__body">
        ${p.sections.map((s) => caseSection(s, p, ui)).join('')}
      </div>
    </details>${
      // Open on desktop, collapsed on phones (decided before first paint, so no layout shift)
      p.open ? `<script>if(matchMedia('(max-width: 759px)').matches)document.currentScript.previousElementSibling.open=false</script>` : ''
    }
  </article>`;
}

function work(t) {
  return `<section class="section" id="work" aria-labelledby="work-title">
  <div class="container">
    ${sectionHead(t.ui.work.eyebrow, t.ui.work.title, 'work-title')}
    <div class="cases">
      ${t.projects.map((p, i) => project(p, i, t.ui)).join('')}
    </div>
  </div>
</section>`;
}

function experience(t) {
  return `<section class="section section--alt" id="experience" aria-labelledby="experience-title">
  <div class="container">
    ${sectionHead(t.ui.experience.eyebrow, t.ui.experience.title, 'experience-title')}
    <p class="story">${esc(t.person.story)}</p>
    <ol class="timeline">
      ${t.experience
        .map(
          (e) => `<li class="timeline__item">
        <div class="timeline__when">${esc(e.period)}</div>
        <div class="timeline__what">
          <h3>${esc(e.role)}</h3>
          <p class="timeline__org">${esc(e.org)}</p>
          <ul class="ticks">${e.points.map((pt) => `<li>${esc(pt)}</li>`).join('')}</ul>
        </div>
      </li>`
        )
        .join('')}
    </ol>
  </div>
</section>`;
}

function skills(t) {
  return `<section class="section" id="skills" aria-labelledby="skills-title">
  <div class="container">
    ${sectionHead(t.ui.skills.eyebrow, t.ui.skills.title, 'skills-title')}
    <div class="skills">
      ${t.skills
        .map(
          (g) => `<div class="skills__group">
        <h3>${esc(g.group)}</h3>
        <ul class="tags tags--lg">${g.items.map((s) => `<li>${esc(s)}</li>`).join('')}</ul>
      </div>`
        )
        .join('')}
    </div>
  </div>
</section>`;
}

function principles(t) {
  return `<section class="section section--alt" id="how-i-work" aria-labelledby="principles-title">
  <div class="container">
    ${sectionHead(t.ui.principles.eyebrow, t.ui.principles.title, 'principles-title')}
    <ol class="principles">
      ${t.principles
        .map(
          (p, i) => `<li class="principle">
        <span class="principle__num">${String(i + 1).padStart(2, '0')}</span>
        <h3>${esc(p.title)}</h3>
        <p>${esc(p.text)}</p>
      </li>`
        )
        .join('')}
    </ol>
  </div>
</section>`;
}

function education(t) {
  return `<section class="section section--tight" id="education" aria-labelledby="education-title">
  <div class="container">
    ${sectionHead(t.ui.education.eyebrow, t.ui.education.title, 'education-title')}
    <ul class="edu">
      ${t.education
        .map(
          (e) => `<li class="edu__item">
        <span class="edu__when">${esc(e.period)}</span>
        <span class="edu__what"><strong>${esc(e.title)}</strong>${e.place ? `<span>${esc(e.place)}</span>` : ''}</span>
      </li>`
        )
        .join('')}
    </ul>
  </div>
</section>`;
}

function freelance(t) {
  const f = t.freelance;
  const href = `mailto:${t.person.email}?subject=${encodeURIComponent(f.subject)}`;
  return `<section class="section section--tight" id="freelance" aria-labelledby="freelance-title">
  <div class="container">
    <div class="freelance">
      <div class="freelance__icon" aria-hidden="true">${icon('briefcase', 22)}</div>
      <div class="freelance__text">
        <h2 id="freelance-title">${esc(f.title)}</h2>
        <p>${esc(f.text)}</p>
      </div>
      <a class="btn btn--secondary" href="${esc(href)}">${icon('mail')}${esc(f.button)}</a>
    </div>
  </div>
</section>`;
}

function contact(t) {
  const p = t.person;
  const c = t.ui.contactSection;
  const row = (ic, label, inner) => `<li class="contact__row">
      <span class="contact__icon" aria-hidden="true">${icon(ic)}</span>
      <span class="contact__label">${esc(label)}</span>
      <span class="contact__value">${inner}</span>
    </li>`;
  return `<section class="section" id="contact" aria-labelledby="contact-title">
  <div class="container contact">
    <div class="contact__intro">
      ${sectionHead(c.eyebrow, c.title, 'contact-title')}
      <p class="contact__text">${esc(c.text)}</p>
      <div class="contact__cta">
        <a class="btn btn--primary" href="mailto:${esc(p.email)}">${icon('mail')}${esc(p.email)}</a>
        <button class="btn btn--ghost copy-btn" type="button" data-copy="${esc(p.email)}" data-copied="${esc(t.ui.copied)}">${icon('copy', 16)}<span>${esc(t.ui.copy)}</span></button>
      </div>
    </div>
    <ul class="contact__list">
      ${row('mail', t.ui.email, `<a href="mailto:${esc(p.email)}">${esc(p.email)}</a>`)}
      ${row('phone', t.ui.phone, `<a href="tel:${esc(p.phone)}">${esc(p.phoneDisplay)}</a>`)}
      ${row('linkedin', t.ui.linkedin, `<a href="${esc(p.linkedin)}" ${ext}>${esc(p.linkedinLabel)}</a>`)}
      ${row('github', t.ui.github, `<a href="${esc(p.github)}" ${ext}>${esc(p.githubLabel)}</a>`)}
      ${row('pin', t.ui.location, esc(p.location))}
    </ul>
  </div>
</section>`;
}

function footer(t) {
  const year = new Date().getFullYear();
  return `<footer class="footer">
  <div class="container footer__bar">
    <p>© <span id="year">${year}</span> ${esc(t.person.name)}</p>
    <p class="footer__built">${esc(t.footer)}</p>
    <a href="#top">${esc(t.ui.backToTop)} ↑</a>
  </div>
</footer>`;
}

/* ---------- <head> ---------- */
function head(t, site) {
  const p = t.person;
  const url = site.url.replace(/\/$/, '') + '/';
  const og = site.url.replace(/\/$/, '') + site.ogImage;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: p.name,
    jobTitle: p.headline,
    url,
    email: `mailto:${p.email}`,
    image: p.photo ? site.url.replace(/\/$/, '') + p.photo.src : og,
    address: { '@type': 'PostalAddress', addressLocality: p.location.split(',')[0].trim(), addressCountry: 'IL' },
    knowsLanguage: p.languages.map((l) => l.name),
    sameAs: [p.linkedin, p.github],
  };
  return `<title>${esc(t.meta.title)}</title>
    <meta name="description" content="${esc(t.meta.description)}">
    <link rel="canonical" href="${esc(url)}">
    <meta property="og:type" content="profile">
    <meta property="og:url" content="${esc(url)}">
    <meta property="og:title" content="${esc(t.meta.title)}">
    <meta property="og:description" content="${esc(t.meta.description)}">
    <meta property="og:image" content="${esc(og)}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${esc(p.name)} — ${esc(p.headline)}">
    <meta property="og:locale" content="en_US">
    <meta property="profile:first_name" content="${esc(p.name.split(' ')[0])}">
    <meta property="profile:last_name" content="${esc(p.name.split(' ').slice(1).join(' '))}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(t.meta.title)}">
    <meta name="twitter:description" content="${esc(t.meta.description)}">
    <meta name="twitter:image" content="${esc(og)}">
    <script type="application/ld+json">${JSON.stringify(ld).replace(/</g, '\\u003c')}</script>`;
}

/* ---------- Page ---------- */
export function renderPage(template, content, locale = content.site.defaultLocale) {
  const t = content.locales[locale];
  const site = content.site;
  const body = `<a class="skip-link" href="#main">${esc(t.ui.skip)}</a>
${header(t, site)}
<main id="main">
${hero(t, site)}
${proof(t)}
${work(t)}
${experience(t)}
${skills(t)}
${principles(t)}
${education(t)}
${freelance(t)}
${contact(t)}
</main>
${footer(t)}`;
  return template
    .replace('__LANG__', esc(t.lang))
    .replace('__DIR__', esc(t.dir))
    .replace('<!--app-head-->', head(t, site))
    .replace('<!--app-body-->', body);
}
