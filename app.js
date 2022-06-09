const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname+"/date.js");
const app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

let items = ["Buy Food"];

let workItems = [];

app.get("/", function(req, res) {
  let day = date.getDate();
  res.render('list', {
    day: day,
    newItems: items
  });

});


app.get("/work", function(req, res) {
  res.render("list", {
    day: "work",
    newItems: workItems
  });
})

app.post("/", function(req, res) {
  var item = req.body.newItem;
  if (req.body.typeOfList === "work") {
    workItems.push(item);
    res.redirect("/work");
  } else {
    items.push(item);
    res.redirect("/");
  }

});


app.listen(3000, function() {
  console.log("Server is up!!");
})
