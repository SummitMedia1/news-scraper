var mongoose = require('mongoose');
var Schema = mongoose.Schema;

    var ArticleSchema = new Schema ({
        headline: String,
        link: String,
        summary: String,
        author: String
    });

var Article = mongoose.model('Article', ArticleSchema);

module.exports = Article;
