/* Contact forms: deliver submissions by email.
   Wires up every <form data-contact> on the page. Each form is expected to hold
   a .cf-ok banner, a .cf-bad banner, a submit button, and a hidden _honey trap. */
(function () {
  // assembled at runtime so address scrapers do not pick it up from the page source
  var inbox = ['ahmad.kefah11sar', 'gmail.com'].join('@');

  function wire(form) {
    var ok = form.querySelector('.cf-ok');
    var bad = form.querySelector('.cf-bad');
    var btn = form.querySelector('[type="submit"]');
    if (!ok || !bad || !btn) return;

    var sending = form.getAttribute('data-sending') || 'Sending...';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      ok.style.display = 'none';
      bad.style.display = 'none';

      var data = {};
      new FormData(form).forEach(function (val, key) { data[key] = val; });
      if (data._honey) return;               // a bot filled the hidden trap
      delete data._honey;
      data._subject = (form.getAttribute('data-subject') || 'Website enquiry') +
                      ': ' + (data['שם'] || data.Name || '');
      data._template = 'table';

      var label = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = sending;

      fetch('https://formsubmit.co/ajax/' + inbox, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          // the service answers HTTP 200 even when it refuses the message,
          // so the body is what decides whether the lead actually went out
          if (!res || String(res.success) !== 'true') throw new Error(res && res.message);
          ok.style.display = 'block';
          form.reset();
        })
        .catch(function () { bad.style.display = 'block'; })
        .then(function () { btn.disabled = false; btn.innerHTML = label; });
    });
  }

  var forms = document.querySelectorAll('form[data-contact]');
  for (var i = 0; i < forms.length; i++) wire(forms[i]);
})();
