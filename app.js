const fallbackContent = { site: { name: 'Portfolio', headline: 'Portfolio', heroHeadline: 'Data. Insight. Decision.', bio: '', email: '', phone: '', linkedin: '', github: '', resume: '', profileImage: '' }, sections: [], skills: [], projects: [], certifications: [], insights: [], calculators: {}, footer: {} };
let content = fallbackContent;

const esc = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const text = value => esc(value).replace(/\n/g, '<br>');
const resolve = (value, site) => String(value ?? '').replace(/\{\{(\w+)\}\}/g, (_, key) => site[key] ?? '');
const link = (value, kind = '') => kind === 'email' ? `mailto:${value}` : kind === 'phone' ? `tel:${value}` : value || '#';
const sectionMap = () => Object.fromEntries(content.sections.filter(section => section.visible !== false).map(section => [section.id, section]));

function render(contentOverride = content) {
  content = contentOverride;
  const site = content.site;
  document.title = site.seo?.title || `${site.name} | Portfolio`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', site.seo?.description || site.bio || 'Professional portfolio');
  const sections = sectionMap();
  const nav = content.sections.filter(section => section.visible !== false).map(section => `<a href="#${esc(section.id)}">${esc(section.label || section.id)}</a>`).join('');
  document.getElementById('app').innerHTML = `
    <header class="site-header" id="home"><nav class="nav container" aria-label="Main navigation">
      <a class="brand" href="#home"><span class="brand-mark">N</span><span>${esc(site.shortName || site.name)}</span></a>
      <div class="nav-links" id="navLinks">${nav}</div>
      <div class="nav-actions"><a class="icon-link" href="${esc(link(site.linkedin))}" aria-label="LinkedIn" target="_blank" rel="noopener"><i data-lucide="network"></i></a><a class="icon-link" href="${esc(link(site.github))}" aria-label="GitHub" target="_blank" rel="noopener"><i data-lucide="code-2"></i></a><a class="button button-small button-ink" href="#contact">Let's Connect</a><button class="menu-toggle" id="menuToggle" aria-label="Open menu" aria-expanded="false"><i data-lucide="menu"></i></button></div>
    </nav></header>
    <main>
      <section class="hero section container"><div class="hero-copy reveal"><p class="eyebrow"><span class="eyebrow-line"></span>${esc(site.heroLabel)}</p><h1>${esc(site.heroHeadline)}</h1><p class="hero-title">${esc(site.headline)}</p><p class="hero-intro">${text(site.bio)}</p><div class="hero-actions"><a class="button button-ink" href="#projects">Explore My Work <i data-lucide="arrow-up-right"></i></a>${site.resume ? `<a class="text-link" href="${esc(site.resume)}" target="_blank" rel="noopener">View Resume <i data-lucide="download"></i></a>` : ''}</div><div class="hero-meta"><span>01 / ${String(content.sections.length).padStart(2, '0')}</span><span>Data → Insight → Decision</span></div></div><div class="hero-visual reveal reveal-delay"><div class="photo-frame"><div class="photo-backdrop"></div><img src="${esc(site.profileImage)}" alt="Professional portrait of ${esc(site.name)}" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'"><div class="photo-placeholder"><i data-lucide="user-round"></i><strong>PROFILE PHOTO</strong><small>Add <code>/profile.jpg</code></small></div><span class="photo-label">N · 2026</span></div><div class="float-tag tag-python">Python <span></span></div><div class="float-tag tag-sql">SQL <span></span></div><div class="float-tag tag-finance">Finance <span></span></div><div class="photo-socials"><a href="${esc(link(site.linkedin))}" target="_blank" rel="noopener"><i data-lucide="network"></i> LinkedIn</a><a href="${esc(link(site.github))}" target="_blank" rel="noopener"><i data-lucide="code-2"></i> GitHub</a><a href="${esc(link(site.email, 'email'))}"><i data-lucide="mail"></i> Email</a></div></div></section>
      <section class="ticker" aria-label="Areas of focus"><div class="ticker-track"><span>DATA ANALYTICS</span><b>✦</b><span>BUSINESS ANALYSIS</span><b>✦</b><span>FINANCIAL THINKING</span><b>✦</b><span>TECHNOLOGY</span><b>✦</b><span>DATA ANALYTICS</span><b>✦</b><span>BUSINESS ANALYSIS</span></div></section>
      ${renderSections(sections, site)}
    </main>
    <footer class="footer"><div class="container footer-top"><div><a class="brand" href="#home"><span class="brand-mark">N</span><span>${esc(site.shortName || site.name)}</span></a><p>${esc(content.footer.tagline || '')}</p></div><div class="footer-links">${nav}</div><div class="footer-social"><a href="${esc(link(site.linkedin))}" target="_blank" rel="noopener" aria-label="LinkedIn"><i data-lucide="network"></i></a><a href="${esc(link(site.github))}" target="_blank" rel="noopener" aria-label="GitHub"><i data-lucide="code-2"></i></a><a href="${esc(link(site.email, 'email'))}" aria-label="Email"><i data-lucide="mail"></i></a></div></div><div class="container footer-bottom"><span>${esc(content.footer.copyright || '')}</span><span>${esc(content.footer.strapline || '')}</span></div></footer>`;
  bindInteractions();
  if (window.lucide) lucide.createIcons();
}

