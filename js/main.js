/**
 * DOMO DE LA SELVA · CABAÑAS DE LA SELVA (DELTA DEL TIGRE)
 * JavaScript Modular - Ruco (ruco.ar)
 * Cero dependencias pesadas, carga instantánea, 100% mobile-first
 */

document.addEventListener('DOMContentLoaded', () => {
  // Teléfono oficial de reservas (Cabañas de la Selva)
  const WHATSAPP_NUMBER = '5491168408623';

  /* -------------------------------------------------------------
     0. Video de Fondo & Control de Audio
  ------------------------------------------------------------- */
  const heroVideo = document.getElementById('hero-video');
  const soundToggle = document.getElementById('hero-sound-toggle');

  if (heroVideo) {
    const updatePlayback = () => {
      // Si está silenciado mantenemos el ritmo calmo; con sonido activo va a velocidad natural
      heroVideo.playbackRate = heroVideo.muted ? 0.65 : 1.0;
    };
    
    updatePlayback();
    heroVideo.addEventListener('loadedmetadata', updatePlayback);

    // Reproducción automática silenciada (política obligatoria de navegadores para permitir autoplay)
    heroVideo.play().catch(() => {
      // En modo ahorro de batería móvil, el póster queda activo
    });

    // Control interactivo de audio (ícono de parlante)
    if (soundToggle) {
      const soundIconOff = soundToggle.querySelector('.sound-icon-off');
      const soundIconOn = soundToggle.querySelector('.sound-icon-on');

      soundToggle.addEventListener('click', () => {
        if (heroVideo.muted) {
          heroVideo.muted = false;
          heroVideo.volume = 1.0;
          heroVideo.playbackRate = 1.0; // Velocidad 100% natural con audio
          soundToggle.classList.add('active');
          soundToggle.setAttribute('aria-label', 'Silenciar audio del video');
          soundToggle.setAttribute('title', 'Silenciar sonido');
          if (soundIconOff) soundIconOff.style.display = 'none';
          if (soundIconOn) soundIconOn.style.display = 'inline';
          heroVideo.play();
        } else {
          heroVideo.muted = true;
          heroVideo.playbackRate = 0.65; // Vuelve a cámara lenta silenciosa
          soundToggle.classList.remove('active');
          soundToggle.setAttribute('aria-label', 'Activar audio del video');
          soundToggle.setAttribute('title', 'Activar sonido');
          if (soundIconOff) soundIconOff.style.display = 'inline';
          if (soundIconOn) soundIconOn.style.display = 'none';
        }
      });
    }
  }

  /* -------------------------------------------------------------
     1. Header Scrolled & Mobile Off-Canvas Drawer
  ------------------------------------------------------------- */
  const header = document.querySelector('.site-header');
  const menuToggle = document.querySelector('.menu-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const mobileDrawerClose = document.querySelector('.mobile-drawer-close');
  const drawerOverlay = document.querySelector('.mobile-drawer-overlay');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
      header?.classList.add('scrolled');
    } else {
      header?.classList.remove('scrolled');
    }
  }, { passive: true });

  const toggleMenu = () => {
    const isActive = mobileDrawer?.classList.toggle('active');
    menuToggle?.classList.toggle('active', isActive);
    menuToggle?.setAttribute('aria-expanded', String(isActive));
    drawerOverlay?.classList.toggle('active', isActive);
    document.body.style.overflow = isActive ? 'hidden' : '';
  };

  const closeMenu = () => {
    menuToggle?.classList.remove('active');
    menuToggle?.setAttribute('aria-expanded', 'false');
    mobileDrawer?.classList.remove('active');
    drawerOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  };

  menuToggle?.addEventListener('click', toggleMenu);
  mobileDrawerClose?.addEventListener('click', closeMenu);
  drawerOverlay?.addEventListener('click', closeMenu);
  mobileLinks.forEach(link => link.addEventListener('click', closeMenu));

  /* -------------------------------------------------------------
     2. Inicialización de Fechas & Buscador de Disponibilidad
  ------------------------------------------------------------- */
  const checkinInput = document.getElementById('booking-checkin');
  const checkoutInput = document.getElementById('booking-checkout');
  const unitSelect = document.getElementById('booking-unit');
  const guestsSelect = document.getElementById('booking-guests');
  const bookingForm = document.getElementById('booking-form');
  const nightsBadge = document.getElementById('booking-nights-badge');

  const today = new Date();
  const nextFriday = new Date(today);
  // Default to next Friday or +2 days
  nextFriday.setDate(today.getDate() + ((5 - today.getDay() + 7) % 7 || 7));
  const nextSunday = new Date(nextFriday);
  nextSunday.setDate(nextFriday.getDate() + 2);

  const formatDateYMD = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const formatDateDM = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    return `${parts[2]}/${parts[1]}`;
  };

  if (checkinInput && checkoutInput) {
    checkinInput.min = formatDateYMD(today);
    checkinInput.value = formatDateYMD(nextFriday);
    checkoutInput.min = formatDateYMD(nextFriday);
    checkoutInput.value = formatDateYMD(nextSunday);

    const updateNights = () => {
      const inDate = new Date(checkinInput.value);
      const outDate = new Date(checkoutInput.value);
      const diffTime = outDate - inDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0 && nightsBadge) {
        nightsBadge.textContent = `${diffDays} ${diffDays === 1 ? 'Noche' : 'Noches'} seleccionadas`;
      }
    };

    checkinInput.addEventListener('change', () => {
      const inDate = new Date(checkinInput.value);
      const minOut = new Date(inDate);
      minOut.setDate(minOut.getDate() + 1);
      checkoutInput.min = formatDateYMD(minOut);

      if (new Date(checkoutInput.value) <= inDate) {
        checkoutInput.value = formatDateYMD(minOut);
      }
      updateNights();
    });

    checkoutInput.addEventListener('change', updateNights);
    updateNights();
  }

  // Enviar consulta por WhatsApp
  bookingForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const rawUnit = unitSelect ? unitSelect.value : 'El Domo de la Selva';
    const unit = rawUnit.replace(/\s*\(.*?\)/, '').trim();
    const checkin = formatDateDM(checkinInput?.value);
    const checkout = formatDateDM(checkoutInput?.value);

    const inDate = new Date(checkinInput.value);
    const outDate = new Date(checkoutInput.value);
    const diffDays = Math.max(1, Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24)));

    const message = `Hola! Quería consultar disponibilidad en Cabañas de la Selva:\n\n` +
      `- Alojamiento: ${unit}\n` +
      `- Fechas: ${checkin} al ${checkout} (${diffDays} ${diffDays === 1 ? 'noche' : 'noches'})\n\n` +
      `¿Tienen lugar y cuál es la tarifa? Gracias!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  });

  /* -------------------------------------------------------------
     3. Tabs de Unidades (El Domo vs La Petaca) & Mini-Galería
  ------------------------------------------------------------- */
  const unitTabBtns = document.querySelectorAll('.unit-tab-btn');
  const unitCards = document.querySelectorAll('.unit-card');

  unitTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetUnit = btn.dataset.unit;

      unitTabBtns.forEach(b => b.classList.remove('active'));
      unitCards.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const activeCard = document.getElementById(`unit-${targetUnit}`);
      if (activeCard) {
        activeCard.classList.add('active');
      }

      // Sincronizar el selector del buscador de arriba
      if (unitSelect) {
        if (targetUnit === 'domo') unitSelect.value = 'El Domo de la Selva';
        if (targetUnit === 'petaca') unitSelect.value = 'Casita La Petaca';
      }
    });
  });

  // Mini-thumbs selector dentro de cada unidad
  const thumbBtns = document.querySelectorAll('.unit-thumb-btn');
  thumbBtns.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const parent = thumb.closest('.unit-card');
      if (!parent) return;

      const mainImg = parent.querySelector('.unit-main-img');
      const newSrc = thumb.dataset.full;

      if (mainImg && newSrc) {
        mainImg.src = newSrc;
        parent.querySelectorAll('.unit-thumb-btn').forEach(t => t.classList.remove('active'));
        thumb.classList.add('active');
      }
    });
  });

  /* -------------------------------------------------------------
     4. FAQ Acordeón Interactivo
  ------------------------------------------------------------- */
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(q => {
    q.addEventListener('click', () => {
      const item = q.closest('.faq-item');
      const isActive = item?.classList.contains('active');

      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));

      if (!isActive && item) {
        item.classList.add('active');
      }
    });
  });

  /* -------------------------------------------------------------
     4b. Logística Fluvial Desplegables Interactivas
  ------------------------------------------------------------- */
  const logisticsHeaders = document.querySelectorAll('.logistics-header');
  logisticsHeaders.forEach(header => {
    const card = header.closest('.logistics-card');
    const toggleAction = () => {
      const isExpanded = card.classList.contains('active');
      card.classList.toggle('active');
      header.setAttribute('aria-expanded', !isExpanded);
      const textSpan = header.querySelector('.logistics-toggle-text');
      if (textSpan) {
        textSpan.textContent = !isExpanded ? 'Ocultar' : 'Ver info';
      }
    };

    header.addEventListener('click', toggleAction);
    header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleAction();
      }
    });
  });

  /* -------------------------------------------------------------
     5. Botón Flotante Discreto de WhatsApp
  ------------------------------------------------------------- */
  const whatsappFloat = document.querySelector('.whatsapp-float-btn');

  if (whatsappFloat) {
    const handleScrollWhatsapp = () => {
      // Aparece y queda fijo cuando el usuario scrollea hacia abajo (> 120px)
      if (window.scrollY > 120) {
        whatsappFloat.classList.add('visible');
      } else {
        whatsappFloat.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', handleScrollWhatsapp, { passive: true });
    handleScrollWhatsapp();
  }

  /* -------------------------------------------------------------
     6. Lightbox Modal para Fotografías
  ------------------------------------------------------------- */
  const lightbox = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxTriggers = document.querySelectorAll('[data-lightbox]');

  lightboxTriggers.forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const src = el.getAttribute('href') || el.dataset.lightbox || el.querySelector('img')?.src;
      if (lightbox && lightboxImg && src) {
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  const closeLightbox = () => {
    lightbox?.classList.remove('active');
    document.body.style.overflow = '';
  };

  lightboxClose?.addEventListener('click', closeLightbox);
  lightbox?.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox?.classList.contains('active')) {
      closeLightbox();
    }
  });
});
