// Dependencies and Scraping Tools
var bodyParser = require('body-parser');
var cheerio = require('cheerio');
var express = require('express');
var logger = require("morgan");
var mongojs = require('mongojs');
var mongoose = require('mongoose');
var path = require('path');
var request = require('request');
var port = process.env.PORT || 3000;

var Note = require('./models/note.js');
var Article = require('./models/article.js');

mongoose.Promise = Promise;

// Establish express and body-parser
var app = express();

// Use Morgan and Body-Parser
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: false }));

// Set Public as a static directory
app.use(express.static('public'));

// Set handlebars
var exphbs = require('express-handlebars');

app.engine('handlebars', exphbs({ defaultLayout: 'main' }));
app.set('view engine', 'handlebars');

// // Database configuration
// var databaseURL = 'scraper';
// var collections = ['scrapedData'];

// Connect mongojs configuration to the constructor
mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost/scrape/");
// mongoose.connect("mongodb://localhost/scrape/")
// var db = mongojs(databaseURL, collections);
//
const db = mongoose.connection;
db.on('error', function(error){
  console.log("Database error: ", error);
});

// Is the db connection successful?
db.once('open', function(){
  console.log('Mongoose connection is a go!');
});

// The Routes
app.get('/', (req, res) => {
	res.redirect('/all');
});

app.get('/scrape', function(req, res){
  Article.remove(function(err,removed) {
		   // where removed is the count of removed documents
		});
  // GET data from the Washington Post Sports Section
    request('https://www.washingtonpost.com/sports/', function(error, response, body){
      var $ = cheerio.load(body);

      $('.story-body').each(function(i, element){
        var headline = $(element).find('h3').text().trim();
        var link = $(element).find('h3').children('a').attr('href');
        var summary = $(element).find('.story-description').children('p').text().trim();
        // var author = $(element).find('a', attrs={"class":"author"}).text();
        // Data object
        var post = {
            headline: headline,
            link: link,
            summary: summary
            // author: author
        };
        console.log(JSON.stringify(post, null, 2));
        // console.log(author);


        // Insert into database
        Article.create(post)
        .then(function(dbArt) {
          res.redirect('/all');
        });
        console.log('record inserted!');



			})

    });
});

app.get('/all', function(req, res) {
	Article
	.find({})
    .then(function(dbArt) {

        var hbsObject = {
			articles: dbArt
        };

        res.render('index', hbsObject);
    })
    .catch(function(err) {

		res.json(err);
    });
});

// Start express server
app.listen(port, () => console.log('Example app listening on port' + port));
