import { animate, createTimeline, onScroll, stagger, svg } from 'https://cdn.jsdelivr.net/npm/animejs@4.0.2/+esm';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const createDrawable = svg.createDrawable;
if (!reduceMotion.matches) {
  const NS = 'http://www.w3.org/2000/svg';

  const drawRule = (host) => {
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

    const [drawable] = createDrawable(path);
    animate(drawable, {
      draw: ['0 0', '0 1']
    }, {
      duration: 850,
      ease: 'outExpo',
      autoplay: onScroll({
        target: host,
        enter: 'top 90%',
        leave: 'bottom 10%'
      })
    });
  };

  document.querySelectorAll('.anime-rule-host').forEach(drawRule);

  document.querySelectorAll('[data-count]').forEach((element) => {
    const target = Number(element.dataset.count);
    const suffix = element.dataset.suffix || '';
    const state = { value: 0 };
    animate(state, {
      value: target
    }, {
      duration: 900,
      delay: stagger(60),
      ease: 'outExpo',
      autoplay: onScroll({
        target: element.closest('li') || element,
        enter: 'bottom 86%',
        leave: 'top 15%'
      }),
      onUpdate: () => {
        element.textContent = `${Math.round(state.value).toLocaleString()}${suffix}`;
      }
    });
  });

  const intro = createTimeline({ autoplay: false });
  intro
    .add('.intro-dash', {
      scaleX: [0, 1],
      duration: 650,
      ease: 'outExpo'
    })
    .add('.hero-kicker', {
      y: [8, 0],
      duration: 450,
      ease: 'outExpo'
    }, '-=300');
  window.setTimeout(() => intro.play(), 920);
}
