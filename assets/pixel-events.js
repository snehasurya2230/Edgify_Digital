/* Meta Pixel — shared click tracking for WhatsApp and Call buttons */
document.querySelectorAll('.whatsapp-btn').forEach(function (el) {
  el.addEventListener('click', function () {
    if (typeof fbq === 'function') fbq('track', 'Contact');
  });
});

document.querySelectorAll('.call-btn').forEach(function (el) {
  el.addEventListener('click', function () {
    if (typeof fbq === 'function') fbq('track', 'Contact');
  });
});
