const generate = require('nanoid/generate');
const slugify = require('slugify');

/**
 * Load MongoDB models.
 */
const User = require('../models/User');

/**
 * Load input validators.
 */

// eslint-disable-next-line operator-linebreak
const alphabet =
  '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';


/**
 * Signup Controler - Take the users email and password to create there account.
 * Also will send them aa email to verify there email address
 *
 * @param username
 * Current User username
 * @param email
 * Current User email
 * @param password
 * Current User Password
 */
exports.postSignup = async (req, res) => {
  // TODO Add vaildation
  // const { errors, isValid } = validateSingupInput(req.body);

  // if (!isValid) {
  //   return res.status(400).json(errors);
  // }

  try {
    const { username, email, password } = req.body;

    let user = await User.find({ email });

    if (user.length > 0) {
      // TODO Add "This e-mail address is not available"
      // Status 400
    }

    user = new User({
      username,
      email,
      password
    });

    await user.save();

    // TODO Redirect back and say they must verify there
    // email but there account has been created
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', status: 500 });
  }
};

/**
 * Login Controler - This verifys the login details then if vaild
 * creates a user session then redirect to there uploads lising pagge
 *
 * @param email
 * Current User email
 * @param password
 * Current User Password
 */
exports.postLogin = async (req, res) => {
  req.flash('success', `Welcome back, ${req.user.username}`);
  res.redirect('/me');
};