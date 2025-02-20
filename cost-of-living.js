'use strict';

// Audio Setup
let checkoutSound;
let receiptAudio;
let lenis;
// Device Detection

const isMobile = window.matchMedia('(max-width: 477px)').matches;
const isTablet = window.matchMedia('(min-width: 478px) and (max-width: 991px)').matches;

const addSpacer = (element, height = '100svh') => {
  // if (!isMobile) {
  const spacer = document.createElement('div');
  spacer.style.height = height;
  element.insertAdjacentElement('afterend', spacer);
  // }
};

const checkLandscape = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator
    .userAgent);
  const isLandscape = window.matchMedia('(orientation: landscape)').matches;
  const overlay = document.querySelector('.rotate-landscape');
  const page = document.querySelector('.page-wrapper');
  overlay.style.display = (isMobile && isLandscape) ? 'flex' : 'none';
  page.style.display = (isMobile && isLandscape) ? 'none' : 'block';
}
checkLandscape();
window.addEventListener('orientationchange', () => {
  checkLandscape();
});
const breakpoints = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 991px)',
  desktop: '(min-width: 992px)'
};
const getCurrentBreakpoint = () => {
  return Object.keys(breakpoints).find(breakpoint =>
    window.matchMedia(breakpoints[breakpoint]).matches
  );
};
let currentBreakpoint = getCurrentBreakpoint();
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const newBreakpoint = getCurrentBreakpoint();
    if (newBreakpoint !== currentBreakpoint) {
      window.location.reload();
    }
    currentBreakpoint = newBreakpoint;
  }, 250);
});

if (isMobile) {
  ScrollTrigger.getAll().forEach(st => st.kill(true)); // Kill all ScrollTriggers
  ScrollTrigger.clearMatchMedia(); // Clear any matchMedia

  let sections = gsap.utils.toArray('[section]');
  sections.reverse();
  sections.forEach(section => document.querySelector('.scroll').appendChild(section));
  document.querySelector('[scroll-up]').textContent = 'Swipe down';
  document.body.style.overflow = 'hidden';

  // Small delay to ensure DOM is updated
  gsap.delayedCall(0, () => {
    ScrollTrigger.refresh(true);
    initSectionAnimations();
    createSVGOverlays();
    ScrollTrigger.refresh(true);
    window.scrollTo(0, 0)
  });
} else {
  lenis = new Lenis({
    wheelMultiplier: -1,
    touchMutipler: 0,
    smoothTouch: false,
    smooth: true,
    gestureDirection: 'vertical'
  });

  window.addEventListener('beforeunload', () => {
    lenis.scrollTo('bottom', { immediate: true });
  });

  window.addEventListener('resize', () => {
    lenis.resize();
    ScrollTrigger.refresh();
  });

  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.on('scroll', ScrollTrigger.update);
  lenis.stop();

  lenis.scrollTo('bottom', {
    force: true,
    immediate: true,
    onComplete: () => {
      initSectionAnimations();
      initFutureAnimation();
      initInflationAnimation();
      initFooterAnimation();
      initScrollbar();
      createSVGOverlays();
      lenis.resize();
    }
  });
}

// Cookie Functions
const setCookie = (name, value, days = 1) => {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = name + '=' + encodeURIComponent(value) + ';expires=' + expires + ';path=/';
};

const getCookie = (name) => {
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, '');
};
// document.cookie = "preloaderSeen=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
const hasSeenPreloader = getCookie('preloaderSeen');

const masterTl = gsap.timeline();
const tl = gsap.timeline({ paused: true });

const preloaderTl = gsap.timeline({
  onUpdate: () => {
    if (!isMobile) {
      lenis.resize();
      lenis.scrollTo('bottom', { immediate: true, force: true })
    }
  }
});

const watchTl = gsap.timeline({ paused: true });
const shareTl = gsap.timeline({ paused: true });
const paginationTl = gsap.timeline({ paused: true });

