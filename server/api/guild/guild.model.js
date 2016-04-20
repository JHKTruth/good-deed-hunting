'use strict';

var mongoose = require('mongoose'),
    env = require("../../config/environment").env,
    Schema = mongoose.Schema,
    model = null;

var GuildSchema = new Schema({
  _masterUserId: {type: Schema.Types.ObjectId, ref: "User"}, //will also have locations populated
  _memberIds: [{type: Schema.Types.ObjectId, ref: "User"}],  //will also have locations populated
  creationTime: {type: Date, index: true}, //deedTime.setMonth(blah) mongoose will be unaware of this change and doc.save() will not persist this modification. 
                                           //If you must modify Date types using built-in methods, tell mongoose about the change with doc.markModified('creationTime') before saving
  desc: String,
  name: {type: String, index: true},
  avatar: String,
  memberCount: Number,
  praises: Number,
  titles: [
          {
            name: String,
            permissions: Number
          }
  ],
  awards: [
          {
            name: String,
            desc: String
          }
  ]
  }, { autoIndex: false, id: false, strict: true //using strict since will populate _masterUserId and _memberIds w/ values from db
                                   //note safe: false has been removed. Meaning when one doesn't care about waiting for result [default mongodb] use the direct 
                                   //update call w/ the macro or findByIdAndUpdate. Note that findAndUpdate/Remove do not execute any hooks or validation before 
                                   //making the change in the database. If you need hooks and validation, first query for the document and then save it
       //, shardKey: { name: 1 }
     }
);

model = mongoose.model('Guild', GuildSchema);

if(env !== "production") {
    //means of development or test
    model.ensureIndexes(function (err) {
        if (err) {
            console.error("Oh crap something went up in Guild ensureIndex", err);
            return err;
        }
    });
}

module.exports = model;