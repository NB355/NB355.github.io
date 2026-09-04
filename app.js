const profile = window.profile;
const skills = window.skills;
const projects = window.projects;
const certifications = window.certifications || [];
const insights = window.insights || [];

const isPlaceholder = value => !value;
const safeLink = value => isPlaceholder(value) ? '#' : value;

document.querySelectorAll('[data-profile]').forEach(element => {
  const key = element.dataset.profile;
  element.textContent = profile[key] || '';
});
document.querySelectorAll('[data-profile-image]').forEach(image => image.src = profile.profileImage);
document.querySelectorAll('[data-social]').forEach(link => {
  const key = link.dataset.social;
  const value = profile.socialLinks?.[key] || profile[key];
  link.href = key === 'email' && !isPlaceholder(value) ? `mailto:${value}` : key === 'phone' && !isPlaceholder(value) ? `tel:${value}` : safeLink(value);
  if (!isPlaceholder(value) && key !== 'email' && key !== 'phone') { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
  if (isPlaceholder(value)) link.addEventListener('click', event => { event.preventDefault(); alert(`Add your ${key} link in data/profile.js.`); });
});
document.querySelectorAll('[data-social="resume"]').forEach(link => { if (isPlaceholder(profile.resume)) link.hidden = true; });

const completedProjects = projects.filter(project => project.status === 'Completed');
document.getElementById('skillCount').textContent = skills.length;
document.getElementById('projectCount').textContent = projects.length;
document.getElementById('certCount').textContent = certifications.filter(cert => cert.status === 'Completed').length;
document.getElementById('insightCount').textContent = insights.length;

const skillList = document.getElementById('skillList');
function renderSkills(filter = 'All') {
  const visible = filter === 'All' ? skills : skills.filter(skill => skill.status === filter);
  skillList.innerHTML = visible.map(skill => `<article class="skill-row"><div class="skill-name"><span class="skill-dot status-${skill.status.toLowerCase()}"></span><strong>${skill.name}</strong><small>${skill.category}</small></div><div class="skill-description">${skill.description}</div><span class="status-pill status-${skill.status.toLowerCase()}">${skill.status}</span><button class="skill-projects" data-skill-projects="${skill.id}">${skill.projects.length} related project${skill.projects.length === 1 ? '' : 's'}</button></article>`).join('');
  skillList.querySelectorAll('[data-skill-projects]').forEach(button => button.addEventListener('click', () => { const skill = skills.find(item => item.id === button.dataset.skillProjects); document.getElementById('projectSearch').value = skill.name; document.getElementById('projectGrid').scrollIntoView({ behavior: 'smooth', block: 'start' }); renderProjects(); }));
}
renderSkills();
document.querySelectorAll('[data-skill-filter]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-skill-filter]').forEach(item => item.classList.remove('active')); button.classList.add('active'); renderSkills(button.dataset.skillFilter); }));

const projectGrid = document.getElementById('projectGrid');
let projectFilter = 'All';
function renderProjects() {
  const query = document.getElementById('projectSearch').value.toLowerCase();
  const visible = projects.filter(project => (projectFilter === 'All' || project.category === projectFilter) && `${project.title} ${project.category} ${project.description} ${project.tools.join(' ')} ${project.skills.join(' ')} ${project.tags.join(' ')}`.toLowerCase().includes(query));
  projectGrid.innerHTML = visible.length ? visible.map((project, index) => `<article class="project-card reveal"><div class="project-art art-${index % 3}"><span>${String(index + 1).padStart(2, '0')}</span><div class="art-lines"></div><i data-lucide="arrow-up-right"></i></div><div class="project-content"><div class="project-meta"><span>${project.category}</span><span>${project.status}</span></div><h3>${project.title}</h3><p>${project.description}</p><div class="tag-list">${project.tools.map(tool => `<span>${tool}</span>`).join('')}</div><div class="project-footer"><span>${new Date(project.date).getFullYear()}</span><button class="project-detail" data-project-id="${project.id}">Read case study <i data-lucide="arrow-up-right"></i></button></div></div></article>`).join('') : '<p class="empty-state">No projects match that search yet.</p>';
  projectGrid.querySelectorAll('[data-project-id]').forEach(button => button.addEventListener('click', () => openProject(button.dataset.projectId)));
  if (window.lucide) lucide.createIcons();
}
renderProjects();
document.querySelectorAll('[data-project-filter]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-project-filter]').forEach(item => item.classList.remove('active')); button.classList.add('active'); projectFilter = button.dataset.projectFilter; renderProjects(); }));
document.getElementById('projectSearch').addEventListener('input', renderProjects);

