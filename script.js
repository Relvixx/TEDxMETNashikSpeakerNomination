/* ============================================================
   TEDxMET Nashik — Dimensions WebGL & UI Script Engine
   Clean Swiss Dark Environment | Pure Three.js Canvas
   ============================================================ */

(function initWebGL() {
  const canvas = document.getElementById('webgl-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Three.js Core Setup */
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  const maxPixelRatio = window.innerWidth < 768 ? 1.5 : 2;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, maxPixelRatio));

  let W = window.innerWidth;
  let H = window.innerHeight;
  renderer.setSize(W, H);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x080808, 0.035);

  const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
  camera.position.set(0, 0, 10);

  /* Lighting Setup */
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xE62B1E, 2, 50);
  pointLight.position.set(5, 5, 5);
  scene.add(pointLight);

  /* Mesh 1: Hero Icosahedron Wireframe */
  const heroGeo = new THREE.IcosahedronGeometry(2.4, 2);
  const heroMat = new THREE.MeshBasicMaterial({
    color: 0xE62B1E,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  const heroMesh = new THREE.Mesh(heroGeo, heroMat);
  heroMesh.position.set(1.8, 0.5, 0);
  scene.add(heroMesh);

  /* Inner Geometric Core */
  const innerGeo = new THREE.OctahedronGeometry(1.2, 0);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0xFFFFFF,
    wireframe: true,
    transparent: true,
    opacity: 0.6
  });
  const innerMesh = new THREE.Mesh(innerGeo, innerMat);
  heroMesh.add(innerMesh);

  /* Mesh 2: Theme Point Cloud Globe */
  const globeGeo = new THREE.BufferGeometry();
  const particleCount = 1200;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorRed = new THREE.Color(0xE62B1E);
  const colorWhite = new THREE.Color(0xFFFFFF);

  for (let i = 0; i < particleCount; i++) {
    const u = Math.random();
    const v = Math.random();
    const theta = u * 2.0 * Math.PI;
    const phi = Math.acos(2.0 * v - 1.0);
    const r = 2.2;

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const mixColor = Math.random() > 0.4 ? colorRed : colorWhite;
    colors[i * 3] = mixColor.r;
    colors[i * 3 + 1] = mixColor.g;
    colors[i * 3 + 2] = mixColor.b;
  }

  globeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  globeGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const globeMat = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    transparent: true,
    opacity: 0.9
  });
  const globeParticles = new THREE.Points(globeGeo, globeMat);
  globeParticles.position.set(-1.8, -12, -2);
  scene.add(globeParticles);

  /* Mesh 3: Floor Wireframe Grid */
  const gridHelper = new THREE.GridHelper(60, 40, 0xE62B1E, 0x222222);
  gridHelper.position.set(0, -4, 0);
  scene.add(gridHelper);

  /* Mesh 4: CAD Cube Grid at Venue Section */
  const cubeGroup = new THREE.Group();
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        const cGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
        const cMat = new THREE.MeshBasicMaterial({
          color: (x === 0 && y === 0 && z === 0) ? 0xE62B1E : 0x444444,
          wireframe: true
        });
        const cMesh = new THREE.Mesh(cGeo, cMat);
        cMesh.position.set(x * 0.9, y * 0.9, z * 0.9);
        cubeGroup.add(cMesh);
      }
    }
  }
  cubeGroup.position.set(2, -18.5, -1);
  scene.add(cubeGroup);

  /* Resize Responsiveness */
  window.addEventListener('resize', () => {
    W = window.innerWidth;
    H = window.innerHeight;
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    renderer.setSize(W, H);

    if (W < 768) {
      heroMesh.position.set(0, 1.2, -1);
      globeParticles.position.set(0, -12, -2);
      cubeGroup.position.set(0, -18.5, -1);
    } else {
      heroMesh.position.set(1.8, 0.5, 0);
      globeParticles.position.set(-1.8, -12, -2);
      cubeGroup.position.set(2, -18.5, -1);
    }
  });

  if (W < 768) {
    heroMesh.position.set(0, 1.2, -1);
    globeParticles.position.set(0, -12, -2);
    cubeGroup.position.set(0, -18.5, -1);
  }

  /* Mouse & Touch Parallax */
  let mouseX = 0, mouseY = 0;
  let targetMouseX = 0, targetMouseY = 0;

  window.addEventListener('mousemove', (e) => {
    targetMouseX = (e.clientX / W) * 2 - 1;
    targetMouseY = -(e.clientY / H) * 2 + 1;
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      targetMouseX = (e.touches[0].clientX / W) * 2 - 1;
      targetMouseY = -(e.touches[0].clientY / H) * 2 + 1;
    }
  }, { passive: true });

  /* Scroll Progress */
  let scrollProgress = 0;
  let maxScroll = document.documentElement.scrollHeight - H;
  const camCoordsEl = document.getElementById('cam-coords');
  const scrollPctEl = document.getElementById('scroll-pct');

  function updateMaxScroll() {
    maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  }
  
  // Cache maxScroll instead of forcing layout on every scroll event
  window.addEventListener('resize', updateMaxScroll, { passive: true });
  window.addEventListener('load', updateMaxScroll, { passive: true });

  window.addEventListener('scroll', () => {
    scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }, { passive: true });

  /* Render Loop */
  const projLine1 = document.getElementById('proj-line-1');
  const heroTarget = document.getElementById('hero-3d-target');

  function animate() {
    mouseX += (targetMouseX - mouseX) * 0.05;
    mouseY += (targetMouseY - mouseY) * 0.05;

    heroMesh.rotation.x += 0.005;
    heroMesh.rotation.y += 0.008;
    innerMesh.rotation.y -= 0.01;
    globeParticles.rotation.y += 0.003;
    cubeGroup.rotation.y += 0.002;

    const targetCamZ = 10 - scrollProgress * 4;
    const targetCamY = -scrollProgress * 22;
    const targetCamX = Math.sin(scrollProgress * Math.PI * 2) * 2 + mouseX * 0.5;

    camera.position.z += (targetCamZ - camera.position.z) * 0.08;
    camera.position.y += (targetCamY - camera.position.y) * 0.08;
    camera.position.x += (targetCamX - camera.position.x) * 0.08;
    camera.rotation.y = -mouseX * 0.05;

    if (camCoordsEl) {
      camCoordsEl.textContent = `CAM // X: ${camera.position.x.toFixed(2)} | Y: ${camera.position.y.toFixed(2)} | Z: ${camera.position.z.toFixed(2)}`;
    }

    if (scrollPctEl) {
      const pct = Math.min(100, Math.floor(scrollProgress * 100));
      scrollPctEl.textContent = `SCROLL // ${pct.toString().padStart(3, '0')}%`;
    }

    if (projLine1 && heroTarget) {
      const heroMeshVec = new THREE.Vector3();
      heroMesh.getWorldPosition(heroMeshVec);
      heroMeshVec.project(camera);

      const screenX = (heroMeshVec.x * 0.5 + 0.5) * W;
      const screenY = (-heroMeshVec.y * 0.5 + 0.5) * H;

      const rect = heroTarget.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2;
      const targetY = rect.top + rect.height / 2;

      if (Number.isFinite(screenX) && Number.isFinite(screenY) && Number.isFinite(targetX) && Number.isFinite(targetY) && heroMeshVec.z < 1) {
        projLine1.setAttribute('x1', screenX);
        projLine1.setAttribute('y1', screenY);
        projLine1.setAttribute('x2', targetX);
        projLine1.setAttribute('y2', targetY);
      }
    }

    renderer.render(scene, camera);

    if (!reducedMotion) {
      requestAnimationFrame(animate);
    }
  }

  if (!reducedMotion) {
    animate();
  }
})();