if (hasSeenPreloader) {
  preloaderTl
    .set('.mute', { opacity: 0 })
    .set('[preloader-hide]', { opacity: 1 })
    .set('.preloader', { display: 'block' })
    .set('.preloader_content', { display: 'none' })
    .fromTo('.preloader_progress', {
      textContent: '0%'
    }, {
      textContent: '100%',
      duration: 2,
      snap: { textContent: 1 },
      ease: 'none',
    })
    .to({}, { duration: 0.2 })
    .to('.preloader_progress', {
      yPercent: -110,
      duration: 0.5,
      ease: 'power4'
    })
    .to(".preloader_2", {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 1,
      ease: 'power4.inOut'
    }, '<5%')
    .to('.preloader', {
      opacity: 0,
      duration: 1,
      ease: 'power3',
      onComplete: () => {
        $('.preloader').remove();
      },
      onStart: () => isMobile ? document.body.style.overflow = 'auto' : lenis.start()
    });

  masterTl
    .add(preloaderTl)
    .from('.frame', {
      scale: 1.3,
      yPercent: 10,
      duration: 1.5,
      ease: 'power3.out'
    }, '<0.2')
    .from('.main-arrow', {
      yPercent: 70,
      duration: 1.5,
      opacity: 0,
      ease: 'power4'
    }, '<')
    .from('.hero_avatar', {
      scale: 1.2,
      ease: 'back.out',
      duration: 1,
      opacity: 0,
    }, '<')
    .call(() => watchTl.play(), null, '<0.7')
    .call(() => shareTl.play(), null, '<0.72')
    .call(() => paginationTl.play(), null, '<0.75');
} else {
  preloaderTl
    .set('[preloader-hide]', { opacity: 1 })
    .set('.preloader', { display: 'block' })
    .fromTo('.preloader_progress', {
      textContent: '0%'
    }, {
      textContent: '100%',
      duration: 3,
      snap: { textContent: 1 },
      ease: 'none',
    })
    .to({}, { duration: 0.2 })
    .to('.preloader_progress', {
      yPercent: -110,
      duration: 0.5,
      ease: 'power4'
    })
    .to(".preloader_2", {
      clipPath: 'inset(0% 0% 100% 0%)',
      duration: 1,
      ease: 'power4.inOut'
    }, '<5%');

  tl
    .from('#hero', {
      scale: 1.2,
      duration: 1.5,
      ease: 'power4.out'
    })
    .from('.preloader', {
      backdropFilter: 'blur(3em)',
      duration: 1,
      ease: 'power3'
    }, '<')
    .from(".preloader_logo", {
      scale: 1.2,
      opacity: 0,
      duration: 1,
      ease: 'back.out'
    }, '<')
    .from('.preloader_cta', {
      scale: 0,
      yPercent: 100,
      opacity: 0,
      duration: 1,
      ease: 'power4.out'
    }, '<')
    .from(".preloader_text", {
      yPercent: 100,
      scale: 0,
      opacity: 0,
      duration: 1,
      ease: 'power4'
    }, '<');

  masterTl
    .add(preloaderTl)
    .add(tl.play(), '-=0.5')
    .addPause()
    .to('.preloader', {
      backdropFilter: 'blur(0em)',
      opacity: 0,
      duration: 1,
      ease: 'power3',
      onComplete: () => {
        $('.preloader').remove();
        setCookie('preloaderSeen', 'true', 1);
      }
    })
    .to(".preloader_h > *", {
      filter: 'blur(1em)',
      opacity: 0,
      stagger: 0.2,
      duration: 2,
      ease: 'back.in'
    }, '<')
    .from('.frame', {
      scale: 1.3,
      yPercent: 10,
      duration: 1.5,
      ease: 'power3.out'
    }, '<')
    .from('.main-arrow', {
      yPercent: 70,
      duration: 1.5,
      opacity: 0,
      ease: 'power4'
    }, '<0.5')
    .from('.hero_avatar', {
      scale: 1.2,
      ease: 'back.out',
      duration: 1,
      opacity: 0,
    }, '<')
    .call(() => watchTl.play(), null, '<0.7')
    .call(() => shareTl.play(), null, '<0.72')
    .call(() => paginationTl.play(), null, '<0.75');
}

// Watch CTA Animation
watchTl
  .from('.watch-cta', {
    scale: 0,
    backgroundColor: 'transparent',
    duration: 0.5,
    ease: 'back.out'
  })
  .fromTo('.watch-cta', { width: '2.6em' },
  {
    width: '10em',
    duration: 1,
    ease: 'power4'
  })
  .from('.watch-cta p', {
    opacity: 0,
    duration: .5,
    ease: 'power2'
  }, '<20%');

