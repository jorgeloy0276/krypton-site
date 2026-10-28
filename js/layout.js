// Edita aquí el nombre y el menú: se aplican a TODAS las páginas.
const BRAND = "Krypton Logic";
const NAV = [["Inicio", "index.html"], ["Sobre Nosotros", "sobre-nosotros.html"], ["Nuestros Proyectos", "proyectos.html"], ["Documentation", "documentacion.html"], ["Preguntas Frecuentes", "preguntas-frecuentes.html"], ["Contacto", "contacto.html"]];
(() => {
    const here = location.pathname.split('/').pop() || 'index.html';
    // Logo del header: img/logo-kl-icon-teal.svg (el logo completo está en img/logo-kl-teal.svg).
    const logo = '<img src="img/logo-kl-icon-teal.svg" alt="" width="38" height="38">';
    const links = NAV.map(([t, h]) => `<a href="${h}"${h === here ? ' class="on" aria-current="page"' : ''}>${t}</a>`).join('');
    document.getElementById('hdr').innerHTML = `<div class="wrap bar"><a class="brand" href="index.html">${logo}<span>${BRAND}</span></a><button class="burger" aria-label="Abrir menú" aria-expanded="false"><i class="fa-solid fa-bars"></i></button><nav>${links}</nav></div>`;
    document.getElementById('ftr').innerHTML = `<div class="wrap foot"><span>© ${new Date().getFullYear()} ${BRAND}. Todos los derechos reservados.</span><nav>${links}</nav></div>`;
    const bg = document.querySelector('.burger'), nv = document.querySelector('header nav');
    bg.onclick = () => bg.setAttribute('aria-expanded', nv.classList.toggle('open'));
    document.addEventListener('pointermove', e => { const c = e.target.closest('.card'); if (c) { const r = c.getBoundingClientRect(); c.style.setProperty('--mx', e.clientX - r.left + 'px'); c.style.setProperty('--my', e.clientY - r.top + 'px') } });
    const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target) } }), { threshold: .1 });
    document.querySelectorAll('.card,.faq details').forEach((el, i) => { el.classList.add('rv'); el.style.animationDelay = (i % 4) * 70 + 'ms'; io.observe(el) });
})();
