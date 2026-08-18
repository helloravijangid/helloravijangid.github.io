/* Contact form — posts to Web3Forms. No email address appears in the source. */
(function () {
  'use strict';
  var form = document.getElementById('enquiry');
  if (!form) return;
  var status = document.getElementById('form-status');
  var btn = form.querySelector('button[type="submit"]');

  function show(kind, msg) {
    status.className = 'form-status ' + kind;
    status.textContent = msg;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }

    var key = form.querySelector('[name="access_key"]').value;
    if (key === 'WEB3FORMS_ACCESS_KEY') {
      show('err', 'The form is not connected yet. Add your Web3Forms access key to enable it.');
      return;
    }

    var original = btn.innerHTML;
    btn.disabled = true;
    btn.textContent = 'Sending…';
    show('', '');

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      body: new FormData(form)
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (d.success) {
          form.reset();
          show('ok', 'Thanks — that reached me. I reply to every enquiry myself, usually within one working day.');
        } else {
          show('err', 'Something went wrong sending that. Please try again in a moment.');
        }
      })
      .catch(function () {
        show('err', 'Network error — the enquiry did not send. Please try again.');
      })
      .finally(function () {
        btn.disabled = false;
        btn.innerHTML = original;
      });
  });
})();
