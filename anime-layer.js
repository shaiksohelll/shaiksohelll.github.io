import { animate, createTimeline, onScroll, stagger, svg } from 'https://cdn.jsdelivr.net/npm/animejs@4.0.2/+esm';

(() => {
  const portfolio = window.Portfolio;
  if (!portfolio) return;

  const module = {
    initPage(container, namespace) {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};

      const generated = [];
      const observers = [];
      const animations = [];
      const NS = 'http://www.w3.org/2000/svg';

      container.querySelectorAll('.anime-rule-host').forEach((host) => {
        const rule = document.createElementNS(NS, 'svg');
        const path = document.createElementNS(NS, 'path');
        const ink = host.closest('.contact') ? '#eee9df' : '#18181a';
        rule.setAttribute('viewBox', '0 0 1 1');
        rule.setAttribute('preserveAspectRatio', 'none');
        rule.setAttribute('aria-hidden', 'true');
        rule.classList.add('ink-rule');
        path.setAttribute('d', 'M0 0.5H1');
        path.setAttribute('pathLength', '1');
        path.setAttribute('stroke', ink);
        path.setAttribute('stroke-width', '0.03');
        path.setAttribute('vector-effect', 'non-scaling-stroke');
        path.setAttribute('fill', 'none');
        rule.appendChild(path);
        host.appendChild(rule);
        generated.push(rule);

        const [drawable] = svg.createDrawable(path);
        const observer = onScroll({ target: host, enter: 'top 90%', leave: 'bottom 10%' });
        observers.push(observer);
        animations.push(animate(drawable, { draw: ['0 0', '0 1'] }, {
          duration: 850,
          ease: 'outExpo',
          autoplay: observer
        }));
      });

      container.querySelectorAll('[data-count]').forEach((element, index) => {
        const state = { value: 0 };
        const observer = onScroll({
          target: element.closest('li') || element,
          enter: 'bottom 86%',
          leave: 'top 15%'
        });
        observers.push(observer);
        animations.push(animate(state, { value: Number(element.dataset.count) }, {
          duration: 900,
          delay: stagger(60)(index, element, container.querySelectorAll('[data-count]').length),
          ease: 'outExpo',
          autoplay: observer,
          onUpdate: () => {
            element.textContent = `${Math.round(state.value).toLocaleString()}${element.dataset.suffix || ''}`;
          }
        }));
      });

      if (namespace === 'home' && portfolio.page.skipHomeIntro) {
        container.querySelector('.intro-curtain')?.remove();
      }

      if (namespace === 'home' && !portfolio.page.skipHomeIntro) {
        const intro = createTimeline({ autoplay: false });
        intro
          .add(container.querySelector('.intro-dash'), { scaleX: [0, 1], duration: 650, ease: 'outExpo' })
          .add(container.querySelector('.hero-kicker'), { y: [8, 0], duration: 450, ease: 'outExpo' }, '-=300');
        animations.push(intro);
        const timer = window.setTimeout(() => intro.play(), 920);
        observers.push({ revert: () => window.clearTimeout(timer) });
      }

      return () => {
        animations.splice(0).reverse().forEach((animation) => {
          animation.pause?.();
          animation.cancel?.();
          animation.revert?.();
        });
        observers.splice(0).reverse().forEach((observer) => observer.revert?.());
        generated.splice(0).forEach((node) => node.remove());
      };
    }
  };

  portfolio.register('anime', module);
})();
