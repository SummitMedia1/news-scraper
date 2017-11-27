const cheerio = require('cheerio');
const express = require('express');
const mongojs = require('mongojs');
const request = require('request');

const app = express();
const db = mongojs('scraper', ['webdevdata']);



// Remove all the documents from the collection
// THIS IS BAD. DON'T DO THIS IN PRODUCTION!
// This is causing the app to reload its entire dataset every time
// the app is run. That's really bad. Don't do this.
db.webdevdata.remove({});

// Grab data from reddit
request('https://www.reddit.com/r/webdev', (error, response, html) => {
    // Initialize $ variable with the page's DOM
    var $ = cheerio.load(html);

    // Iterate over each 'div.top-matter' element (each post on the page)
    $('div.top-matter').each(function(i, element) {
        // Grab title
        var title = $(element).find('a.title').text();

        // Grab comment count
        var comments = $(element).find('a.comments').text();
        // This regex matches the number "5" in "5 comments"
        var match = comments.match(/(\d+) comment/);
        comments = match ? match[1] : 0;

        // Grab author
        var author = $(element).find('a.author').text();

        // Grab timestamps
        var timestampHuman = $(element).find('time.live-timestamp').text();
        var timestampMachine = $(element).find('time.live-timestamp').attr('datetime');

        // Create data object
        var post = {
            title: title,
            author: author,
            commentCount: comments,
            timestamp: timestampMachine,
            timestampDisplay: timestampHuman
        };
        console.log(JSON.stringify(post, null, 2));

        // Insert into database
        db.webdevdata.insert(post);
        console.log('record inserted!');
    });

    //db.close();
});

// Data route
app.get('/api/posts', (req, res) => {
    // Get posts from db
    db.webdevdata.find({}).sort({ title: -1 }, (err, posts) => res.json(posts));
});

app.get('/api/posts/:id', (req, res) => {
    // Get posts from db
    db.webdevdata.findOne({ _id: mongojs.ObjectId(req.params.id) },
        (err, posts) => res.json(posts));
});

app.post('/api/posts/:id/downvote', (req, res) => {
    // Get posts from db
    db.webdevdata.findOne({ _id: mongojs.ObjectId(req.params.id) },
        (err, post) => {
            if (!post.score)
                post.score = -1;
            else
                post.score--;
            console.log(post);
            db.webdevdata.update({ _id: mongojs.ObjectId(req.params.id) }, post,
                () => {
                    db.webdevdata.findOne({ _id: mongojs.ObjectId(req.params.id) },
                        (err, post) => res.json(post));
                });
        });
});

app.post('/api/posts/:id/upvote', (req, res) => {
    // Get posts from db
    db.webdevdata.findOne({ _id: mongojs.ObjectId(req.params.id) },
        (err, post) => {
            if (!post.score)
                post.score = 1;
            else
                post.score++;
            console.log(post);
            db.webdevdata.update({ _id: mongojs.ObjectId(req.params.id) }, post,
                () => {
                    db.webdevdata.findOne({ _id: mongojs.ObjectId(req.params.id) },
                        (err, post) => res.json(post));
                });
        });
});

// Start express server
app.listen(8080, () => console.log('Example app listening on port 8080!'));
