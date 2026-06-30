/* =========================================================
   TEDxMET Nashik — Coming Soon
   JavaScript
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ——————————————————————————————
  // 1. SCROLL-REVEAL ANIMATIONS
  // ——————————————————————————————

  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -20px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // ——————————————————————————————
  // 2. INTERACTIVE GLOW (Mouse-Follow)
  // ——————————————————————————————
  // The primary red glow subtly follows the mouse cursor
  // with a damped, eased motion for a living, premium feel.
  // Only activates on devices with a fine pointer (desktop).

  const glow = document.querySelector('.cs-glow');

  if (glow && window.matchMedia('(pointer: fine)').matches) {
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    document.addEventListener('mousemove', (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 80;
      targetY = (e.clientY / window.innerHeight - 0.5) * 80;
    });

    function animateGlow() {
      // Smooth interpolation (damping factor 0.04)
      currentX += (targetX - currentX) * 0.04;
      currentY += (targetY - currentY) * 0.04;
      glow.style.transform =
        `translate(calc(-50% + ${currentX}px), calc(-50% + ${currentY}px))`;
      requestAnimationFrame(animateGlow);
    }

    animateGlow();
  }

});
