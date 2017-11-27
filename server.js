
// Dependencies and Scraping Tools
var request = require('request');
var cheerio = require('cheerio');
var express = require('express');
var mongojs = require('mongojs');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var path = require('path');

// // Required JS file dependencies
// var Note = require('./models/note.js');
// var Article = require('./models/article.js');

// Initialize Express
var app = express();

// Database configuration
var databaseURL = 'scraper';
var collections = ['scrapedData'];


// Connect mongojs configuration to the constructor
var db = mongojs(databaseURL, collections);
db.on('error', function(error){
  console.log('Database error: ', error);
});

// Test route to make sure its up and working properly

app.get('/', function(req, res){
  res.send('Hello world');
});

app.get('/all', function(req, res){
  db.scrapedData.find({}, function(error, found){
    if(error){
      console.log(error);
    } else {
      {
        res.json(found);
      }
    }
  });
});

app.get('/scrape', function(req, res){
  // GET data from the New York Times
    request('https://www.washingtonpost.com/', function(error, response, html){
      var $ = cheerio.load(html);

      $('.headline').each(function(i, element){
        var headline = $(this).children('a').text();
        var link = $(this).children('a').attr('href');

          if (headline && link){
            db.scrapedData.save({
              title: headline,
              link: link
            },
            function(error, saved){
              if(error){
                console.log(error);
              } else {
                console.log(saved);
              }
          });
          }
      });
    });
    res.send('Scrape is complete.');
});
// Start express server
app.listen(8080, () => console.log('Example app listening on port 8080!'));
