/* global TrelloPowerUp */

(function () {
  'use strict';

  var config = window.COVER_COLORS_CONFIG;

  var t = TrelloPowerUp.iframe({
    appKey: config.APP_KEY,
    appName: config.APP_NAME,
  });

  // Trello's native cover colors and their hex values
  var TRELLO_COLORS = [
    { name: 'green', hex: '#61BD4F' },
    { name: 'yellow', hex: '#F2D600' },
    { name: 'orange', hex: '#FF9F1A' },
    { name: 'red', hex: '#EB5A46' },
    { name: 'purple', hex: '#C377E0' },
    { name: 'blue', hex: '#0079BF' },
    { name: 'sky', hex: '#00C2E0' },
    { name: 'lime', hex: '#51E898' },
    { name: 'pink', hex: '#FF78CB' },
    { name: 'black', hex: '#344563' },
  ];

  // Extended palette for custom colors
  var EXTENDED_COLORS = [
    { name: 'coral', hex: '#FF6B6B' },
    { name: 'teal', hex: '#2BCBBA' },
    { name: 'indigo', hex: '#5F27CD' },
    { name: 'amber', hex: '#F79F1F' },
    { name: 'rose', hex: '#E84393' },
    { name: 'emerald', hex: '#10AC84' },
    { name: 'slate', hex: '#576574' },
    { name: 'crimson', hex: '#B33771' },
    { name: 'ocean', hex: '#0ABDE3' },
    { name: 'gold', hex: '#FFC312' },
    { name: 'mint', hex: '#55E6C1' },
    { name: 'plum', hex: '#6C5CE7' },
    { name: 'peach', hex: '#FDA7DF' },
    { name: 'navy', hex: '#2C3A47' },
    { name: 'rust', hex: '#E55039' },
    { name: 'sage', hex: '#78E08F' },
  ];

  var selectedColor = '#0079BF';
  var selectedSize = 'normal';
  var activeSwatchEl = null;
  var initialized = false;

  // ---- DOM references ----
  var authSection = document.getElementById('auth-section');
  var pickerSection = document.getElementById('picker-section');
  var authorizeBtn = document.getElementById('authorize-btn');
  var colorInput = document.getElementById('color-input');
  var hexInput = document.getElementById('hex-input');
  var colorPreview = document.getElementById('color-preview');
  var applyBtn = document.getElementById('apply-btn');
  var removeBtn = document.getElementById('remove-btn');
  var loadingOverlay = document.getElementById('loading');
  var errorBanner = document.getElementById('error-msg');
  var sizeNormalBtn = document.getElementById('size-normal');
  var sizeFullBtn = document.getElementById('size-full');

  // ---- Initialization ----
  function init() {
    t.render(function () {
      return t
        .getRestApi()
        .isAuthorized()
        .then(function (isAuthorized) {
          if (isAuthorized) {
            showPicker();
          } else {
            showAuth();
          }
        });
    });
  }

  function showAuth() {
    authSection.style.display = 'block';
    pickerSection.style.display = 'none';
  }

  function showPicker() {
    authSection.style.display = 'none';
    pickerSection.style.display = 'block';

    if (!initialized) {
      initialized = true;
      renderColorGrid('trello-colors', TRELLO_COLORS);
      renderColorGrid('extended-colors', EXTENDED_COLORS);
      bindEvents();
    }
    loadCurrentColor();
  }

  function loadCurrentColor() {
    t.get('card', 'shared', 'coverColor').then(function (color) {
      if (color) {
        setColor(color, false);
        highlightSwatch(color);
      }
    });
    t.get('card', 'shared', 'coverSize').then(function (size) {
      if (size) {
        selectedSize = size;
        updateSizeButtons();
      }
    });
  }

  // ---- Color grid rendering ----
  function renderColorGrid(containerId, colors) {
    var container = document.getElementById(containerId);
    colors.forEach(function (c) {
      var swatch = document.createElement('button');
      swatch.className = 'color-swatch';
      swatch.style.backgroundColor = c.hex;
      swatch.setAttribute('data-color', c.hex);
      swatch.setAttribute('data-name', c.name);
      swatch.setAttribute('title', c.name + ' (' + c.hex + ')');
      swatch.setAttribute('aria-label', 'Select ' + c.name);

      // Add a dark/light indicator for visibility
      if (getBrightness(c.hex) === 'light') {
        swatch.classList.add('light-swatch');
      }

      swatch.addEventListener('click', function () {
        setColor(c.hex, true);
        highlightSwatch(c.hex);
      });

      container.appendChild(swatch);
    });
  }

  function highlightSwatch(hex) {
    if (activeSwatchEl) {
      activeSwatchEl.classList.remove('selected');
    }
    var normalized = hex.toUpperCase();
    var swatches = document.querySelectorAll('.color-swatch');
    for (var i = 0; i < swatches.length; i++) {
      if (swatches[i].getAttribute('data-color').toUpperCase() === normalized) {
        swatches[i].classList.add('selected');
        activeSwatchEl = swatches[i];
        return;
      }
    }
    // No matching swatch (custom color)
    activeSwatchEl = null;
  }

  // ---- Color helpers ----
  function setColor(hex, updateInputs) {
    selectedColor = hex.toUpperCase();
    if (updateInputs) {
      colorInput.value = hex;
      hexInput.value = hex.toUpperCase();
    }
    colorPreview.style.backgroundColor = hex;
    applyBtn.style.backgroundColor = hex;
    applyBtn.style.color = getBrightness(hex) === 'light' ? '#172b4d' : '#ffffff';
  }

  function isValidHex(hex) {
    return /^#[0-9A-Fa-f]{6}$/.test(hex);
  }

  function getBrightness(hex) {
    var c = hex.replace('#', '');
    var r = parseInt(c.substring(0, 2), 16);
    var g = parseInt(c.substring(2, 4), 16);
    var b = parseInt(c.substring(4, 6), 16);
    var luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? 'light' : 'dark';
  }

  function findTrelloColorName(hex) {
    var normalized = hex.toUpperCase();
    for (var i = 0; i < TRELLO_COLORS.length; i++) {
      if (TRELLO_COLORS[i].hex.toUpperCase() === normalized) {
        return TRELLO_COLORS[i].name;
      }
    }
    return null;
  }

  // ---- Canvas image generation for custom colors ----
  // Uses a minimal 1x1 JPEG at low quality — Trello stretches the
  // solid-color image to fill the cover, so resolution doesn't matter.
  function generateColorImage(hexColor) {
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = hexColor;
    ctx.fillRect(0, 0, 1, 1);
    return new Promise(function (resolve) {
      canvas.toBlob(resolve, 'image/jpeg', 0.5);
    });
  }

  // ---- API calls ----
  function applyColor() {
    if (!isValidHex(selectedColor)) {
      showError('Please enter a valid hex color (e.g. #FF5733)');
      return;
    }

    showLoading(true);
    clearError();

    var trelloColorName = findTrelloColorName(selectedColor);

    t.card('id').then(function (card) {
      t.getRestApi()
        .getToken()
        .then(function (token) {
          if (trelloColorName) {
            applyNativeCover(card.id, token, trelloColorName);
          } else {
            applyCustomCover(card.id, token, selectedColor);
          }
        })
        .catch(function () {
          showLoading(false);
          showError('Authorization expired. Please re-authorize.');
          showAuth();
        });
    });
  }

  function applyNativeCover(cardId, token, colorName) {
    // Clean up any previous custom cover attachment
    cleanupOldAttachment(cardId, token)
      .then(function () {
        return fetch(
          'https://api.trello.com/1/cards/' +
            cardId +
            '?key=' +
            config.APP_KEY +
            '&token=' +
            token,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cover: { color: colorName, size: selectedSize },
            }),
          }
        );
      })
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to set cover');
        return Promise.all([
          t.set('card', 'shared', 'coverColor', selectedColor),
          t.set('card', 'shared', 'coverSize', selectedSize),
          t.remove('card', 'shared', 'coverAttachmentId'),
        ]);
      })
      .then(function () {
        showLoading(false);
        t.closePopup();
      })
      .catch(function (err) {
        showLoading(false);
        showError('Failed to apply cover: ' + err.message);
      });
  }

  function applyCustomCover(cardId, token, hexColor) {
    // Clean up any previous custom cover attachment
    cleanupOldAttachment(cardId, token)
      .then(function () {
        return generateColorImage(hexColor);
      })
      .then(function (blob) {
        var formData = new FormData();
        formData.append('key', config.APP_KEY);
        formData.append('token', token);
        formData.append(
          'name',
          'cover-color-' + hexColor.replace('#', '') + '.jpg'
        );
        formData.append('file', blob, 'cover.jpg');
        formData.append('setCover', 'false');

        return fetch(
          'https://api.trello.com/1/cards/' + cardId + '/attachments',
          { method: 'POST', body: formData }
        );
      })
      .then(function (response) {
        if (!response.ok) throw new Error('Failed to upload cover image');
        return response.json();
      })
      .then(function (attachment) {
        // Set the uploaded attachment as the cover
        return fetch(
          'https://api.trello.com/1/cards/' +
            cardId +
            '?key=' +
            config.APP_KEY +
            '&token=' +
            token,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              cover: {
                idAttachment: attachment.id,
                size: selectedSize,
                brightness: getBrightness(hexColor),
              },
            }),
          }
        ).then(function (response) {
          if (!response.ok) throw new Error('Failed to set cover');
          return attachment.id;
        });
      })
      .then(function (attachmentId) {
        return Promise.all([
          t.set('card', 'shared', 'coverColor', selectedColor),
          t.set('card', 'shared', 'coverSize', selectedSize),
          t.set('card', 'shared', 'coverAttachmentId', attachmentId),
        ]);
      })
      .then(function () {
        showLoading(false);
        t.closePopup();
      })
      .catch(function (err) {
        showLoading(false);
        showError('Failed to apply cover: ' + err.message);
      });
  }

  function removeCover() {
    showLoading(true);
    clearError();

    t.card('id').then(function (card) {
      t.getRestApi()
        .getToken()
        .then(function (token) {
          return cleanupOldAttachment(card.id, token).then(function () {
            return fetch(
              'https://api.trello.com/1/cards/' +
                card.id +
                '?key=' +
                config.APP_KEY +
                '&token=' +
                token,
              {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  cover: { color: '', idAttachment: '', size: 'normal' },
                }),
              }
            );
          });
        })
        .then(function () {
          return Promise.all([
            t.remove('card', 'shared', 'coverColor'),
            t.remove('card', 'shared', 'coverSize'),
            t.remove('card', 'shared', 'coverAttachmentId'),
          ]);
        })
        .then(function () {
          showLoading(false);
          t.closePopup();
        })
        .catch(function (err) {
          showLoading(false);
          showError('Failed to remove cover: ' + err.message);
        });
    });
  }

  function cleanupOldAttachment(cardId, token) {
    return t.get('card', 'shared', 'coverAttachmentId').then(function (oldId) {
      if (!oldId) return Promise.resolve();
      return fetch(
        'https://api.trello.com/1/cards/' +
          cardId +
          '/attachments/' +
          oldId +
          '?key=' +
          config.APP_KEY +
          '&token=' +
          token,
        { method: 'DELETE' }
      ).catch(function () {
        // Ignore - attachment may already be deleted
      });
    });
  }

  // ---- UI helpers ----
  function showLoading(show) {
    loadingOverlay.style.display = show ? 'flex' : 'none';
    applyBtn.disabled = show;
    removeBtn.disabled = show;
  }

  function showError(msg) {
    errorBanner.textContent = msg;
    errorBanner.style.display = 'block';
    setTimeout(function () {
      clearError();
    }, 5000);
  }

  function clearError() {
    errorBanner.style.display = 'none';
    errorBanner.textContent = '';
  }

  function updateSizeButtons() {
    sizeNormalBtn.classList.toggle('active', selectedSize === 'normal');
    sizeFullBtn.classList.toggle('active', selectedSize === 'full');
  }

  // ---- Event binding ----
  function bindEvents() {
    // Authorization
    authorizeBtn.addEventListener('click', function () {
      t.getRestApi()
        .authorize({ scope: 'read,write' })
        .then(function () {
          showPicker();
        })
        .catch(function () {
          showError('Authorization was denied or failed.');
        });
    });

    // Native color picker
    colorInput.addEventListener('input', function () {
      var hex = colorInput.value.toUpperCase();
      setColor(hex, true);
      highlightSwatch(hex);
    });

    // Hex text input
    hexInput.addEventListener('input', function () {
      var val = hexInput.value.trim();
      if (val.length > 0 && val[0] !== '#') {
        val = '#' + val;
      }
      if (isValidHex(val)) {
        setColor(val, false);
        colorInput.value = val;
        highlightSwatch(val);
      }
    });

    hexInput.addEventListener('blur', function () {
      if (!isValidHex(hexInput.value)) {
        hexInput.value = selectedColor;
      }
    });

    // Size toggle
    sizeNormalBtn.addEventListener('click', function () {
      selectedSize = 'normal';
      updateSizeButtons();
    });
    sizeFullBtn.addEventListener('click', function () {
      selectedSize = 'full';
      updateSizeButtons();
    });

    // Apply / Remove
    applyBtn.addEventListener('click', applyColor);
    removeBtn.addEventListener('click', removeCover);
  }

  // ---- Start ----
  init();
})();
