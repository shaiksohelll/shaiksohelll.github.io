(() => {
  const root = window.Portfolio = window.Portfolio || {};
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  root.modules = root.modules || {};
  root.page = root.page || { namespace: null, container: null, cleanups: [], homeScrollY: 0 };
  root.global = root.global || { initialized: false, cleanups: [], lenis: null, raf: 0 };
  root.config = {
    duration: 0.82,
    ease: 'power3.inOut',
    reduced: reduceMotion.matches,
    saveData: Boolean(navigator.connection && navigator.connection.saveData)
  };

  root.register = (name, module) => {
    root.modules[name] = module;
    if (root.global.initialized && typeof module.initGlobal === 'function') {
      const cleanup = module.initGlobal(root);
      if (typeof cleanup === 'function') root.global.cleanups.push(cleanup);
    }
    if (root.page.container && typeof module.initPage === 'function') {
      const cleanup = module.initPage(root.page.container, root.page.namespace, root);
      root.addPageCleanup(cleanup);
    }
  };

  root.addPageCleanup = (cleanup) => {
    if (typeof cleanup === 'function') root.page.cleanups.push(cleanup);
    return cleanup;
  };

  root.clearPage = () => {
    root.page.cleanups.splice(0).reverse().forEach((cleanup) => {
      try { cleanup(); } catch (error) { console.warn('Portfolio page cleanup failed', error); }
    });
    root.page.namespace = null;
    root.page.container = null;
  };

  root.waitForLayout = async (container) => {
    if (document.fonts && document.fonts.ready) await document.fonts.ready;
    const images = Array.from(container.querySelectorAll('img'));
    await Promise.all(images.filter((image) => !image.complete).map((image) => new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true });
      image.addEventListener('error', resolve, { once: true });
    })));
  };

  root.updateMeta = (container) => {
    const title = container.dataset.pageTitle;
    const description = container.dataset.pageDescription;
    if (title) document.title = title;
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    const pageUrl = container.dataset.pageUrl;
    if (pageUrl) {
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', pageUrl);
      document.querySelector('meta[property="og:url"]')?.setAttribute('content', pageUrl);
    }
    if (title) {
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', title);
      document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', title);
    }
    if (description) {
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
      document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', description);
    }
  };

  root.initGlobal = () => {
    if (root.global.initialized) return;
    root.global.initialized = true;

    if (!document.querySelector('link[href="/visual-fixes.css"]')) {
      const fixSheet = document.createElement('link');
      fixSheet.rel = 'stylesheet';
      fixSheet.href = '/visual-fixes.css';
      document.head.appendChild(fixSheet);
    }

    const toggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const closeMenu = () => {
      navLinks?.classList.remove('open');
      toggle?.setAttribute('aria-expanded', 'false');
      if (toggle) toggle.textContent = 'Menu';
    };
    root.closeMenu = closeMenu;
    toggle?.addEventListener('click', () => {
      const open = navLinks.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    navLinks?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    root.global.cleanups.push(closeMenu);

    if (!root.config.reduced && window.Lenis) {
      const lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true });
      root.global.lenis = lenis;
      if (window.ScrollTrigger) lenis.on('scroll', window.ScrollTrigger.update);
      const raf = (time) => {
        lenis.raf(time * 1000);
        root.global.raf = requestAnimationFrame(raf);
      };
      root.global.raf = requestAnimationFrame(raf);
    }

    Object.values(root.modules).forEach((module) => {
      if (typeof module.initGlobal !== 'function') return;
      const cleanup = module.initGlobal(root);
      if (typeof cleanup === 'function') root.global.cleanups.push(cleanup);
    });

    const rememberScroll = () => {
      if (root.page.namespace === 'home') root.page.homeScrollY = window.scrollY;
    };
    window.addEventListener('scroll', rememberScroll, { passive: true });
    root.global.cleanups.push(() => window.removeEventListener('scroll', rememberScroll));
  };

  root.destroyGlobal = () => {
    root.clearPage();
    root.global.cleanups.splice(0).reverse().forEach((cleanup) => {
      try { cleanup(); } catch (error) { console.warn('Portfolio global cleanup failed', error); }
    });
    if (root.global.raf) cancelAnimationFrame(root.global.raf);
    root.global.lenis?.destroy?.();
    root.global.lenis = null;
    root.global.initialized = false;
  };

  root.initPage = async (container, namespace) => {
    root.clearPage();
    root.page.namespace = namespace;
    root.page.container = container;
    const revealItems = container.querySelectorAll('.reveal');
    const failOpen = window.setTimeout(() => revealItems.forEach((item) => item.classList.add('visible')), 1500);
    root.addPageCleanup(() => window.clearTimeout(failOpen));
    await root.waitForLayout(container);
    if (root.config.reduced || !('IntersectionObserver' in window)) {
      revealItems.forEach((item) => item.classList.add('visible'));
    } else {
      const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      }), { threshold: 0.12 });
      revealItems.forEach((item) => observer.observe(item));
      root.addPageCleanup(() => observer.disconnect());
    }
    Object.values(root.modules).forEach((module) => {
      if (typeof module.initPage !== 'function') return;
      const cleanup = module.initPage(container, namespace, root);
      root.addPageCleanup(cleanup);
    });

    if (window.ScrollTrigger) window.ScrollTrigger.refresh();
  };

  root.focusPage = (container) => {
    const target = container.querySelector('[data-page-heading], h1, h2') || container;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    window.requestAnimationFrame(() => target.focus({ preventScroll: true }));
  };

  root.announce = (namespace) => {
    const announcement = document.querySelector('#page-announcement');
    if (!announcement) return;
    const title = document.querySelector('[data-barba="container"] h1, [data-barba="container"] h2')?.textContent?.trim();
    announcement.textContent = title ? `${title} loaded` : `${namespace} loaded`;
  };
})();