/* ============================================================
   SYSTEM 2 — UI CONTROLS & EVENT DELEGATION
   ============================================================ */
(function initUI() {
  // Letter Split Animation
  const letters = document.querySelectorAll('.hero-title .letter');
  if (letters.length && typeof gsap !== 'undefined') {
    gsap.from(letters, {
      y: 40,
      opacity: 0,
      stagger: 0.03,
      duration: 0.8,
      ease: 'power3.out'
    });
  }

  // FAQ Accordion Toggle
  const faqRows = document.querySelectorAll('.faq-row');
  faqRows.forEach(row => {
    const btn = row.querySelector('.faq-btn');
    if (btn) {
      btn.addEventListener('click', () => {
        const isActive = row.classList.contains('active');
        
        // Reset all rows
        faqRows.forEach(r => {
          r.classList.remove('active');
          const rowBtn = r.querySelector('.faq-btn');
          if (rowBtn) rowBtn.setAttribute('aria-expanded', 'false');
        });
        
        if (!isActive) {
          row.classList.add('active');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // Mobile Menu Dropdown — Phase 1 Floating Dropdown Architecture
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    if (!mobileDrawer || mobileDrawer.classList.contains('open')) return;
    mobileDrawer.classList.add('open');
    mobileToggle.classList.add('active');
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileDrawer.setAttribute('aria-hidden', 'false');
  }

  function closeDrawer() {
    if (!mobileDrawer || !mobileDrawer.classList.contains('open')) return;
    mobileDrawer.classList.remove('open');
    mobileToggle.classList.remove('active');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');

    // Restore focus to trigger button
    mobileToggle.focus();
  }

  if (mobileToggle && mobileDrawer) {
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileToggle.setAttribute('aria-controls', 'mobile-drawer');

    mobileToggle.addEventListener('click', () => {
      mobileDrawer.classList.contains('open') ? closeDrawer() : openDrawer();
    });

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (mobileDrawer.classList.contains('open') &&
          !mobileDrawer.contains(e.target) &&
          !mobileToggle.contains(e.target)) {
        closeDrawer();
      }
    });

    // Close on viewport resize past mobile breakpoint
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768 && mobileDrawer.classList.contains('open')) {
        closeDrawer();
      }
    });

    // Dropdown link click — close and smooth-scroll to anchor
    drawerLinks.forEach(link => {
      link.addEventListener('click', () => {
        const href = link.getAttribute('href');
        closeDrawer();
        if (href && href.startsWith('#')) {
          const target = document.querySelector(href);
          if (target) {
            setTimeout(() => {
              const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 70;
              const top = target.getBoundingClientRect().top + window.scrollY - navH;
              window.scrollTo({ top, behavior: 'smooth' });
            }, 100);
          }
        }
      });
    });
  }

  // Dimension Rows Interactive Highlight
  const dimRows = document.querySelectorAll('.dim-row');
  dimRows.forEach(row => {
    row.addEventListener('click', () => {
      dimRows.forEach(r => r.classList.remove('active'));
      row.classList.add('active');
    });
  });

  // Global Booking Modal Event Delegation
  const bookingModal = document.getElementById('booking-modal');
  const modalCloseBtn = document.getElementById('modal-close');
  const modalOkBtn = document.getElementById('modal-ok-btn');
  let modalLastFocused = null;

  function trapBookingModalFocus(e) {
    if (e.key === 'Escape') {
      closeBookingModal();
      return;
    }
    
    if (e.key !== 'Tab') return;

    const focusable = bookingModal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }

  function openBookingModal() {
    if (bookingModal) {
      modalLastFocused = document.activeElement;
      bookingModal.classList.add('active');
      bookingModal.setAttribute('aria-hidden', 'false');
      
      savedScrollY = window.scrollY;
      document.body.classList.add('nav-open');
      document.body.style.top = `-${savedScrollY}px`;

      document.addEventListener('keydown', trapBookingModalFocus);
      
      setTimeout(() => {
        if (modalCloseBtn) modalCloseBtn.focus();
      }, 50);
    }
  }

  function closeBookingModal() {
    if (bookingModal) {
      bookingModal.classList.remove('active');
      bookingModal.setAttribute('aria-hidden', 'true');
      
      document.body.classList.remove('nav-open');
      document.body.style.top = '';
      window.scrollTo(0, savedScrollY);

      document.removeEventListener('keydown', trapBookingModalFocus);
      
      if (modalLastFocused) {
        modalLastFocused.focus();
        modalLastFocused = null;
      }
    }
  }

  document.addEventListener('click', (e) => {
    const bookBtn = e.target.closest('.js-book-btn');
    if (bookBtn) {
      e.preventDefault();
      e.stopPropagation();
      openBookingModal();
    }
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeBookingModal);
  if (modalOkBtn) modalOkBtn.addEventListener('click', closeBookingModal);
  if (bookingModal) {
    bookingModal.addEventListener('click', (e) => {
      if (e.target === bookingModal) closeBookingModal();
    });
  }
})();
