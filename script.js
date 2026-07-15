document.addEventListener('DOMContentLoaded', () => {

    const PAGE = location.pathname.split('/').pop() || 'index.html';

    const catLottieEl = document.getElementById('cat-lottie');
    const catLottieDataEl = document.getElementById('cat-lottie-data');
    if (catLottieEl && catLottieDataEl && window.lottie) {
        const catAnim = window.lottie.loadAnimation({
            container: catLottieEl,
            renderer: 'svg',
            loop: false,
            autoplay: true,
            animationData: JSON.parse(catLottieDataEl.textContent)
        });
        catAnim.addEventListener('complete', () => {
            catAnim.loop = true;
            catAnim.playSegments([24, 77], true);
        });
    }

    const frag = document.createElement('div');
    frag.innerHTML = `
        <div class="grid-bg" aria-hidden="true"></div>
        <div class="grid-spot" aria-hidden="true"></div>
        <div class="scroll-progress" aria-hidden="true"></div>
        <button class="to-top" aria-label="Back to top"><i class="fas fa-arrow-up"></i></button>
        <div class="toast" id="toast"><i class="fas fa-check"></i><span id="toast-msg"></span></div>
        <div class="cmdk-overlay" id="cmdk">
            <div class="cmdk-panel">
                <div class="cmdk-input-row">
                    <i class="fas fa-magnifying-glass"></i>
                    <input type="text" id="cmdk-input" placeholder="Type a command or search…" autocomplete="off">
                    <kbd>esc</kbd>
                </div>
                <ul class="cmdk-list" id="cmdk-list"></ul>
            </div>
        </div>
    `;
    document.body.prepend(frag);

    const gridSpot = document.querySelector('.grid-spot');
    const gridBg = document.querySelector('.grid-bg');
    const progress = document.querySelector('.scroll-progress');
    const toTop = document.querySelector('.to-top');
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');

    const nav = document.querySelector('nav');
    if (nav) {
        const links = [...nav.querySelectorAll('a')];
        const linkHTML = links.map(a =>
            `<a href="${a.getAttribute('href')}" class="${a.classList.contains('active') ? 'active' : ''}">${a.textContent.trim()}</a>`
        ).join('');

        nav.innerHTML = `
            <div class="nav-inner">
                <a href="index.html" class="nav-brand"><span class="mark">&lt;TT/&gt;</span> Tisha Thakkar</a>
                <div class="nav-links">${linkHTML}</div>
                <div class="nav-actions">
                    <button class="cmdk-trigger" id="cmdk-trigger"><i class="fas fa-terminal"></i><span class="label">Search</span><kbd>&#8984;K</kbd></button>
                    <button class="hamburger" aria-label="Menu"><span></span><span></span><span></span></button>
                </div>
            </div>`;

        const navWrap = document.createElement('div');
        navWrap.className = 'nav-wrap';
        nav.parentNode.insertBefore(navWrap, nav);
        navWrap.appendChild(nav);

        const burger = nav.querySelector('.hamburger');
        const menu = nav.querySelector('.nav-links');
        burger.addEventListener('click', () => {
            burger.classList.toggle('open');
            menu.classList.toggle('open');
        });
        menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
            burger.classList.remove('open');
            menu.classList.remove('open');
        }));

        const navAnchors = [...nav.querySelectorAll('.nav-links a')].filter(a => a.getAttribute('href').startsWith('#'));
        const sections = navAnchors
            .map(a => document.getElementById(a.getAttribute('href').slice(1)))
            .filter(Boolean);
        document.body.dataset.activeSection = 'home';
        if (sections.length) {
            const spy = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    const id = entry.target.id;
                    navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
                    document.body.dataset.activeSection = id;
                });
            }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
            sections.forEach(s => spy.observe(s));
        }
    }

    if (!document.querySelector('.footer')) {
        const footer = document.createElement('footer');
        footer.className = 'footer';
        footer.innerHTML = `designed &amp; built by <span class="grad">Tisha Thakkar</span> · ${new Date().getFullYear()} · vanilla JS, no framework`;
        document.body.appendChild(footer);
    }

    if (window.matchMedia('(pointer: fine)').matches) {
        window.addEventListener('mousemove', e => {
            const mx = (e.clientX / window.innerWidth) * 100;
            const my = (e.clientY / window.innerHeight) * 100;
            document.documentElement.style.setProperty('--mx', mx + '%');
            document.documentElement.style.setProperty('--my', my + '%');
            gridSpot.classList.add('show');
        }, { passive: true });
        document.addEventListener('mouseleave', () => gridSpot.classList.remove('show'));
    }

    const navWrapEl = document.querySelector('.nav-wrap');
    const onScroll = () => {
        const st = window.scrollY;
        const h = document.documentElement.scrollHeight - window.innerHeight;
        const pct = h > 0 ? st / h : 0;
        progress.style.width = (pct * 100) + '%';
        navWrapEl && navWrapEl.classList.toggle('scrolled', st > 10);
        toTop.classList.toggle('show', st > 500);
        if (gridBg) gridBg.style.backgroundPosition = `0px ${st * 0.06}px`;
    };
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            requestAnimationFrame(() => { onScroll(); scrollTicking = false; });
            scrollTicking = true;
        }
    }, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();
    toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    let toastTimer;
    function showToast(msg) {
        toastMsg.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 2200);
    }
    window.__showToast = showToast;

    document.querySelectorAll('[data-copy]').forEach(btn => {
        btn.addEventListener('click', () => {
            const text = btn.getAttribute('data-copy');
            navigator.clipboard?.writeText(text).then(() => showToast(`Copied "${text}" to clipboard`));
        });
    });

    const cmdk = document.getElementById('cmdk');
    const cmdkInput = document.getElementById('cmdk-input');
    const cmdkList = document.getElementById('cmdk-list');
    const scrollToId = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    const commands = [
        { label: 'Go to Home', icon: 'fa-house', run: () => scrollToId('home') },
        { label: 'Go to Experience', icon: 'fa-briefcase', run: () => scrollToId('experience') },
        { label: 'Go to Projects', icon: 'fa-diagram-project', run: () => scrollToId('projects') },
        { label: 'Go to Activities', icon: 'fa-award', run: () => scrollToId('activities') },
        { label: 'Go to Contact', icon: 'fa-envelope', run: () => scrollToId('contact') },
        { label: 'Open GitHub profile', icon: 'fa-brands fa-github', run: () => window.open('https://github.com/Tisha1503', '_blank') },
        { label: 'Open LinkedIn profile', icon: 'fa-brands fa-linkedin', run: () => window.open('https://linkedin.com/in/tishathakkar15', '_blank') },
        { label: 'Copy email address', icon: 'fa-copy', run: () => { navigator.clipboard?.writeText('tishathakkar15@gmail.com'); showToast('Copied email to clipboard'); } },
        { label: 'Back to top', icon: 'fa-arrow-up', run: () => window.scrollTo({ top: 0, behavior: 'smooth' }) },
    ];
    let activeIdx = 0;

    function renderCmdk(filter = '') {
        const f = filter.toLowerCase();
        const filtered = commands.filter(c => c.label.toLowerCase().includes(f));
        activeIdx = 0;
        cmdkList.innerHTML = filtered.length
            ? filtered.map((c, i) => `<li class="cmdk-item${i === 0 ? ' active' : ''}" data-idx="${i}"><i class="fas ${c.icon.replace('fa-brands ', '')}"></i>${c.label}</li>`).join('')
            : `<div class="cmdk-empty">No matching commands</div>`;
        cmdkList.__filtered = filtered;
    }

    function openCmdk() {
        cmdk.classList.add('open');
        cmdkInput.value = '';
        renderCmdk();
        setTimeout(() => cmdkInput.focus(), 50);
    }
    function closeCmdk() { cmdk.classList.remove('open'); }

    document.getElementById('cmdk-trigger')?.addEventListener('click', openCmdk);
    cmdk.addEventListener('click', e => { if (e.target === cmdk) closeCmdk(); });
    cmdkInput.addEventListener('input', () => renderCmdk(cmdkInput.value));
    cmdkList.addEventListener('click', e => {
        const item = e.target.closest('.cmdk-item');
        if (!item) return;
        const cmd = cmdkList.__filtered[+item.dataset.idx];
        closeCmdk();
        cmd && cmd.run();
    });

    document.addEventListener('keydown', e => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            cmdk.classList.contains('open') ? closeCmdk() : openCmdk();
            return;
        }
        if (!cmdk.classList.contains('open')) return;
        const items = cmdkList.__filtered || [];
        if (e.key === 'Escape') closeCmdk();
        if (e.key === 'ArrowDown') { e.preventDefault(); activeIdx = Math.min(activeIdx + 1, items.length - 1); updateActive(); }
        if (e.key === 'ArrowUp') { e.preventDefault(); activeIdx = Math.max(activeIdx - 1, 0); updateActive(); }
        if (e.key === 'Enter') { const c = items[activeIdx]; if (c) { closeCmdk(); c.run(); } }
    });
    function updateActive() {
        [...cmdkList.children].forEach((el, i) => el.classList.toggle('active', i === activeIdx));
        cmdkList.children[activeIdx]?.scrollIntoView({ block: 'nearest' });
    }

    if (window.matchMedia('(pointer: fine)').matches) {
        document.querySelectorAll('.magnetic').forEach(el => {
            el.addEventListener('mousemove', e => {
                const r = el.getBoundingClientRect();
                const x = (e.clientX - r.left - r.width / 2) * 0.25;
                const y = (e.clientY - r.top - r.height / 2) * 0.35;
                el.style.transform = `translate(${x}px, ${y}px)`;
            });
            el.addEventListener('mouseleave', () => { el.style.transform = ''; });
        });
    }

    const revealables = document.querySelectorAll('.card, .stat, .contact-item, .stack-card, .section-head, .section-intro, .top-github-link, .fact, .commit, .activity-row, .flashcard');
    revealables.forEach(el => el.classList.add('reveal'));

    const cascadeIndex = (el) => {
        const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        return siblings.indexOf(el);
    };
    const io = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = Math.min(cascadeIndex(entry.target), 8) * 130;
                setTimeout(() => entry.target.classList.add('in'), delay);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealables.forEach(el => io.observe(el));

    const rotate = document.querySelector('.hero-role .rotate');
    if (rotate) {
        const words = JSON.parse(rotate.dataset.words || '[]');
        let wi = 0, ci = 0, deleting = false;
        const type = () => {
            const word = words[wi];
            rotate.textContent = word.substring(0, ci);
            if (!deleting && ci < word.length) { ci++; setTimeout(type, 85); }
            else if (!deleting && ci === word.length) { deleting = true; setTimeout(type, 1500); }
            else if (deleting && ci > 0) { ci--; setTimeout(type, 40); }
            else { deleting = false; wi = (wi + 1) % words.length; setTimeout(type, 300); }
        };
        if (words.length) type();
    }

    const stats = document.querySelectorAll('.stat .num[data-count]');
    if (stats.length) {
        const sio = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const target = parseFloat(el.dataset.count);
                const suffix = el.dataset.suffix || '';
                const decimals = (el.dataset.count.split('.')[1] || '').length;
                let start = null;
                const dur = 1300;
                const step = ts => {
                    if (!start) start = ts;
                    const p = Math.min((ts - start) / dur, 1);
                    const eased = 1 - Math.pow(1 - p, 3);
                    el.textContent = (target * eased).toFixed(decimals) + suffix;
                    if (p < 1) requestAnimationFrame(step);
                    else el.textContent = target.toFixed(decimals) + suffix;
                };
                requestAnimationFrame(step);
                obs.unobserve(el);
            });
        }, { threshold: 0.5 });
        stats.forEach(s => sio.observe(s));
    }

    const termCode = document.getElementById('terminal-code');
    if (termCode) {
        const lines = [
            [{ t: 'tisha', c: 'tok-var' }, { t: ' = {', c: 'tok-punct' }],
            [{ t: '    "role"', c: 'tok-key' }, { t: ': ', c: 'tok-punct' }, { t: '"CS Student @ Georgia Tech"', c: 'tok-str' }, { t: ',', c: 'tok-punct' }],
            [{ t: '    "focus"', c: 'tok-key' }, { t: ': ', c: 'tok-punct' }, { t: '["AI/ML", "Data Science", "Backend"]', c: 'tok-str' }, { t: ',', c: 'tok-punct' }],
            [{ t: '    "status"', c: 'tok-key' }, { t: ': ', c: 'tok-punct' }, { t: '"open to full time positions"', c: 'tok-str' }, { t: ',', c: 'tok-punct' }],
            [{ t: '    "stack"', c: 'tok-key' }, { t: ': ', c: 'tok-punct' }, { t: '["Python", "PyTorch", "FastAPI", "SQL"]', c: 'tok-str' }],
            [{ t: '}', c: 'tok-punct' }],
            [],
            [{ t: '# fueled by coffee, occasional tennis player', c: 'tok-comment' }],
        ];

        const startTyping = () => {
            let li = 0, ti = 0;
            termCode.innerHTML = '';
            const caret = document.createElement('span');
            caret.className = 'caret';
            termCode.after(caret);

            const typeNext = () => {
                if (li >= lines.length) return;
                const line = lines[li];
                if (ti >= line.length) {
                    termCode.appendChild(document.createTextNode('\n'));
                    li++; ti = 0;
                    setTimeout(typeNext, 130);
                    return;
                }
                const tok = line[ti];
                const span = document.createElement('span');
                span.className = tok.c;
                span.textContent = tok.t;
                termCode.appendChild(span);
                ti++;
                setTimeout(typeNext, 18 + Math.random() * 22);
            };
            typeNext();
        };

        const tio = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) { startTyping(); obs.disconnect(); }
            });
        }, { threshold: 0.3 });
        tio.observe(termCode.closest('.terminal'));
    }

    const filterRow = document.querySelector('.filter-row');
    if (filterRow) {
        const chips = filterRow.querySelectorAll('.filter-chip');
        const cards = document.querySelectorAll('#projects .flip-grid [data-tags]');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                const f = chip.dataset.filter;
                cards.forEach(card => {
                    const tags = card.dataset.tags.split(' ');
                    const show = f === 'all' || tags.includes(f);
                    card.classList.toggle('project-hidden', !show);
                });
            });
        });
    }

    document.querySelectorAll('.flashcard').forEach(card => {
        card.setAttribute('tabindex', '0');
        card.setAttribute('role', 'button');
        card.setAttribute('aria-pressed', 'false');
        const flip = () => {
            const isFlipped = card.classList.toggle('flipped');
            card.setAttribute('aria-pressed', String(isFlipped));
        };
        card.addEventListener('click', e => { if (!e.target.closest('a')) flip(); });
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); }
        });
    });

    document.querySelectorAll('.commit-summary').forEach(btn => {
        btn.setAttribute('aria-expanded', btn.closest('.commit').classList.contains('expanded') ? 'true' : 'false');
        btn.addEventListener('click', () => {
            const commit = btn.closest('.commit');
            const expanded = commit.classList.toggle('expanded');
            btn.setAttribute('aria-expanded', String(expanded));
        });
    });

    const actNav = document.querySelector('.activities-nav');
    if (actNav) {
        const rows = [...actNav.querySelectorAll('.activity-row')];
        const panels = [...actNav.querySelectorAll('.detail-panel')];
        rows.forEach(row => {
            row.addEventListener('click', () => {
                rows.forEach(r => r.classList.remove('active'));
                row.classList.add('active');
                const target = row.dataset.detail;
                panels.forEach(p => p.classList.toggle('active', p.id === 'detail-' + target));
            });
        });
    }

    console.log('%cHey, curious developer.', 'font-size:16px;font-weight:700;color:#4338ca;');
    console.log('%cThanks for peeking under the hood — built with vanilla JS, no framework. Fueled by coffee, occasional tennis player.', 'font-size:12px;color:#545a6e;');
});