function renderSections(sections, site) {
  return Object.values(sections).map(section => {
    const body = section.blocks.map(block => renderBlock(block, site, section)).join('');
    const tone = ['projects', 'resume'].includes(section.id) ? ' section-dark' : ['about', 'thinking', 'insights'].includes(section.id) ? ' section-tint' : section.id === 'contact' || section.id === 'case-study' ? ' section-coral' : '';
    return `<section class="content-section section${tone}" id="${esc(section.id)}"><div class="container"><div class="section-head ${tone.includes('dark') ? 'light' : ''} reveal"><div><p class="eyebrow">${esc(section.label)}</p><h2>${text(resolve(section.title, site))}</h2></div><p>${text(resolve(section.subtitle, site))}</p></div><div class="section-body reveal">${body}</div></div></section>`;
  }).join('');
}

function renderBlock(block, site, section) {
  if (block.type === 'text') return `<div class="editable-text">${text(resolve(block.text, site))}</div>`;
  if (block.type === 'list') return `<ul class="editor-list">${block.items.map(item => `<li>${text(resolve(item, site))}</li>`).join('')}</ul>`;
  if (block.type === 'cards') return `<div class="snapshot-grid editable-cards">${block.items.map((item, index) => `<article class="snapshot-card card-${esc(item.tone || ['navy','coral','cream','sage'][index % 4])}"><span class="card-index">${String(index + 1).padStart(2, '0')}</span><i data-lucide="${index % 2 ? 'briefcase-business' : 'bar-chart-3'}"></i><h3>${esc(item.title)}</h3><p>${text(resolve(item.body, site))}</p></article>`).join('')}</div>`;
  if (block.type === 'skills') return `<div class="skills-layout"><div class="skill-list" id="skillList"></div><aside class="skill-aside"><div class="skill-stat"><strong>${content.skills.length}</strong><span>skills mapped</span></div><div class="skill-note"><i data-lucide="sparkles"></i><p>Good analysis is a habit of asking better questions.</p></div></aside></div>`;
  if (block.type === 'process') return `<div class="thinking-flow">${block.items.map((item, index) => `${index ? '<i data-lucide="arrow-right"></i>' : ''}<div><span>${String(index + 1).padStart(2, '0')}</span><strong>${esc(item)}</strong></div>`).join('')}</div>`;
  if (block.type === 'projects') return `<div class="project-toolbar"><div class="filter-row" id="projectFilters"><button class="filter active" data-project-filter="All">All</button>${['Data','Business','Finance','Technology'].map(category => `<button class="filter" data-project-filter="${category}">${category}</button>`).join('')}</div><label class="search-box"><i data-lucide="search"></i><input id="projectSearch" type="search" placeholder="Search projects" aria-label="Search projects"></label></div><div class="project-grid" id="projectGrid"></div>`;
  if (block.type === 'calculators') return renderCalculators();
  if (block.type === 'insights') return `<div class="insight-grid">${content.insights.map((item, index) => `<article class="insight-card"><span class="insight-index">0${index + 1}</span><small>${esc(item.type)} · ${esc(item.status)}</small><h3>${esc(item.title)}</h3><p>${text(item.excerpt)}</p></article>`).join('')}</div>`;
  if (block.type === 'resume') return `<div class="resume-card"><div><p class="eyebrow">${esc(section.label)}</p><h2>${text(resolve(section.title, site))}</h2><p>${text(resolve(section.subtitle, site))}</p></div><div class="resume-actions">${site.resume ? `<a class="button button-cream" href="${esc(site.resume)}" target="_blank" rel="noopener"><i data-lucide="eye"></i> View Resume</a>` : '<span class="empty-state">Resume link not configured yet.</span>'}</div><div class="resume-strip"><span><b>${content.projects.length}</b> Projects</span><span><b>${content.certifications.length}</b> Certifications</span><span><b>${content.insights.length}</b> Insights</span><span><b>2026</b> Building since</span></div></div>`;
  if (block.type === 'contact') return `<div class="contact-grid"><div><p>Interested in analytics, business, finance, or technology? Let's connect.</p><div class="contact-links"><a href="${esc(link(site.linkedin))}" target="_blank" rel="noopener"><i data-lucide="network"></i><span>LinkedIn<small>Connect professionally</small></span><i data-lucide="arrow-up-right"></i></a><a href="${esc(link(site.github))}" target="_blank" rel="noopener"><i data-lucide="code-2"></i><span>GitHub<small>See the work in progress</small></span><i data-lucide="arrow-up-right"></i></a><a href="${esc(link(site.email, 'email'))}"><i data-lucide="mail"></i><span>${esc(site.email)}</span><i data-lucide="arrow-up-right"></i></a><a href="${esc(link(site.phone, 'phone'))}"><i data-lucide="phone"></i><span>${esc(site.phone)}</span><i data-lucide="arrow-up-right"></i></a></div></div><form class="contact-form" id="contactForm"><label>Name<input name="name" required></label><label>Email<input name="email" type="email" required></label><label>Subject<input name="subject" required></label><label>Message<textarea name="message" rows="5" required></textarea></label><button class="button button-ink" type="submit">Send Message <i data-lucide="send"></i></button><p class="form-note">The form opens your configured email client.</p></form></div>`;
  return '';
}