// Share CTA Animation
shareTl
  .set('.share-cta > .yellow-icon', { xPercent: 50 })
  .from('.share-cta > .yellow-icon', {
    scale: 0,
    duration: 0.5,
    ease: 'back.out'
  })
  .to('.share-cta > .yellow-icon', {
    xPercent: 0,
    duration: 1,
    ease: 'power4'
  })
  .from('.share-cta p', {
    opacity: 0,
    duration: 0.3,
    ease: 'power2'
  }, '<20%');

// Pagination Animation
const activePagItem = document.querySelector('.frame_pagination-item.active') ||
  document.querySelector('.frame_pagination-item:last-child');
const otherPagItems = gsap.utils.toArray('.frame_pagination-item:not(.active)');

paginationTl
  .from(activePagItem, {
    width: 0,
    duration: 0.8,
    ease: 'power2.out'
  })
  .from(otherPagItems, {
    y: '1em',
    opacity: 0,
    duration: 0.7,
    stagger: 0.01,
    ease: 'power2.out'
  }, "<30%");

let audioInstances = [];
let isMuted = false;

document.querySelector('.preloader').addEventListener('click', () => {

  isMobile ? document.body.style.overflow = 'auto' : lenis.start()
  masterTl.play()
  checkoutSound = new Audio('https://cdn.jsdelivr.net/gh/flowdudes/others@main/checkout.mp3');
  receiptAudio = new Audio(
    'https://cdn.jsdelivr.net/gh/flowdudes/others@main/receipt-sound.mp3')
  audioInstances = [checkoutSound, receiptAudio];
});

document.querySelector('.mute').addEventListener('click', () => {
  isMuted = !isMuted;
  audioInstances.forEach(audio => {
    if (audio instanceof Audio) {
      audio.muted = isMuted;
    }
  });
});

// TEXT EFFECTS 
const wipeElements = document.querySelectorAll('[fd-effect=wipe]');
wipeElements.forEach(el => {
  const text = new SplitType(el, { types: 'words, chars' });
  const chars = text.chars;
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: 'top 40%',
      end: 'top top',
      scrub: 1,
    }
  });

  tl.fromTo(chars, {
    opacity: 1,
  }, {
    opacity: 0,
    duration: 0.4,
    stagger: {
      each: 0.01,
      from: 'end'
    },
    ease: 'power3'
  })
});

if (isMobile) {
  document.querySelectorAll('[mobile-fade]').forEach(element => {
    gsap.from(element, {
      opacity: 0,
      yPercent: 10,
      duration: 1.3,
      ease: 'power4',
      scrollTrigger: {
        trigger: element,
        start: "top 80%",
        end: "center center",
        toggleActions: "play none none reverse"
      }
    });
  });
}

function getWipeAnimation(section) {
  const wipeEl = section.querySelector('[fd-section-wipe]');
  if (!wipeEl) return null;

  const text = new SplitType(wipeEl, { types: 'words, chars' });
  const tl = gsap.timeline({ paused: true })
    .fromTo(text.chars, {
      opacity: 1,
    }, {
      opacity: 0,
      duration: 0.4,
      stagger: {
        each: 0.01,
        from: 'end'
      },
      ease: 'power3'
    });

  return tl;
}

const cta = document.querySelector('.footer_cta');
const textElements = ['.text-size-medium', '.footer_cta-icon'];

const hoverTl = gsap.timeline({ paused: true })
  .to(cta, {
    backgroundColor: '#FFF200',
    duration: 0.3
  })
  .to(textElements, {
    color: '#000000',
    duration: 0.3
  }, '<');

cta.addEventListener('mouseenter', () => hoverTl.play());
cta.addEventListener('mouseleave', () => hoverTl.reverse());

