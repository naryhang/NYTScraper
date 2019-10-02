const mongoose = require('mongoose');
const Schema = mongoose.Schema;

//Create Schema
const ArticleSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true
    },
    link: {
        type: String,
        required: true,
        unique: true
    },
    summary: {
        type: String,
        required: true,
        unique: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    saved: {
        type: Boolean,
        default: false
    },
    comment: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Comment'
        }
        ]
    });

    //Create model from Schema
    const Article = mongoose.model('Article', ArticleSchema);
    
    module.exports = Article;