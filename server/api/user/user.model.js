'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    env = require("../../config/environment").env,
    authTypes = ['local', 'twitter', 'facebook', 'google'],
    model = null;

var UserSchema = new Schema({
  _deedIds: [{type: Schema.Types.ObjectId, ref: "Deed"}],
  _deedLikes: {id: Schema.Types.ObjectId, count: Number}, //so to limit the number of likes per day
  _guilds: [{type: Schema.Types.ObjectId, ref: "Guild"}],
  name: {type: String, index: true, default: "member"},
  avatar: String,
  email: {type: String, lowercase: true},
  lastLogin: Date,
  points: {type: Number, default: 0},
  role: {
    type: String,
    default: 'member'
  },
  address: {
              desc: String,
              address: String,
              location: {
                lat: {type: Number, index: '2d', default: 25.0000}, //put people who haven't provided to bermuda triangle
                lng: {type: Number, index: '2d', default: 71.0000}
              }
  },
  achievements: [
                {
                  name: String,
                  desc: String
                }
  ],
  lvl: {type: Number, index: true, default: 1},
  gears: [
          {
            _gearId: Schema.Types.ObjectId,
            position: Number
          }
  ],
  hashedPassword: String,
  provider: String,
  salt: String,
  facebook: {}
  }, { autoIndex: false, id: false
       //, shardKey: { name: 1 }
     }
);

/**
 * Virtuals
 */
UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashedPassword = this.encryptPassword(password);
  })
  .get(function() {
    return this._password;
  });

// Non-sensitive info we'll be putting in the token
UserSchema
  .virtual('token')
  .get(function() {
    return {
      '_id': this._id,
      'role': this.role
    };
  });

/**
 * Validations
 */

// Validate empty email
UserSchema
  .path('email')
  .validate(function(email) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return email.length;
  }, 'Email cannot be blank');

// Validate empty password
UserSchema
  .path('hashedPassword')
  .validate(function(hashedPassword) {
    if (authTypes.indexOf(this.provider) !== -1) return true;
    return hashedPassword.length;
  }, 'Password cannot be blank');

// Validate email is not taken
UserSchema
  .path('email')
  .validate(function(value, respond) {
    var self = this;
    this.constructor.findOne({email: value}, function(err, user) {
      if(err) throw err;
      if(user) {
        if(self.id === user.id) return respond(true);
        return respond(false);
      }
      respond(true);
    });
}, 'The specified email address is already in use.');

var validatePresenceOf = function(value) {
  return value && value.length;
};

/**
 * Pre-save hook
 */
UserSchema
  .pre('save', function(next) {
    if (!this.isNew) return next();

    if (!validatePresenceOf(this.hashedPassword) && authTypes.indexOf(this.provider) === -1)
      next(new Error('Invalid password'));
    else
      next();
  });

/**
 * Post-init hook, update points to give 
 */
UserSchema
  .post('init', function(user) {
    var today = new Date();

    if(!user.lastLogin || (user.points < Number.MAX_VALUE && today.getTime()-user.lastLogin.getTime() >= 86400000)) {
      //current login has surpassed one day so give a point and update the login
      user.lastLogin = today;
      user.points++;
      this.constructor.update({"_id": user._id}, {"$inc": {"points": 1}, "$set": {"lastLogin": today}});
    }
  });

/**
 * Methods
 */
UserSchema.methods = {
  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashedPassword;
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Encrypt password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  encryptPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  },

  /**
   * People around the 2d geosphere, should this be constrained to guild?
   *
   * @param {Function} callback
   * @return {Array}
   * @api public
   */
  peopleAroundMe: function(callback) {
    return this.model('User').find({"address.location": { $nearSphere: this.address.location, $maxDistance: 0.01} }, callback);
  }
};

model = mongoose.model('User', UserSchema);

if(env !== "production") {
    //means of development or test
    model.ensureIndexes(function (err) {
        if (err) {
            console.error("Oh crap something went up in UserSchema ensureIndex", err);
            return err;
        }
    });
}

module.exports = model;
