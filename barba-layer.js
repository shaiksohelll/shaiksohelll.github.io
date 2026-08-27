(() => {
  const portfolio = window.Portfolio;
  if (!portfolio) return;

  const transition = document.querySelector('.transition-wash');
  const transitionIndex = document.querySelector('.transition-index');
  const homeScrollKey = 'portfolio:home-scroll';
  const projectOrder = ['project-klar', 'project-pakka', 'project-metro', 'project-bhasha'];
  const state = {
    navigating: false,
    namespace: null,
    direction: 'forward',
    failSafe: 0,
    overlayTimeline: null,
    handoff: null
  };
  const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const namespaceOf = (container) => container?.dataset?.barbaNamespace || 'home';
  const pathOf = (url) => url?.path || url?.pathname || '';
  const namespaceFromPath = (path) => {
    if (path.includes('/work/klar')) return 'project-klar';
    if (path.includes('/work/pakka')) return 'project-pakka';
    if (path.includes('/work/hyderabad-metro-go')) return 'project-metro';
    if (path.includes('/work/bhasha-seva')) return 'project-bhasha';
    return 'home';
  };
  const indexFromPath = (path) => {
    const index = projectOrder.indexOf(namespaceFromPath(path));
    return index >= 0 ? String(index + 1).padStart(2, '0') : '';
  };

  const directionOf = (data) => {
    const currentNamespace = namespaceOf(data.current?.container) || state.namespace;
    const nextNamespace = namespaceFromPath(pathOf(data.next?.url));
    if (data.trigger === 'back') return 'backward';
    if (data.trigger === 'forward') return 'forward';
    if (currentNamespace === 'home' && nextNamespace !== 'home') return 'forward';
    if (currentNamespace !== 'home' && nextNamespace === 'home') return 'backward';
    const currentIndex = projectOrder.indexOf(currentNamespace);
    const nextIndex = projectOrder.indexOf(nextNamespace);
    if (currentIndex >= 0 && nextIndex >= 0) return nextIndex >= currentIndex ? 'forward' : 'backward';
    return 'forward';
  };

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

  const cleanupHandoff = () => {
    if (state.handoff?.clone) state.handoff.clone.remove();
    if (state.handoff?.index) state.handoff.index.remove();
    state.handoff = null;
  };

  const release = () => {
    window.clearTimeout(state.failSafe);
    state.overlayTimeline?.kill?.();
    state.overlayTimeline = null;
    cleanupHandoff();
    if (transition && window.gsap) window.gsap.set(transition, { clearProps: 'opacity,clipPath' });
    transition?.classList.remove('is-active', 'is-reverse');
    document.documentElement.classList.remove('is-transitioning');
    state.navigating = false;
  };

  const sourceForHandoff = (data, currentNamespace, nextNamespace) => {
    const trigger = data.trigger instanceof Element ? data.trigger : null;
    if (currentNamespace === 'home' && nextNamespace !== 'home') {
      return trigger?.querySelector('h3') || data.next?.container?.querySelector('[data-project-title]');
    }
    return data.current?.container?.querySelector('[data-project-title]')
      || data.next?.container?.querySelector('[data-project-title]');
  };

  const indexForHandoff = (data, currentNamespace, nextNamespace) => {
    const trigger = data.trigger instanceof Element ? data.trigger : null;
    if (currentNamespace === 'home' && nextNamespace !== 'home') {
      return trigger?.closest('.project-entry')?.querySelector('.project-index');
    }
    return data.current?.container?.querySelector('.case-index')
      || data.next?.container?.querySelector('.case-index');
  };

  const makeHandoff = (data) => {
    if (reduced() || !window.gsap) return null;
    const currentNamespace = namespaceOf(data.current?.container);
    const nextNamespace = namespaceFromPath(pathOf(data.next?.url));
    const trigger = data.trigger instanceof Element ? data.trigger : null;
    if (currentNamespace === 'home' && nextNamespace === 'home') return null;
    const source = sourceForHandoff(data, currentNamespace, nextNamespace);
    if (!source) return null;
    const sourceRect = source.getBoundingClientRect();
    const clone = source.cloneNode(true);
    clone.classList.add('route-title-clone', currentNamespace === 'home' ? 'home-project-title-clone' : 'case-project-title-clone');
    clone.removeAttribute('id');
    clone.setAttribute('aria-hidden', 'true');
    clone.style.left = `${sourceRect.left}px`;
    clone.style.top = `${sourceRect.top}px`;
    clone.style.width = `${Math.max(sourceRect.width, 1)}px`;
    document.body.appendChild(clone);

    const indexSource = indexForHandoff(data, currentNamespace, nextNamespace);
    let index = null;
    if (indexSource) {
      const indexRect = indexSource.getBoundingClientRect();
      index = document.createElement('span');
      index.className = 'route-index-clone';
      index.textContent = currentNamespace === 'home'
        ? (trigger?.dataset.projectIndex || indexSource.textContent.trim().slice(0, 2))
        : (indexSource.textContent.trim() || indexFromPath(pathOf(data.current?.url)));
      index.setAttribute('aria-hidden', 'true');
      index.style.left = `${indexRect.left}px`;
      index.style.top = `${indexRect.top}px`;
      document.body.appendChild(index);
    }

    const gutter = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--gutter')) || 24;
    const titleTargetX = Math.max(gutter, (window.innerWidth - Math.min(window.innerWidth * 0.72, 720)) / 2);
    const titleTargetY = Math.max(96, window.innerHeight * 0.5 - Math.min(sourceRect.height, 160) / 2);
    const indexTargetX = Math.max(gutter, window.innerWidth - gutter - 72);
    const indexTargetY = Math.max(gutter, window.innerHeight - gutter - 72);
    return {
      clone,
      index,
      titleTargetX,
      titleTargetY,
      indexTargetX,
      indexTargetY,
      direction: state.direction
    };
  };

  const enterOverlay = (data) => {
    if (!transition || reduced() || !window.gsap) return Promise.resolve();
    state.handoff = makeHandoff(data);
    if (transitionIndex) transitionIndex.textContent = indexFromPath(pathOf(data.next?.url));
    transition.classList.toggle('is-reverse', state.direction === 'backward');
    transition.classList.add('is-active');
    document.documentElement.classList.add('is-transitioning');
    const coverFrom = state.direction === 'forward' ? 'inset(0 100% 0 0)' : 'inset(0 0 0 100%)';
    return new Promise((resolve) => {
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(state.failSafe);
        resolve();
      };
      state.failSafe = window.setTimeout(() => {
        release();
        finish();
      }, 1500);
      const timeline = window.gsap.timeline({ onComplete: finish });
      state.overlayTimeline = timeline;
      timeline.fromTo(transition,
        { opacity: 0, clipPath: coverFrom },
        { opacity: 1, clipPath: 'inset(0 0% 0 0)', duration: 0.24, ease: 'power3.inOut' }
      );
      if (state.handoff?.clone) {
        timeline.to(state.handoff.clone, {
          left: state.handoff.titleTargetX,
          top: state.handoff.titleTargetY,
          scale: 1.04,
          opacity: 1,
          duration: 0.38,
          ease: 'power3.inOut'
        }, '-=0.1');
      }
      if (state.handoff?.index) {
        timeline.to(state.handoff.index, {
          left: state.handoff.indexTargetX,
          top: state.handoff.indexTargetY,
          opacity: 1,
          duration: 0.28,
          ease: 'power3.inOut'
        }, '-=0.24');
      }
    });
  };

  const leaveOverlay = () => {
    if (!transition || reduced() || !window.gsap) {
      release();
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      const timeline = window.gsap.timeline({
        onComplete: () => { release(); resolve(); }
      });
      state.overlayTimeline = timeline;
      const exitClip = state.direction === 'forward' ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)';
      if (state.handoff?.clone) timeline.to(state.handoff.clone, { opacity: 0, y: -10, duration: 0.14, ease: 'power2.out' }, 0);
      if (state.handoff?.index) timeline.to(state.handoff.index, { opacity: 0, y: -8, duration: 0.12, ease: 'power2.out' }, 0);
      timeline.to(transition, {
        opacity: 0,
        clipPath: exitClip,
        duration: 0.22,
        ease: 'power3.inOut'
      }, 0.02);
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
      state.direction = directionOf(data);
      const nextNamespace = namespaceFromPath(pathOf(data.next?.url));
      portfolio.page.skipHomeIntro = state.namespace !== 'home' && nextNamespace === 'home';
      if (state.namespace === 'home') sessionStorage.setItem(homeScrollKey, String(window.scrollY));
      return enterOverlay(data);
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
      portfolio.page.skipHomeIntro = false;
    });

    window.barba.hooks.after((data) => {
      if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      return leaveOverlay().catch(release);
    });

    try {
      const initialized = window.barba.init({
      debug: false,
      timeout: 3500,
      preventRunning: true,
      prevent: ({ el }) => shouldIgnore(el),
      transitions: [{
        name: 'editorial-paper-wipe',
        sync: true,
        async leave(data) {
          if (reduced() || !window.gsap) return;
          await window.gsap.to(data.current.container, { opacity: 0.16, duration: state.direction === 'forward' ? 0.12 : 0.1, ease: 'power2.out' });
        },
        async enter(data) {
          if (reduced() || !window.gsap) return;
          const y = state.direction === 'forward' ? 18 : -18;
          await window.gsap.fromTo(data.next.container, { opacity: 0, y }, { opacity: 1, y: 0, duration: 0.24, ease: 'power3.out' });
        },
        async once(data) {
          if (reduced() || !window.gsap) return;
          await window.gsap.fromTo(data.next.container, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
        }
      }]
      });
      initialized?.catch?.(() => release());
    } catch (error) {
      console.warn('Barba initialization failed; native links remain available', error);
      release();
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
  else init();
})();
