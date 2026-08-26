import { animate, hover, scroll } from 'https://cdn.jsdelivr.net/npm/motion@13.1.0/+esm';

(() => {
  const portfolio = window.Portfolio;
  if (!portfolio) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const signal = '#ee4c35';

  const bindHover = (elements) => {
    const cancels = [];
    elements.forEach((element) => {
      const cancel = hover(element, (target, startEvent) => {
        const rect = target.getBoundingClientRect();
        const pointerX = rect.width ? (startEvent.clientX - rect.left) / rect.width - 0.5 : 0;
        const pointerY = rect.height ? (startEvent.clientY - rect.top) / rect.height - 0.5 : 0;
        const baseColor = getComputedStyle(target).color;
        const shift = animate(target, { x: pointerX * 4, y: pointerY * 3 }, {
          type: 'spring', stiffness: 520, damping: 28, mass: 0.5
        });
        const tint = animate(target, { color: signal }, { duration: 0.18, ease: 'easeOut' });
        return () => {
          shift.stop();
          tint.stop();
          animate(target, { x: 0, y: 0 }, {
            type: 'spring', stiffness: 520, damping: 32, mass: 0.5
          });
          animate(target, { color: baseColor }, { duration: 0.16, ease: 'easeOut' });
        };
      });
      cancels.push(cancel);
    });
    return () => cancels.splice(0).forEach((cancel) => cancel());
  };

  const module = {
    initGlobal() {
      if (reduceMotion.matches) return () => {};
      return bindHover(document.querySelectorAll('.nav-links a, .brand'));
    },
    initPage(container) {
      if (reduceMotion.matches) return () => {};
      const cleanupHover = bindHover(container.querySelectorAll('.project-link, .case-link, .case-nav a, .contact a'));
      const ruleBar = container.querySelector('.scroll-rule span');
      let cleanupScroll = () => {};
      if (ruleBar) {
        const progressAnimation = animate(ruleBar, {
          transform: ['scaleX(0)', 'scaleX(1)']
        }, { ease: 'linear' });
        cleanupScroll = scroll(progressAnimation);
      }
      return () => { cleanupHover(); cleanupScroll(); };
    }
  };

  portfolio.register('motion', module);
})();