// Section Animations
function initSectionAnimations() {
  const sections = document.querySelectorAll('[section-items]');
  // checkoutSound.volume = 0.3;

  const arrowTl = gsap.timeline({ paused: true })
    .to('.main-arrow', {
      yPercent: 10,
      duration: 0.5,
      ease: 'back.in(2)'
    })
    .to('.main-arrow', {
      yPercent: 0,
      duration: 0.5,
      ease: 'back.out(2)'
    }, '<0.15');

  sections.forEach(section => {
    const itemsWrap = section.querySelectorAll('.items_wrap');
    addSpacer(section, `${itemsWrap.length * 100}${isMobile ? 'vh' : 'svh'}`);

    const prices = {};
    itemsWrap.forEach(wrap => {
      const itemValue = wrap.getAttribute('item');
      const wasPrice = section.querySelector(`[price="${itemValue}"] [was] .items_price`);
      const nowPrice = section.querySelector(`[price="${itemValue}"] [now] .items_price`);
      prices[itemValue] = {
        was: {
          value: parseFloat(wasPrice.textContent.replace('$', '')),
          hasDecimals: wasPrice.textContent.includes('.')
        },
        now: {
          value: parseFloat(nowPrice.textContent.replace('$', '')),
          hasDecimals: nowPrice.textContent.includes('.')
        }
      };
    });

    const masterTl = gsap.timeline({ paused: true });

    itemsWrap.forEach((wrap, index) => {
      const itemValue = wrap.getAttribute('item');
      const itemImg = wrap.querySelector('.items_img');
      const itemPricing = section.querySelector(`[price="${itemValue}"]`);
      const itemsName = section.querySelectorAll('.items_name');
      const itemsPer = itemPricing.querySelector('.items_per');
      const isLastItem = index === itemsWrap.length - 1;

      const formatPrice = (value, hasDecimals) => {
        return hasDecimals ? value.toFixed(2) : Math.round(value).toString();
      };

      const animatePrice = (el, priceData) => {
        const finalValue = priceData.value;
        const duration = 0.8;
        let startValue = 0;

        return gsap.to({ value: startValue }, {
          value: finalValue,
          duration: duration,
          ease: "power1.inOut",
          onUpdate: function () {
            const currentValue = this.targets()[0].value;
            el.textContent = `$${formatPrice(currentValue, priceData.hasDecimals)}`;
          },
          onComplete: () => {
            el.textContent = `$${formatPrice(finalValue, priceData.hasDecimals)}`;
          }
        });
      };

      const animatePrices = () => {
        const wasEl = itemPricing.querySelector('[was] .items_price');
        const nowEl = itemPricing.querySelector('[now] .items_price');
        const wasText = itemPricing.querySelector('[was] .text-size-medium');
        const nowText = itemPricing.querySelector('[now] .text-size-medium');
        const divider = itemPricing.querySelector('.items_divider');

        gsap.from(wasText, {
          opacity: 0,
          yPercent: 100,
          duration: 0.3
        });

        gsap.from(nowText, {
          opacity: 0,
          yPercent: 100,
          duration: 0.3
        });

        if (itemsPer) {
          gsap.fromTo(itemsPer, {
            clipPath: 'inset(0 100% 0 0)'
          }, {
            clipPath: 'inset(0 0 0 0)',
            duration: 0.5,
            ease: 'power2.inOut'
          });
        }

        animatePrice(wasEl, prices[itemValue].was);
        animatePrice(nowEl, prices[itemValue].now);

        gsap.to(wasEl, {
          textDecoration: 'line-through',
          delay: 0.8,
          duration: 0.1
        });

        gsap.fromTo(divider, {
          opacity: 0
        }, {
          opacity: 1,
          duration: 0.2,
          delay: 0.3
        });
      };

      const wrapTl = gsap.timeline()
        .from(itemPricing, {
          clipPath: isMobile ? 'inset(0% 0% 100% 0%)' : 'inset(0% 0% 0% 100%)',
          duration: 1,
          ease: 'power2.inOut',
          onUpdate: function () {
            if (this.progress() > 0.5 && !this.hasAnimatedPrices) {
              this.hasAnimatedPrices = true;
              animatePrices();
            }
          }
        })
        .to(itemsName, {
          yPercent: (index + 1) * -100,
          duration: 1,
          ease: 'power2.inOut'
        }, '<')
        .from(itemImg, {
          scale: 0,
          duration: 1,
          ease: 'power2.inOut',
          onStart: () => {
            arrowTl.restart()
            if (checkoutSound instanceof Audio) {
              gsap.to(checkoutSound, {
                volume: 0,
                duration: 0.1,
                onComplete: () => {
                  checkoutSound.currentTime = 0
                  checkoutSound.volume = 0.3
                  checkoutSound.play()

                  gsap.to(checkoutSound, {
                    volume: 0,
                    duration: 1.5,
                    ease: "none"
                  })
                }
              })
            }
          }
        }, '<')
        .to({}, { duration: 1 });

      if (!isLastItem) {
        wrapTl
          .to(itemPricing, {
            clipPath: isMobile ? 'inset(100% 0% 0% 0%)' : 'inset(0% 100% 0% 0%)',
            xPercent: isMobile ? 0 : -30,
            yPercent: isMobile ? 10 : 0,
            duration: 1,
            ease: 'power2.inOut'
          })
          .to(itemImg, {
            x: '-200%',
            scale: 0.5,
            duration: 1,
            ease: 'power2.inOut'
          }, '<');
      }

      masterTl.add(wrapTl, index === 0 ? 0 : '-=0.75');
    });
    if (isMobile) masterTl.progress(0)

    ScrollTrigger.create({
      trigger: section,
      pin: section,
      pinSpacing: isMobile ? false : false,
      anticipatePin: true,
      start: 'bottom bottom',
      end: `+=${itemsWrap.length * 100}%`,
      scrub: 1,
      onUpdate: self => {
        masterTl.progress(isMobile ? self.progress : 1 - self.progress);
      }
    });
  });
}

