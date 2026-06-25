/* =========================================================
   TEDxMET Nashik — Speaker Nominations
   JavaScript
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // ——————————————————————————————
  // 0. SUPABASE CLIENT
  // ——————————————————————————————

  const SUPABASE_URL  = window.CONFIG.SUPABASE_URL;
  const SUPABASE_ANON = window.CONFIG.SUPABASE_ANON;

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
        file_names:   formData.file_names || null,
        file_urls:    formData.file_urls || null
      }]);

    return { data, error };
  }

  /**
   * Upload files to Supabase Storage bucket 'nominations'.
   * Each submission gets a unique folder: submissions/<userName>_<timestamp>_<random>/
   * Returns an array of storage paths on success, or an empty array on failure.
   */
  async function uploadFilesToSupabase(files, formData, onProgress) {
    // Generate a unique folder name for this submission
    const safeUserName = `${formData.first_name}_${formData.last_name}`.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomId  = Math.random().toString(36).substring(2, 8);
    const folder    = `submissions/${safeUserName}_${timestamp}_${randomId}`;

    const uploadedPaths = [];
    const total = files.length;
    let completed = 0;

    for (const file of files) {
      if (onProgress) onProgress(completed, total);

      // Sanitize filename: replace spaces with underscores
      const safeName = file.name.replace(/\s+/g, '_');
      const filePath = `${folder}/${safeName}`;

      const { data, error } = await supabase.storage
        .from('nominations')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error(`❌ Upload failed for ${file.name}:`, error);
        // Continue uploading remaining files even if one fails
      } else {
        console.log(`✅ Uploaded: ${data.path}`);
        uploadedPaths.push(data.path);
      }
      
      completed++;
      if (onProgress) onProgress(completed, total);
    }

    return uploadedPaths;
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
      const EMAILJS_PUBLIC_KEY   = window.CONFIG.EMAILJS_PUBLIC_KEY;
      const EMAILJS_SERVICE_ID   = window.CONFIG.EMAILJS_SERVICE_ID;
      const EMAILJS_TEMPLATE_ADMIN = window.CONFIG.EMAILJS_TEMPLATE_ADMIN;
      const EMAILJS_TEMPLATE_USER  = window.CONFIG.EMAILJS_TEMPLATE_USER;

      // Show loading state
      submitBtn.classList.add('loading');
      submitBtn.textContent = 'Submitting';

      // Shared form data
      const hasFiles = typeof selectedFiles !== 'undefined' && selectedFiles.length > 0;
      const fileNamesStr = hasFiles
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
        file_names:   fileNamesStr,
        file_urls:    null
      };

      try {
        // ——— Step 1: Upload files to Supabase Storage (if any) ———
        if (hasFiles) {
          const totalFiles = selectedFiles.length;
          submitBtn.textContent = `Uploading 1 of ${totalFiles} files…`;
          const progressWrap = document.getElementById('upload-progress-wrap');
          const progressBar = document.getElementById('upload-progress-bar');
          
          if (progressWrap) progressWrap.classList.add('show');
          if (progressBar) progressBar.style.width = '0%';

          const uploadedPaths = await uploadFilesToSupabase(selectedFiles, formData, (completed, total) => {
            if (completed < total) {
              submitBtn.textContent = `Uploading ${completed + 1} of ${total} files…`;
            } else {
              submitBtn.textContent = 'Finishing upload…';
            }
            if (progressBar) progressBar.style.width = `${(completed / total) * 100}%`;
          });
          
          if (progressWrap) progressWrap.classList.remove('show');

          if (uploadedPaths.length > 0) {
            formData.file_urls = uploadedPaths.join(', ');
            console.log('✅ Files uploaded:', uploadedPaths);
          } else {
            console.warn('⚠️ No files were uploaded successfully (nomination will still save)');
          }
        }

        // ——— Step 2: Save nomination to Supabase DB ———
        submitBtn.textContent = 'Saving…';
        const { data: sbData, error: sbError } = await saveToSupabase(formData);

        if (sbError) {
          console.error('❌ Supabase Error:', sbError);
          showToast(
            'error',
            'Submission Failed',
            'Could not save your nomination. Please check your connection and try again.'
          );
          return;
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
          'Thank you! Your nomination has been recorded. A confirmation email has been sent to ' + formData.email + '. Please check your Spam or Promotions folder if you don\'t see it.'
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
  const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

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
        showToast('error', 'Some files rejected', 'Files must be under 50MB and of allowed types.');
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

  // ——————————————————————————————
  // 6. MOBILE MENU
  // ——————————————————————————————

  const hamburgerBtn = document.getElementById('hamburger-btn');
  const mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
  const mobileMenuClose = document.getElementById('mobile-menu-close');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (hamburgerBtn && mobileMenuOverlay && mobileMenuClose) {
    hamburgerBtn.addEventListener('click', () => {
      mobileMenuOverlay.classList.add('open');
      document.body.style.overflow = 'hidden'; // Prevent scrolling
    });

    mobileMenuClose.addEventListener('click', () => {
      mobileMenuOverlay.classList.remove('open');
      document.body.style.overflow = '';
    });

    mobileNavLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileMenuOverlay.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

});
