import { animate, hover, scroll } from 'https://cdn.jsdelivr.net/npm/motion@13.1.0/+esm';

(() => {
  const portfolio = window.Portfolio;
  if (!portfolio) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const signal = '#ee4c35';

  const bindHover = (elements, options = {}) => {
    const cancels = [];
    const amplitudeX = options.amplitudeX ?? 4;
    const amplitudeY = options.amplitudeY ?? 3;
    const tintEnabled = options.tint !== false;
    elements.forEach((element) => {
      const cancel = hover(element, (target, startEvent) => {
        const rect = target.getBoundingClientRect();
        const pointerX = rect.width ? (startEvent.clientX - rect.left) / rect.width - 0.5 : 0;
        const pointerY = rect.height ? (startEvent.clientY - rect.top) / rect.height - 0.5 : 0;
        const baseColor = getComputedStyle(target).color;
        const shift = animate(target, { x: pointerX * amplitudeX, y: pointerY * amplitudeY }, {
          type: 'spring', stiffness: 520, damping: 28, mass: 0.5
        });
        const tint = tintEnabled
          ? animate(target, { color: signal }, { duration: 0.18, ease: 'easeOut' })
          : { stop() {} };
        return () => {
          shift.stop();
          tint.stop();
          animate(target, { x: 0, y: 0 }, {
            type: 'spring', stiffness: 520, damping: 32, mass: 0.5
          });
          if (tintEnabled) animate(target, { color: baseColor }, { duration: 0.16, ease: 'easeOut' });
        };
      });
      cancels.push(cancel);
    });
    return () => cancels.splice(0).forEach((cancel) => cancel());
  };

  const module = {
    initGlobal() {
      if (reduceMotion.matches) return () => {};
      return bindHover(document.querySelectorAll('.nav-links a, .brand'), { amplitudeX: 2.4, amplitudeY: 1.4 });
    },
    initPage(container) {
      if (reduceMotion.matches) return () => {};
      const cleanupHover = bindHover(container.querySelectorAll('.project-link, .case-link, .case-nav a, .contact a'), { amplitudeX: 4, amplitudeY: 2.4 });
      const cleanupRows = bindHover(container.querySelectorAll('.project-entry'), { amplitudeX: 3.5, amplitudeY: 1.4, tint: false });
      const ruleBar = container.querySelector('.scroll-rule span');
      let cleanupScroll = () => {};
      if (ruleBar) {
        const progressAnimation = animate(ruleBar, {
          transform: ['scaleX(0)', 'scaleX(1)']
        }, { ease: 'linear' });
        cleanupScroll = scroll(progressAnimation);
      }
      return () => { cleanupHover(); cleanupRows(); cleanupScroll(); };
    }
  };

  portfolio.register('motion', module);
})();