function initFutureAnimation() {
  const section = document.querySelector('#section-future');
  const image = section.querySelector('.conclusion_img');
  addSpacer(section);

  const tl = gsap.timeline({ paused: true })
    .to({}, { duration: 2 })
    .to(image, {
      scale: 0,
      opacity: 0,
      xPercent: 50,
      yPercent: 20,
      duration: 1,
      ease: 'power4'
    })

  const wipeTl = getWipeAnimation(section);

  ScrollTrigger.create({
    trigger: section,
    pin: true,
    pinSpacing: isMobile ? false : false,
    start: 'top top',
    end: '+=100%',
    scrub: 1,
    onUpdate: self => {
      tl.progress(self.progress);
      if (wipeTl) wipeTl.progress(self.progress);
    },

  });
}

function initInflationAnimation() {
  const sections = document.querySelectorAll('[section-inflation]');
  sections.forEach(section => {
    const image = section.querySelector('.intro_img');
    addSpacer(section);
    const tl = gsap.timeline({
        paused: true,
      })
      .from(image, {
        clipPath: 'inset(0 100% 0 0)',
        duration: 1,
        ease: 'power2.inOut'
      })

    const wipeTl = getWipeAnimation(section);

    ScrollTrigger.create({
      trigger: section,
      pin: true,
      pinSpacing: isMobile ? false : false,
      start: 'top top',
      end: '+=100%',
      scrub: 1,
      onUpdate: self => {
        tl.progress(isMobile ? self.progress : 1 - self.progress);
        if (wipeTl) wipeTl.progress(self.progress);
      }
    });
  });
}

