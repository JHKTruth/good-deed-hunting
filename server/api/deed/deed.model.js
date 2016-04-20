'use strict';

var mongoose = require('mongoose'),
    env = require("../../config/environment").env,
    Schema = mongoose.Schema,
    model = null;

var DeedSchema = new Schema({
  _users: [{type: Schema.Types.ObjectId, ref: "User"}],
  title: String,
  desc: String,
  contentType: Number, //video|img file
  contentData: Schema.Types.Mixed,
  deedTime: {type: Date, index: true}, //deedTime.setMonth(blah) mongoose will be unaware of this change and doc.save() will not persist this modification. 
                                       //If you must modify Date types using built-in methods, tell mongoose about the change with doc.markModified('deedTime') before saving
  deedPluses: {type: Number, index: true},
  validated: Boolean //whether the deed has been validated or not
  }, { autoIndex: false, id: false, strict: true //using strict since will populate _users w/ values from db

                                   //note safe: false has been removed. Meaning when one doesn't care about waiting for result [default mongodb] use the direct 
                                   //update call w/ the macro or findByIdAndUpdate. Note that findAndUpdate/Remove do not execute any hooks or validation before 
                                   //making the change in the database. If you need hooks and validation, first query for the document and then save it
       //, shardKey: { title: 1 }
     }
);

model = mongoose.model('Deed', DeedSchema);

if(env !== "production") {
    //means of development or test
    model.ensureIndexes(function (err) {
        if (err) {
            console.error("Oh crap something went up in Deed ensureIndex", err);
            return err;
        }
    });
}

module.exports = model;