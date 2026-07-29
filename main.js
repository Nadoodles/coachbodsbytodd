// ==========================================================================
// Bods by Todd — Shared behavior: nav, scroll effects, FAQ, contact form
// ==========================================================================

document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initScrollAnimations();
  initFaq();
  initContactForm();
  initGallerySliders();
  initCopyButtons();
});

// ---- Sticky navbar shadow + mobile drawer ----
function initNavbar() {
  var navbar = document.querySelector('.navbar');
  var hamburger = document.querySelector('.hamburger');
  var drawer = document.querySelector('.mobile-drawer');

  if (navbar) {
    var onScroll = function () {
      navbar.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  if (hamburger && drawer) {
    hamburger.addEventListener('click', function () {
      var isOpen = drawer.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.classList.toggle('no-scroll', isOpen);
    });

    drawer.querySelectorAll('.nav-link').forEach(function (link) {
      link.addEventListener('click', function () {
        drawer.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        document.body.classList.remove('no-scroll');
      });
    });
  }
}

// ---- Fade-up / stagger scroll animations ----
function initScrollAnimations() {
  var targets = document.querySelectorAll('.fade-up, .stagger');
  if (!targets.length) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach(function (el) { el.classList.add('is-visible'); });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(function (el) { observer.observe(el); });
}

// ---- FAQ accordion ----
function initFaq() {
  var items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(function (item) {
    var question = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('is-open');

      items.forEach(function (other) {
        other.classList.remove('is-open');
        var otherAnswer = other.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('is-open');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// ---- Gallery slider (arrow navigation) ----
function initGallerySliders() {
  document.querySelectorAll('.gallery-slider').forEach(function (slider) {
    var track = slider.querySelector('.gallery-track');
    var slides = slider.querySelectorAll('.gallery-slide');
    var prevBtn = slider.querySelector('[data-gallery-prev]');
    var nextBtn = slider.querySelector('[data-gallery-next]');
    var dotsContainer = slider.querySelector('[data-gallery-dots]');
    if (!track || !slides.length) return;

    var index = 0;

    var dots = slides.length > 1 ? Array.from(slides).map(function (_, i) {
      var dot = document.createElement('button');
      dot.className = 'gallery-dot';
      dot.setAttribute('aria-label', 'Go to photo ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i); });
      dotsContainer.appendChild(dot);
      return dot;
    }) : [];

    function render() {
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function pauseAllVideos() {
      slider.querySelectorAll('video').forEach(function (video) {
        if (!video.paused) video.pause();
      });
    }

    function goTo(i) {
      pauseAllVideos();
      index = (i + slides.length) % slides.length;
      render();
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); });

    render();
  });
}

// ---- Copy-to-clipboard fallback (for mailto links that may not open) ----
function initCopyButtons() {
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    var originalText = btn.textContent;

    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');

      var showCopied = function () {
        btn.textContent = 'Copied! Paste it into your email app.';
        setTimeout(function () { btn.textContent = originalText; }, 2500);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(showCopied).catch(function () {
          window.prompt('Copy this email address:', text);
        });
      } else {
        window.prompt('Copy this email address:', text);
      }
    });
  });
}

// ---- Contact form: opens the visitor's own email app, pre-filled ----
var TODD_EMAIL = 'ttodd337@hotmail.com';

function initContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;

  var statusEl = document.getElementById('form-status');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var name = form.name.value.trim();
    var email = form.email.value.trim();
    var phone = form.phone.value.trim();
    var interest = form.interest.value;
    var message = form.message.value.trim();

    var subject = 'Website Inquiry from ' + name;
    var body = [
      'Name: ' + name,
      'Email: ' + email,
      'Phone: ' + (phone || 'Not provided'),
      'Interested in: ' + interest,
      '',
      'Message:',
      message || '(No message provided)'
    ].join('\n');

    var mailtoLink = 'mailto:' + TODD_EMAIL + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
    window.location.href = mailtoLink;

    statusEl.textContent = 'Your email app should now open with your message ready to send — just hit send there. If nothing opens, email Todd directly at ' + TODD_EMAIL + '.';
    statusEl.className = 'form-status success';
  });
}