function initFooterAnimation() {
  const section = document.querySelector('.footer_component');
  addSpacer(section, isMobile ? '200vh' : '200svh');
  const textElements = document.querySelectorAll('.footer_text-1 > *');
  const splitPrice = new SplitType('.footer_price', { types: 'chars' });
  const mortgageText = new SplitType('[mortgage-total]', { types: 'chars' });

  const firstChar = splitPrice.chars[0];
  const secondChar = splitPrice.chars[1];
  const numberChars = splitPrice.chars.slice(2, -5);
  const slash = splitPrice.chars[splitPrice.chars.length - 5];
  const yearChars = splitPrice.chars.slice(-4);

  const numberValues = numberChars.map(char => {
    return !isNaN(parseInt(char.textContent)) ? parseInt(char.textContent) : char.textContent;
  });

  const textTl = gsap.timeline()
    .from(textElements, {
      yPercent: 150,
      stagger: 0.02,
      duration: 1,
      ease: 'power4.out'
    });

  const priceTl = gsap.timeline()
    .from(firstChar, {
      scale: 0,
      yPercent: 100,
      rotation: 45,
      duration: 0.4
    })
    .from(secondChar, {
      yPercent: 150,
      duration: 0.4
    }, "<20%")
    .from(numberChars, {
      opacity: 0,
      yPercent: 150,
      duration: 0.3
    }, "<30%")
    .add(() => {
      const st = ScrollTrigger.getAll()[0];
      if (st.direction === -1) {
        const counterTl = gsap.timeline();
        numberChars.forEach((char, index) => {
          if (!isNaN(numberValues[index])) {
            counterTl.from(char, {
              textContent: 0,
              duration: 1,
              snap: { textContent: 1 },
              onComplete: () => char.textContent = numberValues[index]
            }, 0);
          }
        });
        return counterTl;
      }
    }, "<")
    .from(slash, {
      clipPath: 'inset(0 100% 0 0)',
      yPercent: 150,
      duration: 0.4
    }, '<20%')
    .from(yearChars, {
      yPercent: 120,
      stagger: 0.001,
      ease: 'back.out',
      duration: 0.4
    }, '<20%')
    .fromTo(mortgageText.chars, {
        opacity: 0
      }, {
        opacity: 1,
        duration: 0.3,
        stagger: {
          each: 0.01,
          from: 'start'
        },
        ease: 'power3'
      },
      '<0.5')
    .to({}, { duration: 0.75 })
    .to('.footer_wrap1', {
      yPercent: 100,
      y: '7em',
      duration: 1,
      ease: 'none'
    })
    .fromTo('.footer_text2',
    {
      yPercent: -200,
      opacity: 0
    },
    {
      yPercent: isMobile ? -100 : 30,
      opacity: 1,
      duration: 1,
      ease: 'none'
    }, '<')
    .set('.footer_cta-wrap > .footer_wrap-overlay', { opacity: 0 }, '<')
    .to('.footer_cta-wrap', {
      transformOrigin: 'left center',
      scale: 0.75,
      y: isMobile ? '-24em' : '-12em',
      duration: 1,
      ease: 'none'
    }, '<')
    .to('.footer_receipt-wrap', {
      transformOrigin: 'center top',
      scale: isMobile ? 1 : 0.6,
      yPercent: isMobile ? -100 : 0,
      opacity: isMobile ? 0 : 1,
      duration: 1,
      ease: 'power4.out'
    }, '<')
    .from('.footer_avatar', {
      opacity: 0,
      yPercent: 100,
      scale: 0.5,
      transformOrigin: 'center bottom',
      duration: 1,
      ease: 'slow'
    }, '<')
    .fromTo('.footer_img', {
      clipPath: 'circle(0% at 0 100%)',
    }, {
      clipPath: 'circle(150% at 0 100%)',
      duration: 4,
      ease: 'power4.out',
    }, '<30%')
    .fromTo('.footer_sources-wrap', {
      opacity: 0,
      yPercent: isMobile ? 0 : 100,
    }, {
      opacity: 1,
      yPercent: isMobile ? -200 : 0,
      duration: 2,
      ease: 'power4'
    }, '<30%')
    .from('.footer_cta', {
      yPercent: 100,
      y: '8em',
      duration: 1,
      ease: 'power4.out'
    }, 0)

  const receiptTl = gsap.timeline()

  receiptTl
    .from('.footer_receipt-wrap', {
      opacity: 0,
      duration: 0.2,
      ease: 'power3',
      onStart: () => {
        if (receiptAudio instanceof Audio) {
          receiptAudio.play()
        }
      }
    })
    .from('.footer_receipt-wrap', {
      clipPath: 'inset(0% 0% calc(100% - 5.5em) 0%)',
      duration: 2,
      ease: 'none'
    }, '<')
    .from('.footer_receipt-cost', {
      yPercent: -100,
      y: '4em',
      duration: 2,
      ease: 'none'
    }, '<')

  const arrowTimeline = gsap.timeline({ paused: true });

  const masterTl = gsap.timeline({ paused: true })
    // .add(receiptTl)
    .add(textTl, '<60%')
    .add(priceTl, '-=0.8')
    .call(() => {
      gsap.killTweensOf('.main-arrow');
      arrowTimeline
        .to('.main-arrow', {
          yPercent: -50,
          opacity: 0,
          duration: 0.5,
          ease: 'back.in',
        })
        .set('.main-arrow', { yPercent: 50 })
        .to('.main-arrow', {
          yPercent: 0,
          opacity: 1,
          duration: 0.5,
          ease: 'back.out'
        })
        .play();
    }, null, 1);

  ScrollTrigger.create({
    trigger: section,
    pin: true,
    pinSpacing: isMobile ? false : false,
    start: 'top top',
    end: '+=200%',
    scrub: 1,
    onUpdate: self => {
      masterTl.progress(isMobile ? self.progress : 1 - self.progress);
    }
  });
}

// Scrollbar Animation
function initScrollbar() {
  const scrollThumb = document.querySelector('.scrollbar-thumb');
  gsap.set(scrollThumb, {
    opacity: 0,
    bottom: '0%'
  });

  ScrollTrigger.create({
    trigger: 'body',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate: self => {
      gsap.to(scrollThumb, {
        bottom: `${self.progress * (100 - 4)}%`,
        opacity: 1,
        duration: 0.1
      });
    }
  });

  ScrollTrigger.addEventListener('scrollEnd', () => {
    gsap.to(scrollThumb, {
      opacity: 0,
      duration: 0.3
    });
  });
}

