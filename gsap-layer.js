(() => {
  const portfolio = window.Portfolio;
  if (!portfolio) return;

  const module = {
    initPage(container, namespace) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (reduceMotion.matches || !window.gsap || !window.ScrollTrigger || !window.SplitText) return () => {};

      const { gsap, ScrollTrigger, SplitText } = window;
      const splits = [];
      const tweens = [];
      let disposed = false;

      const makeTitleTween = (element) => {
        const isHero = element.id === 'case-title' || element.id === 'hero-title';
        const split = SplitText.create(element, {
          type: 'lines',
          linesClass: 'line',
          autoSplit: true,
          aria: 'auto',
          onSplit(self) {
            if (disposed) return;
            const lines = Array.from(self.lines || []);
            if (!lines.length) return;
            const tween = gsap.fromTo(lines,
              { yPercent: 72, opacity: 0 },
              {
                yPercent: 0,
                opacity: 1,
                duration: isHero ? 0.92 : 0.78,
                stagger: isHero ? 0.095 : 0.07,
                delay: isHero ? 0.16 : 0,
                ease: 'power3.out',
                scrollTrigger: isHero ? undefined : {
                  trigger: element,
                  start: 'top 82%',
                  once: true
                },
                onComplete: () => {
                  if (!disposed) gsap.set(lines, { clearProps: 'transform,opacity' });
                }
              }
            );
            tweens.push(tween);
            return tween;
          }
        });
        splits.push(split);
      };

      container.querySelectorAll('.gsap-title').forEach(makeTitleTween);

      if (namespace === 'home' && window.matchMedia('(pointer: fine)').matches && window.matchMedia('(min-width: 821px)').matches) {
        container.querySelectorAll('.project-index').forEach((element) => {
          const tween = gsap.to(element, {
            y: -18,
            ease: 'none',
            scrollTrigger: {
              trigger: element.closest('.project-entry'),
              start: 'top bottom',
              end: 'bottom top',
              scrub: true
            }
          });
          tweens.push(tween);
        });
      }

      ScrollTrigger.refresh();
      return () => {
        disposed = true;
        tweens.splice(0).reverse().forEach((tween) => {
          tween.scrollTrigger?.kill();
          tween.kill?.();
        });
        splits.splice(0).reverse().forEach((split) => split.revert?.());
      };
    }
  };

  portfolio.register('gsap', module);
})();
