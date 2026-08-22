(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches || !window.gsap || !window.ScrollTrigger || !window.SplitText) return;

  try {
    const { gsap, ScrollTrigger, SplitText } = window;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    gsap.config({ nullTargetWarn: false });

    const reveal = () => document.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible'));
    window.setTimeout(reveal, 1500);

    const titleNodes = document.querySelectorAll('.gsap-title');
    titleNodes.forEach((element) => {
      const isHero = element.id === 'hero-title';
      SplitText.create(element, {
        type: 'words, lines',
        mask: 'lines',
        autoSplit: true,
        aria: 'auto',
        onSplit(self) {
          const tween = gsap.from(self.lines, {
            yPercent: 110,
            opacity: 1,
            duration: 1,
            stagger: 0.08,
            ease: 'power3.out',
            delay: isHero ? 0.92 : 0,
            scrollTrigger: isHero ? undefined : {
              trigger: element,
              start: 'top 80%',
              once: true
            },
            onComplete: () => {
              gsap.delayedCall(0.05, () => {
                if (self && typeof self.revert === 'function') self.revert();
              });
            }
          });
          return tween;
        }
      });
    });

    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const wide = window.matchMedia('(min-width: 821px)').matches;
    if (finePointer && wide) {
      gsap.utils.toArray('.project-index').forEach((element) => {
        gsap.to(element, {
          y: -18,
          ease: 'none',
          scrollTrigger: {
            trigger: element.closest('.project-entry'),
            start: 'top bottom',
            end: 'bottom top',
            scrub: true
          }
        });
      });
    }

    if (window.Lenis) {
      const lenis = new window.Lenis({ lerp: 0.11, smoothWheel: true });
      window.__portfolioLenis = lenis;
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.on('scroll', ScrollTrigger.update);
      ScrollTrigger.refresh();
    } else {
      ScrollTrigger.refresh();
    }
  } catch (error) {
    document.querySelectorAll('.reveal').forEach((item) => item.classList.add('visible'));
    window.dispatchEvent(new CustomEvent('portfolio-motion-fallback', { detail: error }));
  }
})();
