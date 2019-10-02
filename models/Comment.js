const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create schema
const CommentSchema = new Schema({
    body: {
        type: String
    }
});

//Create model from Schema

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = Comment;