function renderCalculators() {
  const c = content.calculators;
  const panel = (key, icon) => `<div class="calculator panel"><div class="panel-top"><span>${esc(c[key].title)}</span><i data-lucide="${icon}"></i></div><p class="calculator-description">${esc(c[key].description)}</p><div class="input-grid">${c[key].inputs.map(input => `<label>${esc(input.label)}<input id="${esc(input.id)}" type="number" value="${Number(input.value) || 0}"></label>`).join('')}</div><div class="output-grid">${key === 'revenue' ? '<div><span>Profit</span><strong id="profitOutput"></strong></div><div><span>Margin</span><strong id="marginOutput"></strong></div><div><span>Forecast</span><strong id="forecastOutput"></strong></div>' : key === 'kpi' ? '<div><span>Signal</span><strong id="kpiSignal"></strong></div><div><span>Retention</span><strong id="retentionOutput"></strong></div><div><span>CAC</span><strong id="cacOutput"></strong></div>' : '<div><span>ROA</span><strong id="roaOutput"></strong></div><div><span>ROE</span><strong id="roeOutput"></strong></div><div><span>Debt / Equity</span><strong id="deOutput"></strong></div>'}</div></div>`;
  return `<div class="lab-grid">${panel('revenue', 'trending-up')}${panel('kpi', 'gauge')}${panel('ratios', 'scale')}</div>`;
}
function renderSkills(filter = 'All') {
  const list = document.getElementById('skillList'); if (!list) return;
  const visible = filter === 'All' ? content.skills : content.skills.filter(skill => skill.status === filter);
  list.innerHTML = visible.map(skill => `<article class="skill-row"><div class="skill-name"><span class="skill-dot status-${skill.status.toLowerCase()}"></span><strong>${esc(skill.name)}</strong><small>${esc(skill.category)}</small></div><div class="skill-description">${text(skill.description)}</div><span class="status-pill status-${skill.status.toLowerCase()}">${esc(skill.status)}</span><button class="skill-projects" data-skill-projects="${esc(skill.name)}">${skill.projects.length} related project${skill.projects.length === 1 ? '' : 's'}</button></article>`).join('');
}

function renderProjects(filter = 'All', query = '') {
  const grid = document.getElementById('projectGrid'); if (!grid) return;
  const visible = content.projects.filter(project => (filter === 'All' || project.category === filter) && `${project.title} ${project.category} ${project.description} ${project.tools.join(' ')} ${project.tags.join(' ')}`.toLowerCase().includes(query.toLowerCase()));
  grid.innerHTML = visible.length ? visible.map((project, index) => `<article class="project-card"><div class="project-art art-${index % 3}"><span>${String(index + 1).padStart(2, '0')}</span><div class="art-lines"></div><i data-lucide="arrow-up-right"></i></div><div class="project-content"><div class="project-meta"><span>${esc(project.category)}</span><span>${esc(project.status)}</span></div><h3>${esc(project.title)}</h3><p>${text(project.description)}</p><div class="tag-list">${project.tools.map(tool => `<span>${esc(tool)}</span>`).join('')}</div><div class="project-footer"><span>${new Date(project.date).getFullYear()}</span><button class="project-detail" data-project-id="${esc(project.id)}">Read case study <i data-lucide="arrow-up-right"></i></button></div></div></article>`).join('') : '<p class="empty-state">No projects match that search yet.</p>';
  grid.querySelectorAll('[data-project-id]').forEach(button => button.addEventListener('click', () => openProject(button.dataset.projectId))); if (window.lucide) lucide.createIcons();
}

