(() => {
  const portfolio = window.Portfolio;
  if (!portfolio) return;

  const transition = document.querySelector('.transition-wash');
  const transitionIndex = document.querySelector('.transition-index');
  const homeScrollKey = 'portfolio:home-scroll';
  const state = { navigating: false, namespace: null, failSafe: 0 };
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const namespaceOf = (container) => container?.dataset?.barbaNamespace || 'home';

  const isSameDocumentHash = (link) => {
    if (!link?.hash) return false;
    return link.origin === window.location.origin && link.pathname === window.location.pathname;
  };

  const shouldIgnore = (link) => {
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return true;
    if (link.dataset.noBarba !== undefined || link.dataset.barbaIgnore !== undefined) return true;
    if (/^(mailto:|tel:|javascript:)/i.test(link.protocol)) return true;
    if (link.origin !== window.location.origin) return true;
    if (isSameDocumentHash(link)) return true;
    return false;
  };

  const release = () => {
    window.clearTimeout(state.failSafe);
    transition?.classList.remove('is-active');
    document.documentElement.classList.remove('is-transitioning');
    state.navigating = false;
  };

  const enterOverlay = (nextContainer) => {
    if (!transition || reduced() || !window.gsap) return Promise.resolve();
    const title = nextContainer?.querySelector('[data-project-title]')?.textContent?.trim();
    if (transitionIndex) transitionIndex.textContent = title || '';
    state.failSafe = window.setTimeout(release, 1500);
    transition.classList.add('is-active');
    document.documentElement.classList.add('is-transitioning');
    return new Promise((resolve) => {
      window.gsap.fromTo(transition, { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, {
        opacity: 1,
        clipPath: 'inset(0 0% 0 0)',
        duration: 0.36,
        ease: 'power3.inOut',
        onComplete: resolve
      });
    });
  };

  const leaveOverlay = () => {
    if (!transition || reduced() || !window.gsap) {
      release();
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      window.gsap.to(transition, {
        opacity: 0,
        clipPath: 'inset(0 0 0 100%)',
        duration: 0.38,
        ease: 'power3.inOut',
        onComplete: () => { release(); resolve(); }
      });
    });
  };

  const scrollAfterEnter = (namespace, hash, trigger) => {
    if (namespace !== 'home') {
      window.scrollTo(0, 0);
      return;
    }
    const restored = Number(sessionStorage.getItem(homeScrollKey) || 0);
    window.scrollTo(0, hash ? 0 : (trigger === 'back' || trigger === 'forward' ? restored : 0));
    if (hash) {
      window.requestAnimationFrame(() => window.setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: reduced() ? 'auto' : 'smooth', block: 'start' });
      }, 50));
    }
  };

  const init = () => {
    portfolio.initGlobal();
    const initialContainer = document.querySelector('[data-barba="container"]');
    state.namespace = namespaceOf(initialContainer);
    if (!window.barba) {
      if (initialContainer) portfolio.initPage(initialContainer, state.namespace).then(() => portfolio.announce(state.namespace));
      return;
    }

    window.barba.hooks.before((data) => {
      if (state.navigating) return false;
      state.navigating = true;
      if (state.namespace === 'home') sessionStorage.setItem(homeScrollKey, String(window.scrollY));
      return enterOverlay(data.next.container);
    });

    window.barba.hooks.beforeLeave(() => {
      portfolio.clearPage();
    });

    window.barba.hooks.beforeEnter(async (data) => {
      const container = data.next.container;
      const namespace = namespaceOf(container);
      document.body.classList.toggle('case-page', namespace.startsWith('project-'));
      portfolio.updateMeta(container);
      await portfolio.initPage(container, namespace);
    });

    window.barba.hooks.afterEnter((data) => {
      state.namespace = namespaceOf(data.next.container);
      document.body.classList.toggle('case-page', state.namespace.startsWith('project-'));
      portfolio.closeMenu?.();
      portfolio.initGlobal();
      scrollAfterEnter(state.namespace, data.next.url?.hash || '', data.trigger);
      portfolio.announce(state.namespace);
      portfolio.focusPage(data.next.container);
    });

    window.barba.hooks.after((data) => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      return leaveOverlay().catch(release);
    });

    window.barba.init({
      debug: false,
      timeout: 3500,
      preventRunning: true,
      prevent: ({ el }) => shouldIgnore(el),
      transitions: [{
        name: 'editorial-paper-wipe',
        sync: true,
        async leave(data) {
          if (reduced() || !window.gsap) return;
          await window.gsap.to(data.current.container, { opacity: 0.2, duration: 0.2, ease: 'power2.out' });
        },
        async enter(data) {
          if (reduced() || !window.gsap) return;
          await window.gsap.fromTo(data.next.container, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.42, ease: 'power3.out' });
        },
        async once(data) {
          if (reduced() || !window.gsap) return;
          await window.gsap.fromTo(data.next.container, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
        }
      }]
    }).catch(() => {
      release();
    });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
