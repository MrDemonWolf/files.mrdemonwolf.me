const gravatar = require('gravatar');

/**
 * @param email
 * @type String
 * Email of the user.
 */
module.exports = (email) => gravatar.url(email, {
  s: '100',
  r: 'x',
  d: 'retro'
}, true);