function openProject(id) {
  const project = content.projects.find(item => item.id === id); if (!project) return;
  const dialog = document.getElementById('projectDialog');
  dialog.innerHTML = `<div class="dialog-backdrop" data-close-dialog></div><article class="dialog-panel"><button class="dialog-close" data-close-dialog aria-label="Close project details">×</button><p class="eyebrow">${esc(project.category)} · ${esc(project.status)}</p><h2>${esc(project.title)}</h2><p>${text(project.description)}</p><div class="dialog-grid"><div><span>Business problem</span><strong>${text(project.problem)}</strong></div><div><span>Objective</span><strong>${text(project.objective)}</strong></div><div><span>Dataset</span><strong>${text(project.dataset)}</strong></div><div><span>Methodology</span><strong>${text(project.methodology)}</strong></div></div><div class="dialog-section"><span>Key findings</span><p>${text(project.insights)}</p></div><div class="dialog-section"><span>Skills</span><div class="tag-list">${project.skills.map(skill => `<span>${esc(skill)}</span>`).join('')}</div></div></article>`;
  dialog.classList.add('open'); dialog.setAttribute('aria-hidden', 'false'); dialog.querySelectorAll('[data-close-dialog]').forEach(element => element.addEventListener('click', closeDialog));
}
function closeDialog() { const dialog = document.getElementById('projectDialog'); dialog.classList.remove('open'); dialog.setAttribute('aria-hidden', 'true'); }
function money(value) { return `$${Math.round(value).toLocaleString('en-US')}`; }
function updateCalculators() {
  const value = id => Number(document.getElementById(id)?.value) || 0; const revenue = value('revenue'); const expenses = value('expenses'); const growth = value('growth'); const profit = revenue - expenses;
  if (document.getElementById('profitOutput')) { document.getElementById('profitOutput').textContent = money(profit); document.getElementById('marginOutput').textContent = `${revenue ? ((profit / revenue) * 100).toFixed(1) : '0.0'}%`; document.getElementById('forecastOutput').textContent = money(revenue * (1 + growth / 100)); }
  if (document.getElementById('kpiSignal')) { const retention = value('retention'); document.getElementById('kpiSignal').textContent = value('conversion') >= 3 && retention >= 60 ? 'Healthy' : 'Review'; document.getElementById('retentionOutput').textContent = `${retention.toFixed(1)}%`; document.getElementById('cacOutput').textContent = money(value('cac')); }
  if (document.getElementById('roaOutput')) { document.getElementById('roaOutput').textContent = `${value('assets') ? ((value('netIncome') / value('assets')) * 100).toFixed(1) : '0.0'}%`; document.getElementById('roeOutput').textContent = `${value('equity') ? ((value('netIncome') / value('equity')) * 100).toFixed(1) : '0.0'}%`; document.getElementById('deOutput').textContent = `${value('equity') ? (value('debt') / value('equity')).toFixed(2) : '0.00'}x`; }
}
function bindInteractions() {
  renderSkills(); renderProjects(); updateCalculators();
  document.querySelectorAll('[data-project-filter]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-project-filter]').forEach(item => item.classList.remove('active')); button.classList.add('active'); renderProjects(button.dataset.projectFilter, document.getElementById('projectSearch')?.value || ''); }));
  document.getElementById('projectSearch')?.addEventListener('input', event => renderProjects(document.querySelector('[data-project-filter].active')?.dataset.projectFilter || 'All', event.target.value));
  document.querySelectorAll('.calculator input').forEach(input => input.addEventListener('input', updateCalculators));
  document.querySelectorAll('[data-skill-projects]').forEach(button => button.addEventListener('click', () => { const search = document.getElementById('projectSearch'); if (search) { search.value = button.dataset.skillProjects; renderProjects('All', search.value); document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' }); } }));
  document.getElementById('contactForm')?.addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.currentTarget); window.location.href = `mailto:${content.site.email}?subject=${encodeURIComponent(data.get('subject'))}&body=${encodeURIComponent(data.get('message'))}`; });
  const menuToggle = document.getElementById('menuToggle'); const navLinks = document.getElementById('navLinks'); menuToggle?.addEventListener('click', () => { const open = navLinks.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', open); }); navLinks?.querySelectorAll('a').forEach(item => item.addEventListener('click', () => navLinks.classList.remove('open')));
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.1 }); document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}

window.addEventListener('content-ready', event => render(event.detail));
fetch('content/content.json').then(response => response.json()).then(data => render(data)).catch(() => render());