// SVG Overlay Creation
function createSVGOverlays() {
  const sections = document.querySelectorAll('[section-items]');

  sections.forEach(section => {
    const itemsWrap = section.querySelector('.items_wrap');
    if (!itemsWrap) return;

    const bounds = itemsWrap.getBoundingClientRect();
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');

    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    svg.setAttribute('fill', 'none');
    svg.style.position = 'absolute';
    svg.style.zIndex = '3';
    svg.style.top = '0';
    svg.style.left = '0';
    svg.style.pointerEvents = 'none';

    rect.setAttribute('x', '1.5');
    rect.setAttribute('y', '1.5');
    rect.setAttribute('width', bounds.width - 3);
    rect.setAttribute('height', bounds.height - 3);
    rect.setAttribute('rx', '8.5');
    rect.setAttribute('stroke', 'white');
    rect.setAttribute('stroke-width', '3');
    rect.setAttribute('stroke-dasharray', '16 16');

    svg.appendChild(rect);
    itemsWrap.style.position = 'relative';
    itemsWrap.appendChild(svg);
  });
}

function addAnimatedBorder(selector) {
  const element = document.querySelector(selector);
  if (!element) return;

  // Remove existing SVG if present
  const existingSvg = element.querySelector('svg');
  if (existingSvg) {
    existingSvg.remove();
  }

  const computedStyle = window.getComputedStyle(element);
  const color = computedStyle.color;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  Object.assign(svg.style, {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    pointerEvents: 'none'
  });

  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  const rectAttrs = {
    x: '2',
    y: '2',
    width: 'calc(100% - 4px)',
    height: 'calc(100% - 4px)',
    fill: 'none',
    stroke: color,
    'stroke-width': '3',
    'stroke-dasharray': '10 5',
    rx: '7',
    ry: '7'
  };

  Object.entries(rectAttrs).forEach(([attr, value]) => {
    rect.setAttribute(attr, value);
  });

  svg.appendChild(rect);
  element.style.position = 'relative';
  element.appendChild(svg);

  let animation = gsap.to(rect, {
    strokeDashoffset: -15,
    repeat: -1,
    duration: 1,
    ease: 'none',
    paused: true
  });

  element.addEventListener('mouseenter', () => animation.play());
  element.addEventListener('mouseleave', () => {
    animation.pause();
  });

  return animation; // Return animation for cleanup if needed
}

// Initial call
let borderAnimation = addAnimatedBorder('.preloader_cta');

// Redraw on resize
window.addEventListener('resize', () => {
  if (borderAnimation) {
    borderAnimation.kill();
  }
  borderAnimation = addAnimatedBorder('.preloader_cta');
});

const shareButtons = document.querySelectorAll('.share_button');

shareButtons.forEach(button => {
  const buttonBg = button.querySelector('.share_button-bg');

  button.addEventListener('mouseenter', () => {
    gsap.killTweensOf('.share_button-bg');

    gsap.to(buttonBg, {
      rotation: 360,
      repeat: -1,
      duration: 10,
      ease: 'none'
    });
  });

  button.addEventListener('mouseleave', () => {
    gsap.killTweensOf(buttonBg)
    gsap.to(buttonBg, {
      rotation: 0,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => this.killTweensOf
    });
  });
});

document.querySelector('.hero_swipe-up').addEventListener('click', () => {
  if (isMobile) {
    document.querySelector('#inflation-img1').scrollIntoView({ behavior: 'smooth' })
  } else {
    lenis.scrollTo('#inflation-img1', { duration: 1 })
  }
})

