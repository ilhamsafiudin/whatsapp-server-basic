const phoneNumberFormatter = function (number) {

  let formatted = number.replace(/\D/g, '');

  if (formatted.startsWith('0')) {
    formatted = '62' + formatted.substr(1);
  }

  if (!formatted.endsWith('@c.us')) {
    formatted += '@c.us';
  }

  return formatted;
}

const groupFormatter = function (chatid) {

  let formatted = chatid.replace(/^\s+|\s+$/gm, '');

  if (formatted) {
    if (!formatted.endsWith('@g.us')) {
      formatted += '@g.us';
    }
  }

  return formatted;
}

module.exports = {
  phoneNumberFormatter,
  groupFormatter
}