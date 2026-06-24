/* =========================================================
   TEDxMET Nashik — Speaker Nominations
   JavaScript
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ——————————————————————————————
  // 0. SUPABASE CLIENT
  // ——————————————————————————————

  const SUPABASE_URL  = 'https://hubxctffnforizfayfzv.supabase.co';
  const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1YnhjdGZmbmZvcml6ZmF5Znp2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIzMTY1MzksImV4cCI6MjA5Nzg5MjUzOX0.qn7eHCjefFw9tDydCA8Xpn88_YR84WsetU04DItAKXU';

  const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

  /**
   * Insert a nomination row into the Supabase `nominations` table.
   * Returns { data, error } — caller handles the error.
   */
  async function saveToSupabase(formData) {
    const { data, error } = await supabase
      .from('nominations')
      .insert([{
        first_name:   formData.first_name,
        last_name:    formData.last_name,
        email:        formData.email,
        phone:        formData.phone,
        speaker_name: formData.speaker_name,
        core_idea:    formData.core_idea,
        why_speaker:  formData.why_speaker,
        file_names:   formData.file_names || null
      }]);

    return { data, error };
  }

  // ——————————————————————————————
  // 1. SCROLL-REVEAL ANIMATIONS
  // ——————————————————————————————

  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));


  // ——————————————————————————————
  // 2. STAT COUNTER ANIMATION
  // ——————————————————————————————

  const statNumbers = document.querySelectorAll('.stat-number');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const finalValue = el.getAttribute('data-value');

        // Only animate numeric values
        if (finalValue && !isNaN(finalValue)) {
          animateCounter(el, 0, parseInt(finalValue), 1200);
        }
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

  function animateCounter(el, start, end, duration) {
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);

      el.textContent = String(current).padStart(2, '0');

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }


  // ——————————————————————————————
  // 3. FORM VALIDATION & SUBMISSION
  // ——————————————————————————————

  const form = document.getElementById('nomination-form');
  const submitBtn = document.getElementById('submit-btn');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      // Clear previous errors
      form.querySelectorAll('.field.error').forEach(f => f.classList.remove('error'));

      // Validate fields
      let isValid = true;

      const firstName = document.getElementById('first-name');
      const lastName = document.getElementById('last-name');
      const email = document.getElementById('email');
      const phone = document.getElementById('phone');
      const speakerName = document.getElementById('speaker-name');
      const coreIdea = document.getElementById('core-idea');
      const whySpeaker = document.getElementById('why-speaker');

      // Required check
      const requiredFields = [
        { el: firstName, msg: 'First name is required' },
        { el: lastName, msg: 'Last name is required' },
        { el: email, msg: 'Email address is required' },
        { el: phone, msg: 'Phone number is required' },
        { el: speakerName, msg: 'Speaker name is required' },
        { el: coreIdea, msg: 'Core idea is required' },
        { el: whySpeaker, msg: 'This field is required' }
      ];

      requiredFields.forEach(({ el, msg }) => {
        if (!el.value.trim()) {
          markError(el, msg);
          isValid = false;
        }
      });

      // Email format
      if (email.value.trim() && !isValidEmail(email.value.trim())) {
        markError(email, 'Please enter a valid email');
        isValid = false;
      }

      // Phone format (simple: at least 10 digits)
      if (phone.value.trim() && !isValidPhone(phone.value.trim())) {
        markError(phone, 'Please enter a valid phone number');
        isValid = false;
      }

      if (!isValid) {
        // Scroll to first error
        const firstError = form.querySelector('.field.error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // ——— EmailJS Configuration ———
      const EMAILJS_PUBLIC_KEY   = 'ONjViRAkMpCeXS4_U';
      const EMAILJS_SERVICE_ID   = 'service_xb39y8x';
      const EMAILJS_TEMPLATE_ADMIN = 'template_5sovydg';
      const EMAILJS_TEMPLATE_USER  = 'template_om2uizy';

      // Show loading state
      submitBtn.classList.add('loading');
      submitBtn.textContent = 'Submitting';

      // Shared form data
      const fileNamesStr = typeof selectedFiles !== 'undefined' && selectedFiles.length > 0
        ? selectedFiles.map(f => f.name).join(', ')
        : null;

      const formData = {
        first_name:   firstName.value.trim(),
        last_name:    lastName.value.trim(),
        email:        email.value.trim(),
        phone:        phone.value.trim(),
        speaker_name: speakerName.value.trim(),
        core_idea:    coreIdea.value.trim(),
        why_speaker:  whySpeaker.value.trim(),
        file_names:   fileNamesStr
      };

      try {
        // ——— Step 1: Save to Supabase (primary data store) ———
        const { data: sbData, error: sbError } = await saveToSupabase(formData);

        if (sbError) {
          console.error('❌ Supabase Error:', sbError);
          showToast(
            'error',
            'Submission Failed',
            'Could not save your nomination. Please check your connection and try again.'
          );
          return; // Don't proceed to emails if DB save failed
        }

        console.log('✅ Nomination saved to Supabase:', sbData);

        // ——— Step 2: Send EmailJS notifications (best-effort) ———
        const templateParams = {
          ...formData,
          speaker_doc_name: fileNamesStr || 'No files uploaded'
        };

        const userTemplateParams = {
          ...templateParams,
          to_email: formData.email,
          reply_to: formData.email,
          to_name:  formData.first_name + ' ' + formData.last_name
        };

        try {
          emailjs.init(EMAILJS_PUBLIC_KEY);

          // Admin notification
          await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ADMIN, templateParams);
          console.log('✅ Admin email sent successfully');

          // User confirmation
          try {
            await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_USER, userTemplateParams);
            console.log('✅ User confirmation email sent successfully');
          } catch (userErr) {
            console.error('⚠️ User email failed (nomination still saved):', userErr);
          }
        } catch (emailErr) {
          console.error('⚠️ EmailJS Error (nomination still saved):', emailErr);
          // Don't block success — data is already safely in Supabase
        }

        showToast(
          'success',
          'Nomination Submitted!',
          'Thank you! Your nomination has been recorded. A confirmation email has been sent to ' + formData.email + '.'
        );
        form.reset();
        clearFile();

      } catch (err) {
        console.error('❌ Unexpected Error:', err);
        showToast(
          'error',
          'Submission Failed',
          'Something went wrong. Please try again.'
        );
      } finally {
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Submit Nomination';
      }
    });
  }

  function markError(inputEl, message) {
    const field = inputEl.closest('.field');
    field.classList.add('error');
    const errMsg = field.querySelector('.error-msg');
    if (errMsg) errMsg.textContent = message;
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    // Strip common formatting chars, then check for 10+ digits
    const digits = phone.replace(/[\s\-\(\)\+]/g, '');
    return /^\d{10,15}$/.test(digits);
  }

  // Real-time: clear error on input
  document.querySelectorAll('.field input, .field textarea').forEach(input => {
    input.addEventListener('input', () => {
      input.closest('.field').classList.remove('error');
    });
  });


  // ——————————————————————————————
  // 4. FILE UPLOAD FIELD
  // ——————————————————————————————

  const fileInput  = document.getElementById('speaker-doc');
  const fileWrap   = document.getElementById('file-upload-wrap');
  const fileListEl = document.getElementById('file-list');

  // We make selectedFiles global to the form so templateParams can access it
  window.selectedFiles = [];

  const ALLOWED_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg', 'image/png',
    'video/mp4', 'video/quicktime'
  ];
  const MAX_BYTES = 100 * 1024 * 1024; // 100 MB

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }

  function renderFileList() {
    fileListEl.innerHTML = '';
    
    window.selectedFiles.forEach((file, index) => {
      const row = document.createElement('div');
      row.className = 'file-selected visible';
      row.innerHTML = `
        <span class="file-icon">📎</span>
        <span class="file-name">${file.name}</span>
        <span class="file-size">${formatBytes(file.size)}</span>
        <button type="button" class="file-remove" data-index="${index}" title="Remove file">✕</button>
      `;
      fileListEl.appendChild(row);
    });

    // Reset input value so same files can be selected again
    fileInput.value = '';
  }

  function applyFiles(files) {
    const field = fileInput.closest('.field');
    let hasError = false;

    Array.from(files).forEach(file => {
      if (!ALLOWED_TYPES.includes(file.type) || file.size > MAX_BYTES) {
        hasError = true;
      } else {
        // Prevent exact duplicates
        if (!window.selectedFiles.find(f => f.name === file.name && f.size === file.size)) {
          window.selectedFiles.push(file);
        }
      }
    });

    if (hasError && window.selectedFiles.length === 0) {
      field.classList.add('error');
    } else {
      if (hasError) {
        showToast('error', 'Some files rejected', 'Files must be under 100MB and of allowed types.');
      }
      field.classList.remove('error');
    }
    
    renderFileList();
  }

  // To be called when form is reset
  window.clearFile = function() {
    window.selectedFiles = [];
    renderFileList();
    if (fileInput) fileInput.closest('.field').classList.remove('error');
  };

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length) applyFiles(fileInput.files);
    });

    fileWrap.addEventListener('dragover', (e) => {
      e.preventDefault();
      fileWrap.classList.add('dragover');
    });

    fileWrap.addEventListener('dragleave', () => {
      fileWrap.classList.remove('dragover');
    });

    fileWrap.addEventListener('drop', (e) => {
      e.preventDefault();
      fileWrap.classList.remove('dragover');
      if (e.dataTransfer.files.length) applyFiles(e.dataTransfer.files);
    });

    // Delegate remove button clicks
    fileListEl.addEventListener('click', (e) => {
      if (e.target.classList.contains('file-remove')) {
        e.stopPropagation();
        const index = parseInt(e.target.getAttribute('data-index'), 10);
        window.selectedFiles.splice(index, 1);
        renderFileList();
      }
    });
  }



  function showToast(type, title, message) {
    // Remove any existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : '✕'}</span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
    `;
    document.body.appendChild(toast);

    // Trigger animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });
    });

    // Auto-dismiss after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 500);
    }, 5000);
  }


  // ——————————————————————————————
  // 5. SMOOTH NAV ACTIVE STATE
  // ——————————————————————————————

  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color =
            link.getAttribute('href') === `#${entry.target.id}`
              ? 'var(--red)' : '';
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => navObserver.observe(s));

});
