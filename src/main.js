import '@fontsource-variable/geist';
import '@fontsource-variable/geist-mono';
import './styles.css';
import { inject } from '@vercel/analytics';

const root = document.documentElement;

/* Theme toggle — dark by default, choice saved per visitor */
const themeBtn = document.getElementById('theme-toggle');
const themeColor = document.querySelector('meta[name="theme-color"]');
const applyTheme = (theme) => {
  root.dataset.theme = theme;
  themeBtn?.setAttribute('aria-pressed', String(theme === 'light'));
  themeColor?.setAttribute('content', theme === 'light' ? '#f7f7f5' : '#0b0c0f');
};
applyTheme(root.dataset.theme === 'light' ? 'light' : 'dark');
themeBtn?.addEventListener('click', () => {
  const next = root.dataset.theme === 'light' ? 'dark' : 'light';
  root.classList.add('theme-anim');
  applyTheme(next);
  window.setTimeout(() => root.classList.remove('theme-anim'), 300);
  try {
    localStorage.setItem('theme', next);
  } catch {
    /* storage blocked — theme just won't persist */
  }
});

/* Mobile menu */
const header = document.getElementById('header');
const menuBtn = document.getElementById('menu-toggle');
const setMenu = (open) => {
  header.classList.toggle('is-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? menuBtn.dataset.labelClose : menuBtn.dataset.labelOpen);
};
menuBtn?.addEventListener('click', () => setMenu(!header.classList.contains('is-open')));
document.querySelectorAll('#nav a').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && header.classList.contains('is-open')) {
    setMenu(false);
    menuBtn.focus();
  }
});

/* Header border once the page is scrolled */
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
onScroll();
window.addEventListener('scroll', onScroll, { passive: true });

/* Copy email */
document.querySelectorAll('[data-copy]').forEach((btn) => {
  const label = btn.querySelector('span');
  const original = label.textContent;
  btn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(btn.dataset.copy);
      label.textContent = btn.dataset.copied;
      btn.classList.add('is-done');
      window.setTimeout(() => {
        label.textContent = original;
        btn.classList.remove('is-done');
      }, 2000);
    } catch {
      window.location.href = `mailto:${btn.dataset.copy}`;
    }
  });
});

/* Keep the footer year current even if the build is old */
const year = document.getElementById('year');
if (year) year.textContent = String(new Date().getFullYear());

inject();
