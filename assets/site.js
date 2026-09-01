/* Koz Axiom — kozaxiom.com
   Iki is yapar: alt bilgideki telif yilini gunceller (2.8) ve enquiry
   formunu sayfadan ayrilmadan gonderir (2.7). Takip kodu yoktur. */

(function () {
  'use strict';

  /* ── 2.8 telif yili ─────────────────────────────────────────── */
  var yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = String(new Date().getFullYear());
  }

  /* ── 2.7 enquiry formu ──────────────────────────────────────── */
  var form = document.getElementById('enquiry-form');
  var button = document.getElementById('enquiry-submit');
  var okBox = document.getElementById('form-success');
  var errBox = document.getElementById('form-error');

  if (!form || !button || !okBox || !errBox) return;

  function showSuccess() {
    form.hidden = true;
    errBox.hidden = true;
    okBox.hidden = false;
    okBox.focus();
  }

  function showError() {
    button.disabled = false;
    errBox.hidden = false;
    errBox.scrollIntoView({ block: 'nearest' });
  }

  /* Form islemcisi JSON yerine yonlendirme donduruyorsa (?sent=1 / ?error=1)
     ayni mesajlar burada gosterilir. */
  var params = new URLSearchParams(window.location.search);
  if (params.get('sent') === '1') showSuccess();
  else if (params.get('error') === '1') showError();

  /* Bot tuzagi: sayfanin acilis zamani. Insan bu formu saniyeler icinde
     dolduramaz; ani gonderim sunucu tarafinda elenebilir. */
  var renderedAt = document.getElementById('f-rendered-at');
  if (renderedAt) renderedAt.value = String(Date.now());

  form.addEventListener('submit', function (event) {
    event.preventDefault();

    /* Zorunlu alan uyarilari tarayicinin kendi kontrolunden gelir (test 6). */
    if (!form.reportValidity()) return;

    errBox.hidden = true;
    button.disabled = true;
    form.setAttribute('aria-busy', 'true');

    var data = new FormData(form);

    fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data
    })
      .then(function (response) {
        if (!response.ok) return false;
        return response
          .clone()
          .json()
          .then(function (result) {
            /* Islemci acikca basarisiz demedigi surece 2xx = gonderildi.
               ok / success alanlari farkli servislerde farkli adlanir. */
            return result.ok !== false && result.success !== false;
          })
          .catch(function () {
            return true; /* Govde JSON degil ama HTTP 2xx dondu. */
          });
      })
      .catch(function () {
        return false;
      })
      .then(function (sent) {
        form.removeAttribute('aria-busy');
        /* Sessiz basarisizlik yok: hata ekranda gorunur, adres yazilidir. */
        if (sent) showSuccess();
        else showError();
      });
  });
})();