gsap.to('.hero_swipe-up', {
  yPercent: 20,
  duration: 1,
  ease: 'none',
  yoyo: true,
  repeat: -1,
})
const sharePopup = {
  init() {
    this.popup = document.querySelector('.share_component')
    this.closeButtons = document.querySelectorAll('[share-close]')
    this.shareButtons = document.querySelectorAll('.share_button')
    this.triggerBtns = document.querySelectorAll('[share-cta]')

    this.currentUrl = window.location.href

    this.triggerBtns.forEach(btn => {
      btn.addEventListener('click', () => this.openPopup())
    })

    this.tl = this.createAnimation()
    this.bindEvents()
  },

  createAnimation() {
    return gsap.timeline({ paused: true })
      .set(".share_component", { display: 'flex' })
      .from(".share_component", { opacity: 0, duration: 0.2 })
      .from(".share_cost", {
        scale: 0,
        opacity: 0,
        yPercent: 20,
        duration: 0.5,
        ease: 'power4.out'
      }, '<')
      .to(".share_cost", {
        yPercent: 0,
        duration: 0.2,
        ease: 'power4.out'
      }, "-=0.2")
      .from('.share_button', {
        opacity: 0,
        y: "-2em",
        duration: 0.5,
        stagger: 0.1,
        ease: 'back.out'
      }, 0.5)
      .from(".share_close", {
        xPercent: -100,
        opacity: 0,
        scale: 0,
        duration: 1,
        ease: 'back.out'
      }, '-=0.3')
  },

  bindEvents() {
    this.closeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.tl.timeScale(1.5).reverse()
        isMobile ? document.body.style.overflow = 'auto' : lenis.start()
      })
    })
    this.shareButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleShare(e.currentTarget.dataset.platform))
    })
  },

  openPopup() {
    isMobile ? document.body.style.overflow = 'hidden' : lenis.stop()
    this.tl.play()
  },

  handleShare(platform) {
    const shareText = "In Albo's Australia, what's the price of your future?"
    const encodedText = encodeURIComponent(shareText)
    const encodedUrl = encodeURIComponent(this.currentUrl)
    const shareImage =
      "https://cdn.prod.website-files.com/679fe2b2abc45b4c90c9c3f3/67a5a67722dae2755b165d9d_share_cost.png"
    const encodedImage = encodeURIComponent(shareImage)

    switch (platform) {
    case 'facebook':
      window.open(
        `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`,
        '_blank')
      break

    case 'twitter':
      window.open(
        `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}&image=${encodedImage}`,
        '_blank')

      break

    case 'copy':
      navigator.clipboard.writeText(this.currentUrl)
      break

    case 'email':
      window.location.href = `mailto:?subject=${encodedText}&body=${shareText}%0A%0A${encodedUrl}`
      break
    }
  }
}

sharePopup.init()

function videoPlay() {
  const watchCta = document.querySelector('.watch-cta');
  const videoPopup = document.querySelector('.video_popup');
  const scrollEl = document.querySelector('.scroll');
  const videoWrap = document.querySelector('.video_wrap');
  const ctaText = watchCta.querySelector('p');
  const yellowIcon = watchCta.querySelector('.yellow-icon');
  const playIcon = watchCta.querySelector('.play-icon-s');
  const closeIcon = watchCta.querySelector('.close-icon-s');
  const shareCta = document.querySelector('.share-cta');
  // const video = videoWrap.querySelector('video');

  let isOpen = false;
  const tl = gsap.timeline({ paused: true });

  tl.set(videoPopup, { display: 'block' })
    .from(videoPopup, {
      autoAlpha: 0,
      duration: 0.6,
      ease: 'power2.inOut'
    })
    .from(videoWrap, {
      scale: 0.5,
      opacity: 0,
      duration: 0.5,
      ease: 'power2.out'
    }, '<50%')
    .to(ctaText, {
      opacity: 0,
      duration: 0.3
    }, '<')
    .to(watchCta, {
      // x: () => -(watchCta.offsetWidth / 2 - yellowIcon.offsetWidth / 2),
      width: '2.5em',
      duration: 0.5,
      ease: 'power2.inOut'
    }, '<')
    .to(playIcon, {
      opacity: 0,
      duration: 0.3
    }, '<')
    .to(closeIcon, {
      opacity: 1,
      duration: 0.3
    }, '>-0.1')
    .to(shareCta, {
      autoAlpha: 0,
      duration: 0.5,
      ease: 'power3'
    }, '<')

  const reverseTimeline = gsap.timeline({ paused: true });
  reverseTimeline.timeScale(1.5);

  watchCta.addEventListener('click', () => {
    if (!isOpen) {
      tl.play().then(() => {
        // video.play();
        isMobile ? document.body.style.overflow = 'hidden' : lenis.stop()
      });
      isOpen = true;
    } else {
      // video.pause();
      tl.reverse();
      isMobile ? document.body.style.overflow = 'auto' : lenis.start()
      isOpen = false;
    }
  });
}
videoPlay()
