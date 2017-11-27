var mongojs = require('mongojs');
var db = mongojs('mydb', ['mycollection']);

db.mycollection.insert({

  worked: true
});


db.mycollection.find({}, (err, docs) =>{
  if(err) {
    console.log(err);
    db.close();
    return;
  }

console.log(docs);
db.close();

});
