/* ===== Helpers ===== */
const $ = (sel, root = document) => root.querySelector(sel);

/* ===== Tema: evita flash e permite alternar ===== */
(function initTheme() {
  try {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const saved = localStorage.getItem('theme');
    const dark = saved ? saved === 'dark' : prefersDark;
    document.documentElement.classList.toggle('dark', dark);
  } catch (_) {}
})();

/* ===== Lógica principal ===== */
document.addEventListener('DOMContentLoaded', () => {
  // HEADER: elevação + menu mobile
  (function headerInit() {
    const header = $('#site-header');
    const onScroll = () => header && header.classList.toggle('elev', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    const drawer = $('#drawer');
    const btnOpen = $('#btn-open');
    const btnClose = $('#btn-close');
    if (drawer && btnOpen && btnClose) {
      const open = () => { drawer.classList.add('open'); drawer.setAttribute('aria-hidden', 'false'); };
      const close = () => { drawer.classList.remove('open'); drawer.setAttribute('aria-hidden', 'true'); };
      btnOpen.addEventListener('click', open);
      btnClose.addEventListener('click', close);
      drawer.addEventListener('click', (e) => { if (e.target.id === 'drawer') close(); });
      document.querySelectorAll('#drawer .drawer__link').forEach(a => a.addEventListener('click', close));
    }
  })();

  // PREÇO & CHECKOUT
  (function pricing() {
    const PRICE_LABEL = "R$39,90";
    const CHECKOUT_URL = "https://pay.hotmart.com/J101435163B";
    document.querySelectorAll('[data-js="price-number"], [data-js="price-inline"], [data-js="price-cta"]').forEach(el => {
      if (el.dataset.js === 'price-cta') el.textContent = `Comprar agora — ${PRICE_LABEL}`;
      else el.textContent = PRICE_LABEL;
    });
    document.querySelectorAll('[data-js="checkout-cta"]').forEach(el => el.setAttribute('href', CHECKOUT_URL));
  })();

  // CONTAGEM 24h & VENDAS
  (function rolling24h(){
    const key = 'tm24';
    const now = Date.now();
    let start = Number(localStorage.getItem(`${key}_start`));
    const valid = start && (now - start) < 24 * 3600 * 1000;
    if (!valid){ start = Date.now(); localStorage.setItem(`${key}_start`, String(start)); }

    const end = start + 24 * 3600 * 1000;
    const hhEl = $('#hh'), mmEl = $('#mm'), ssEl = $('#ss');
    const salesEl = $('#sales'), targetEl = $('#target');
    const barTime = $('#bar-time'), barSales = $('#bar-sales');

    const totalTarget = 175;
    if(targetEl) targetEl.textContent = totalTarget;

    function tick(){
      const now = Date.now();
      const remaining = Math.max(0, end - now);
      const elapsed = Math.max(0, Math.min(1, (now - start) / (24 * 3600 * 1000)));

      const h = String(Math.floor(remaining / 3600000)).padStart(2,'0');
      const m = String(Math.floor((remaining % 3600000) / 60000)).padStart(2,'0');
      const s = String(Math.floor((remaining % 60000) / 1000)).padStart(2,'0');

      if (hhEl) hhEl.textContent = h;
      if (mmEl) mmEl.textContent = m;
      if (ssEl) ssEl.textContent = s;

      const baseSales = 35;
      const dynamicSales = Math.floor((totalTarget - baseSales) * elapsed);
      const currentSales = baseSales + dynamicSales;

      if (salesEl) salesEl.textContent = currentSales;
      if (barSales) barSales.style.width = `${(currentSales / totalTarget) * 100}%`;
      if (barTime) barTime.style.width = `${(1 - elapsed) * 100}%`;
    }
    tick();
    setInterval(tick, 1000);
  })();

  // CTA FLUTUANTE
  (function stickyCTA() {
    const sticky = $('#sticky');
    const hero = $('#inicio');
    const oferta = $('#oferta');
    if (!sticky || !hero) return;
    function onScroll() {
      const heroH = hero.offsetHeight;
      const threshold = heroH * 0.6;
      const ofertaTop = oferta ? (oferta.getBoundingClientRect().top + window.scrollY) : Infinity;
      const winBottom = window.scrollY + window.innerHeight;
      const nearOffer = (winBottom + 120) > ofertaTop;
      const show = window.scrollY > threshold && !nearOffer;
      sticky.classList.toggle('show', show);
      sticky.setAttribute('aria-hidden', String(!show));
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  })();

  // ANO FOOTER
  (function year() { const el = $('#year'); if (el) el.textContent = new Date().getFullYear(); })();

  // TEMA: botão toggle
  (function themeToggle() {
    const toggleButton = $('#theme-toggle');
    if(!toggleButton) return;
    toggleButton.addEventListener('click', () => {
      const isDark = document.documentElement.classList.toggle('dark');
      localStorage.theme = isDark ? 'dark' : 'light';
    });
  })();

  // REVEAL ON SCROLL
  const scrollRevealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('active'); });
  }, { threshold: 0.1 });

  function initScrollReveal(selector = '.reveal') {
    document.querySelectorAll(selector).forEach(el => scrollRevealObserver.observe(el));
  }

  // BLOG (sem onerror inline; tratamos via JS)
  const articles = [
    { url:'https://medium.com/', imageUrl:'https://images.unsplash.com/photo-1587223383391-2a161f54b8d0?q=80&w=870&auto=format&fit=crop', title:'As Influências do Soul na Fase Racional', subtitle:'Uma análise musical que vai além do óbvio, explorando os arranjos de metais e as linhas de baixo que definiram o som de Tim Maia nos anos 70.' },
    { url:'https://medium.com/', imageUrl:'https://images.unsplash.com/photo-1518600576225-c1d028a4e627?q=80&w=870&auto=format&fit=crop', title:'"Universo em Desencanto": Um Guia para Iniciantes', subtitle:'Desmistificamos os principais conceitos da Cultura Racional de forma simples, para que você possa entender as letras de Tim Maia sem precisar ler os mil volumes.' },
    { url:'https://medium.com/', imageUrl:'https://images.unsplash.com/photo-1504321925958-b0a4f5b51a23?q=80&w=774&auto=format&fit=crop', title:'O Legado Pós-Racional: Como a Fase Mística Influenciou o Resto da Carreira', subtitle:'Analisamos como a experiência com a Cultura Racional, mesmo após o rompimento, ecoou nas composições e no comportamento de Tim Maia até o fim de sua vida.' },
    { url:'https://medium.com/', imageUrl:'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=870&auto=format&fit=crop', title:'A Relação de Tim Maia com Outros Artistas', subtitle:'Explore as parcerias, amizades e rivalidades que marcaram a carreira do Síndico durante e após sua fase mais mística e controversa.' }
  ];

  (function renderBlogArticles() {
    const container = $('#blog-articles-container');
    if (!container) return;
    container.innerHTML = '';
    articles.forEach(article => {
      const a = document.createElement('a');
      a.href = article.url;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.className = 'group block';

      const card = document.createElement('div');
      card.className = 'reveal rounded-2xl border dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col';

      const img = document.createElement('img');
      img.src = article.imageUrl;
      img.alt = `Imagem de capa para o artigo: ${article.title}`;
      img.loading = 'lazy';
      img.className = 'w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105';
      img.addEventListener('error', () => {
        const encoded = encodeURIComponent(article.title);
        img.src = `https://placehold.co/870x480/059669/FFFFFF?text=${encoded}`;
      });

      const content = document.createElement('div');
      content.className = 'p-6 flex flex-col flex-grow';

      const h3 = document.createElement('h3');
      h3.className = 'font-extrabold text-xl dark:text-white';
      h3.textContent = article.title;

      const p = document.createElement('p');
      p.className = 'mt-2 text-black/70 dark:text-slate-400 text-sm flex-grow';
      p.textContent = article.subtitle;

      const cta = document.createElement('div');
      cta.className = 'mt-4 font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-2 self-start';
      cta.innerHTML = 'Leia no Medium <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>';

      content.append(h3, p, cta);
      card.append(img, content);
      a.append(card);
      container.append(a);
    });
    initScrollReveal('#blog-articles-container .reveal');
  })();

  // MODAL POLÍTICAS
  (function policyModal() {
    const modal = $('#policy-modal');
    if (!modal) return;

    const modalContainer = modal.querySelector('div');
    const closeBtn = $('#modal-close-btn');
    const modalTitle = $('#modal-title');
    const modalContent = $('#modal-content');
    const links = document.querySelectorAll('[data-policy]');

    const policies = {
      terms: { title: 'Termos de Uso', content: `...` },
      privacy:{ title: 'Política de Privacidade', content: `...` }
    };

    const openModal = (type) => {
      const policy = policies[type];
      if (!policy) return;
      modalTitle.textContent = policy.title;
      modalContent.innerHTML = policy.content;
      modal.classList.remove('hidden'); modal.classList.add('flex');
      document.body.classList.add('modal-open');
      setTimeout(() => { modal.classList.remove('opacity-0'); modalContainer.classList.remove('scale-95'); }, 10);
    };

    const closeModal = () => {
      modal.classList.add('opacity-0'); modalContainer.classList.add('scale-95');
      setTimeout(() => {
        modal.classList.add('hidden'); modal.classList.remove('flex');
        document.body.classList.remove('modal-open');
      }, 300);
    };

    links.forEach(link => link.addEventListener('click', (e) => { e.preventDefault(); openModal(e.target.dataset.policy); }));
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === "Escape" && !modal.classList.contains('hidden')) closeModal(); });
  })();

  // Inicializa o reveal nos elementos já presentes
  (function init(){ const els = document.querySelectorAll('.reveal'); els.forEach(el => scrollRevealObserver.observe(el)); })();
});
