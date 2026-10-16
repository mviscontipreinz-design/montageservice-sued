/* Montageservice Süd – Website
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

  /* ---------- Formular: Prüfung und echter Versand ---------- */
  var form = document.querySelector('form[data-contact-form]');
  if (form) {
    var status = form.querySelector('.form-status');
    var submit = form.querySelector('button[type="submit"]');
    var sending = false;

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

    var showStatus = function (message, isError) {
      if (!status) return;
      status.textContent = message;
      status.classList.add('visible');
      status.classList.toggle('error', !!isError);
      status.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    form.addEventListener('input', function (e) {
      if (e.target.matches('input,select,textarea')) validateField(e.target);
    });
    form.addEventListener('blur', function (e) {
      if (e.target.matches('input,select,textarea')) validateField(e.target);
    }, true);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (sending) return;

      var fields = form.querySelectorAll('input,select,textarea');
      var firstInvalid = null;
      fields.forEach(function (input) {
        if (input.type === 'hidden') return;
        if (!validateField(input) && !firstInvalid) firstInvalid = input;
      });

      if (firstInvalid) {
        firstInvalid.focus();
        showStatus('Bitte prüfen Sie die markierten Felder.', true);
        return;
      }

      var payload = {
        _subject: 'Anfrage über die Website – Montageservice Süd',
        _template: 'table',
        _captcha: 'false',
        _url: window.location.href.split('#')[0]
      };
      fields.forEach(function (input) {
        if (input.type === 'hidden' || !input.name) return;
        payload[input.name] = input.type === 'checkbox' ? (input.checked ? 'Ja' : 'Nein') : input.value;
      });

      sending = true;
      if (submit) { submit.disabled = true; }
      showStatus('Ihre Anfrage wird gesendet …', false);

      fetch('https://formsubmit.co/ajax/info@montageservice-sued.de', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      }).then(function (response) {
        return response.json().catch(function () { return {}; }).then(function (data) {
          var ok = response.ok && String(data.success) !== 'false';
          if (!ok) throw new Error(data.message || ('HTTP ' + response.status));
          return data;
        });
      }).then(function () {
        showStatus('Vielen Dank! Ihre Anfrage ist bei uns eingegangen. Wir melden uns in der Regel innerhalb von 24 Stunden an Werktagen.', false);
        form.reset();
        form.querySelectorAll('.field.invalid').forEach(function (field) { field.classList.remove('invalid'); });
      }).catch(function () {
        var lines = [];
        Object.keys(payload).forEach(function (key) {
          if (key.charAt(0) === '_') return;
          lines.push(key + ': ' + payload[key]);
        });
        var mail = 'mailto:info@montageservice-sued.de'
          + '?subject=' + encodeURIComponent('Anfrage über die Website – Montageservice Süd')
          + '&body=' + encodeURIComponent(lines.join('\n'));
        if (status) {
          status.classList.add('visible');
          status.classList.add('error');
          status.innerHTML = 'Das Senden hat nicht funktioniert. Bitte rufen Sie uns an unter '
            + '<a href="tel:+4915773806320">01577 3806320</a> oder '
            + '<a href="' + mail + '">senden Sie Ihre Anfrage per E-Mail</a> – Ihre Eingaben sind dort schon eingetragen.';
          status.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }).then(function () {
        sending = false;
        if (submit) { submit.disabled = false; }
      });
    });
  }

  /* ---------- Intro beim Öffnen der Startseite ---------- */
  var intro = document.getElementById('siteIntro');
  if (intro) {
    var seen = false;
    try { seen = sessionStorage.getItem('ms-intro') === '1'; } catch (err) { seen = false; }
    if (seen) {
      intro.parentNode.removeChild(intro);
    } else {
      try { sessionStorage.setItem('ms-intro', '1'); } catch (err) {}
      var closeIntro = function () {
        if (intro.classList.contains('done')) return;
        intro.classList.add('done');
        window.setTimeout(function () {
          if (intro.parentNode) intro.parentNode.removeChild(intro);
        }, 220);
      };
      var skipButton = intro.querySelector('.intro-skip');
      if (skipButton) skipButton.addEventListener('click', function (e) { e.stopPropagation(); closeIntro(); });
      intro.addEventListener('click', closeIntro);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeIntro(); });
      window.setTimeout(closeIntro, 3600);
    }
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
