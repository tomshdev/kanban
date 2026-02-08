/* global TrelloPowerUp */

var PALETTE_ICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#838c91">' +
      '<path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 ' +
      '0-.61-.23-1.21-.64-1.67a.528.528 0 0 1-.13-.33c0-.28.22-.5.5-.5H17c2.76 ' +
      '0 5-2.24 5-5C22 6.49 17.51 2 12 2zM6.5 13C5.67 13 5 12.33 5 11.5S5.67 ' +
      '10 6.5 10 8 10.67 8 11.5 7.33 13 6.5 13zm3-4C8.67 9 8 8.33 8 7.5S8.67 ' +
      '6 9.5 6s1.5.67 1.5 1.5S10.33 9 9.5 9zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 ' +
      '6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9zm3 4c-.83 0-1.5-.67-1.5-1.5s.67' +
      '-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>' +
    '</svg>'
  );

var WHITE_ICON =
  'data:image/svg+xml,' +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="#ffffff">' +
      '<path d="M12 2C6.49 2 2 6.49 2 12s4.49 10 10 10c1.38 0 2.5-1.12 2.5-2.5 ' +
      '0-.61-.23-1.21-.64-1.67a.528.528 0 0 1-.13-.33c0-.28.22-.5.5-.5H17c2.76 ' +
      '0 5-2.24 5-5C22 6.49 17.51 2 12 2zM6.5 13C5.67 13 5 12.33 5 11.5S5.67 ' +
      '10 6.5 10 8 10.67 8 11.5 7.33 13 6.5 13zm3-4C8.67 9 8 8.33 8 7.5S8.67 ' +
      '6 9.5 6s1.5.67 1.5 1.5S10.33 9 9.5 9zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 ' +
      '6 14.5 6s1.5.67 1.5 1.5S15.33 9 14.5 9zm3 4c-.83 0-1.5-.67-1.5-1.5s.67' +
      '-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>' +
    '</svg>'
  );

var config = window.COVER_COLORS_CONFIG;

TrelloPowerUp.initialize(
  {
    'card-buttons': function (t) {
      return [
        {
          icon: PALETTE_ICON,
          text: 'Cover Color',
          callback: function (t) {
            return t.popup({
              title: 'Set Cover Color',
              url: './color-picker.html',
              height: 520,
            });
          },
        },
      ];
    },

    'card-detail-badges': function (t) {
      return t.get('card', 'shared', 'coverColor').then(function (color) {
        if (!color) return [];
        return [
          {
            title: 'Cover',
            text: color,
            callback: function (t) {
              return t.popup({
                title: 'Set Cover Color',
                url: './color-picker.html',
                height: 520,
              });
            },
          },
        ];
      });
    },

    'card-back-section': function (t) {
      return t.get('card', 'shared', 'coverColor').then(function (color) {
        if (!color) return null;
        return {
          title: 'Cover Color',
          icon: PALETTE_ICON,
          content: {
            type: 'iframe',
            url: t.signUrl('./card-back.html'),
            height: 40,
          },
        };
      });
    },
  },
  {
    appKey: config.APP_KEY,
    appName: config.APP_NAME,
  }
);
