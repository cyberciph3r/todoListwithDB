const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const app = express();
const mongoose = require("mongoose");
const _ = require("lodash");

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
app.set('view engine', 'ejs');

mongoose.connect("mongodb+srv://<username>:<password>@cluster0.vfthz.mongodb.net/todolistDB");

const itemsSchema = {
  name: String
};

const Item = mongoose.model("Item", itemsSchema);

const customPathScheme = {
  name:String,
  items : [itemsSchema]
};
const Path = mongoose.model("Path",customPathScheme);

const drinking = new Item({
  name: "Drinking Water"
})

let defaultItems = [drinking];
const homeDate = date.getDate();

app.get("/", function(req, res) {
  let day = date.getDate();
  Item.find({}, function(err, foundItems) {
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err)
          console.log(err);
        else
          console.log("Successfully added to DB");
      });
      res.redirect("/");
    }else{
      res.render('list', { listName: day,newItems: foundItems});
    }
  })
});

app.get("/:customPath",function(req,res){
  const customPath = _.capitalize([string=req.params.customPath]);
  Path.findOne({name:customPath},function(err,path) {
    if(!err){
      if(!path){
        const newPath = new Path({
          name:customPath,
          items:defaultItems
        });
        newPath.save();
        res.redirect("/"+customPath);
      }else{
        res.render('list', { listName: path.name,newItems: path.items});
      }
    }
  })

});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.typeOfList;
  const item = new Item({
    name:itemName
  })

  if(listName==homeDate){
    item.save();
    res.redirect("/");
  }else{
    Path.findOne({name:listName},function(err,foundPath){
      if(!err){
        foundPath.items.push(item);
        foundPath.save();
        res.redirect("/"+listName);
      }

    })
  }

})

app.post("/delete",function(req,res){
  const checkedCBoxId = req.body.checkBox;
  const pathOfDltion = req.body.listNametoDlt;
  if(pathOfDltion==homeDate){
    Item.findByIdAndRemove(checkedCBoxId,function(err){
      if(!err){
        console.log("Successfully removed!!");
        res.redirect("/")
      }
    });
  }else{
    Path.findOneAndUpdate({name:pathOfDltion},{$pull:{items:{_id:checkedCBoxId}}},function(err,foundPath){
      if(!err){
        res.redirect("/"+pathOfDltion);
      }
    })
  }

});

app.listen(process.env.PORT||5000, function() {
  console.log("Server is up!!");
})