function openProject(id) {
  const project = projects.find(item => item.id === id);
  if (!project) return;
  document.getElementById('dialogCategory').textContent = `${project.category} · ${project.status}`;
  document.getElementById('dialogTitle').textContent = project.title;
  document.getElementById('dialogDescription').textContent = project.description;
  ['Problem', 'Objective', 'Dataset', 'Methodology', 'Insights'].forEach(key => { document.getElementById(`dialog${key}`).textContent = project[key.toLowerCase()] || 'Details to be added as the project develops.'; });
  document.getElementById('dialogSkills').innerHTML = project.skills.map(skill => `<span>${skill}</span>`).join('');
  [['dialogGithub', project.githubUrl], ['dialogReport', project.reportUrl]].forEach(([id, url]) => { const link = document.getElementById(id); link.href = safeLink(url); link.hidden = isPlaceholder(url); if (!isPlaceholder(url)) { link.target = '_blank'; link.rel = 'noopener noreferrer'; } });
  const dialog = document.getElementById('projectDialog'); dialog.classList.add('open'); dialog.setAttribute('aria-hidden', 'false'); document.body.classList.add('dialog-open');
}
document.querySelectorAll('[data-close-dialog]').forEach(element => element.addEventListener('click', () => { document.getElementById('projectDialog').classList.remove('open'); document.getElementById('projectDialog').setAttribute('aria-hidden', 'true'); document.body.classList.remove('dialog-open'); }));

document.getElementById('insightGrid').innerHTML = insights.map((insight, index) => `<article class="insight-card reveal"><span class="insight-index">0${index + 1}</span><small>${insight.type} · ${insight.status}</small><h3>${insight.title}</h3><p>${insight.excerpt}</p><a href="#contact">Read note <i data-lucide="arrow-up-right"></i></a></article>`).join('');

function money(value) { return `$${Math.round(value).toLocaleString('en-US')}`; }
function updateRevenue() { const revenue = Number(document.getElementById('revenue').value) || 0; const expenses = Number(document.getElementById('expenses').value) || 0; const growth = Number(document.getElementById('growth').value) || 0; const profit = revenue - expenses; document.getElementById('profitOutput').textContent = money(profit); document.getElementById('marginOutput').textContent = `${revenue ? ((profit / revenue) * 100).toFixed(1) : '0.0'}%`; document.getElementById('forecastOutput').textContent = money(revenue * (1 + growth / 100)); }
function updateRatios() { const income = Number(document.getElementById('netIncome').value) || 0; const assets = Number(document.getElementById('assets').value) || 0; const equity = Number(document.getElementById('equity').value) || 0; const debt = Number(document.getElementById('debt').value) || 0; document.getElementById('roaOutput').textContent = `${assets ? ((income / assets) * 100).toFixed(1) : '0.0'}%`; document.getElementById('roeOutput').textContent = `${equity ? ((income / equity) * 100).toFixed(1) : '0.0'}%`; document.getElementById('deOutput').textContent = `${equity ? (debt / equity).toFixed(2) : '0.00'}x`; }
function updateKpis() { const conversion = Number(document.getElementById('conversion').value) || 0; const retention = Number(document.getElementById('retention').value) || 0; const cac = Number(document.getElementById('cac').value) || 0; document.getElementById('kpiSignal').textContent = conversion >= 3 && retention >= 60 ? 'Healthy' : 'Review'; document.getElementById('retentionOutput').textContent = `${retention.toFixed(1)}%`; document.getElementById('cacOutput').textContent = money(cac); }
document.querySelectorAll('.calculator input').forEach(input => input.addEventListener('input', input.id.includes('Income') || input.id === 'assets' || input.id === 'equity' || input.id === 'debt' ? updateRatios : ['conversion', 'retention', 'cac'].includes(input.id) ? updateKpis : updateRevenue));
updateKpis();

document.getElementById('contactForm').addEventListener('submit', event => { event.preventDefault(); const data = new FormData(event.currentTarget); const target = profile.email; if (isPlaceholder(target)) { document.getElementById('formNote').textContent = 'Add your email in data/profile.js to enable sending.'; return; } window.location.href = `mailto:${target}?subject=${encodeURIComponent(data.get('subject') || `Portfolio contact from ${data.get('name')}`)}&body=${encodeURIComponent(data.get('message'))}`; });
const menuToggle = document.getElementById('menuToggle'); const navLinks = document.getElementById('navLinks'); menuToggle.addEventListener('click', () => { const open = navLinks.classList.toggle('open'); menuToggle.setAttribute('aria-expanded', open); menuToggle.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`; if (window.lucide) lucide.createIcons(); }); navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('open')));
const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.12 }); document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
if (window.lucide) lucide.createIcons();
