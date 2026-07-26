// ==========================================================================
// Bods by Todd — Shared behavior: nav, scroll effects, FAQ, contact form
// ==========================================================================

document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  initScrollAnimations();
  initFaq();
  initContactForm();
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

// ---- Contact form via EmailJS ----
// TODO: Replace with Todd's actual EmailJS public key, service ID, and template ID
var EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';
var EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';
var EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID';

function initContactForm() {
  var form = document.getElementById('contact-form');
  if (!form) return;

  if (window.emailjs && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
    emailjs.init(EMAILJS_PUBLIC_KEY);
  }

  var statusEl = document.getElementById('form-status');
  var submitBtn = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    var showStatus = function (message, isSuccess) {
      statusEl.textContent = message;
      statusEl.className = 'form-status ' + (isSuccess ? 'success' : 'error');
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    };

    if (!window.emailjs || EMAILJS_PUBLIC_KEY === 'YOUR_PUBLIC_KEY') {
      // EmailJS not yet configured — surface a clear message instead of failing silently
      showStatus('Form is not fully configured yet. Please call or email Coach Todd directly.', false);
      return;
    }

    emailjs.sendForm(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, form)
      .then(function () {
        showStatus("Thanks! Your message has been sent — Coach Todd will get back to you soon.", true);
        form.reset();
      })
      .catch(function () {
        showStatus('Something went wrong sending your message. Please try again or call directly.', false);
      });
  });
}
