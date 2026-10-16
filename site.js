/* Montageservice Süd – Prototyp
   Navigation, Scroll-Reveal, FAQ, Formularprüfung */

(function () {
  'use strict';

  /* ---------- Mobiles Menü ---------- */
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('main-navigation');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      nav.classList.toggle('open', !open);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        toggle.setAttribute('aria-expanded', 'false');
        nav.classList.remove('open');
      }
    });
  }

  /* ---------- Scroll-Reveal ---------- */
  var revealItems = document.querySelectorAll('.reveal');
  if (revealItems.length) {
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            io.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      revealItems.forEach(function (el) { io.observe(el); });
    } else {
      revealItems.forEach(function (el) { el.classList.add('in'); });
    }
  }

  /* ---------- FAQ: nur eine Antwort offen ---------- */
  var faqItems = document.querySelectorAll('.faq details');
  faqItems.forEach(function (item) {
    item.addEventListener('toggle', function () {
      if (!item.open) return;
      faqItems.forEach(function (other) {
        if (other !== item) other.open = false;
      });
    });
  });

  /* ---------- Leistung aus Link vorbelegen (?leistung=...) ---------- */
  var params = new URLSearchParams(window.location.search);
  var preselected = params.get('leistung');
  if (preselected) {
    var select = document.querySelector('select[name="leistung"]');
    if (select) {
      Array.prototype.forEach.call(select.options, function (option) {
        if (option.value === preselected || option.text === preselected) {
          select.value = option.value;
        }
      });
    }
  }

  /* ---------- Formularprüfung (Prototyp, ohne Versand) ---------- */
  var form = document.querySelector('form[data-prototype-form]');
  if (form) {
    var status = form.querySelector('.form-status');

    var validateField = function (input) {
      var field = input.closest('.field');
      if (!field) return true;
      var value = (input.value || '').trim();
      var ok = true;

      if (input.hasAttribute('required') && !value) ok = false;
      if (input.type === 'checkbox' && input.hasAttribute('required') && !input.checked) ok = false;
      if (ok && input.type === 'email' && value && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(value)) ok = false;
      if (ok && input.name === 'telefon' && value && value.replace(/[^0-9+]/g, '').length < 6) ok = false;

      field.classList.toggle('invalid', !ok);
      return ok;
    };

    form.addEventListener('input', function (e) {
      if (e.target.matches('input,select,textarea')) validateField(e.target);
    });
    form.addEventListener('blur', function (e) {
      if (e.target.matches('input,select,textarea')) validateField(e.target);
    }, true);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = form.querySelectorAll('input,select,textarea');
      var firstInvalid = null;
      fields.forEach(function (input) {
        if (input.type === 'hidden') return;
        if (!validateField(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        if (status) status.classList.remove('visible');
        return;
      }

      if (status) {
        status.textContent = 'Danke! Im Prototyp wird nichts versendet – im Livebetrieb geht die Anfrage jetzt an Montageservice Süd.';
        status.classList.add('visible');
        status.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      form.reset();
      form.querySelectorAll('.field.invalid').forEach(function (f) { f.classList.remove('invalid'); });
    });
  }

  /* ---------- Jahr im Footer ---------- */
  var year = String(new Date().getFullYear());
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = year; });

  /* ---------- Aktiven Navigationspunkt setzen ---------- */
  var here = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(function (link) {
    var target = link.getAttribute('href');
    if (!target) return;
    if (target.split('/').pop().split('#')[0] === here) {
      link.setAttribute('aria-current', 'page');
    }
  });
})();