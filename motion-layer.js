import { animate, hover, scroll } from 'https://cdn.jsdelivr.net/npm/motion@13.1.0/+esm';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reduceMotion.matches) {
  const signal = '#ee4c35';
  const hoverTargets = document.querySelectorAll('.nav-links a, .project-link, .contact a');

  hoverTargets.forEach((element) => {
    const baseColor = getComputedStyle(element).color;
    hover(element, (target, startEvent) => {
      const rect = target.getBoundingClientRect();
      const pointerX = (startEvent.clientX - rect.left) / rect.width - 0.5;
      const pointerY = (startEvent.clientY - rect.top) / rect.height - 0.5;
      const shift = animate(target, {
        x: pointerX * 4,
        y: pointerY * 3
      }, {
        type: 'spring',
        stiffness: 520,
        damping: 28,
        mass: 0.5
      });
      const tint = animate(target, { color: signal }, { duration: 0.18, ease: 'easeOut' });

      return () => {
        shift.stop();
        tint.stop();
        animate(target, { x: 0, y: 0 }, {
          type: 'spring',
          stiffness: 520,
          damping: 32,
          mass: 0.5
        });
        animate(target, { color: baseColor }, { duration: 0.16, ease: 'easeOut' });
      };
    });
  });

  const ruleBar = document.querySelector('.scroll-rule span');
  if (ruleBar) {
    const progressAnimation = animate(ruleBar, {
      transform: ['scaleX(0)', 'scaleX(1)']
    }, { ease: 'linear' });
    scroll(progressAnimation);
  }
}
