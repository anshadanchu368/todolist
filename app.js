//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-ansha:Test123@cluster0.qap9pva.mongodb.net/todoDB");

const itemSchema = {
  name: String,
};

const Item = mongoose.model("item", itemSchema);

const coding = new Item({
  name: "coding",
});

const programming = new Item({
  name: "programming",
});

const hacking = new Item({
  name: "hacking",
});

const itemnames = [coding, programming, hacking];

const listSchema = {
  name: String,
  items: [itemSchema],
};

const List = mongoose.model("list", listSchema);

app.get("/", function (req, res) {
  Item.find({}, function (err, founditems) {
    if (founditems.length === 0) {
      Item.insertMany(itemnames, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("inserted successfully");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: "today", newListItems: founditems });
    }
  });
});

app.get("/:customListName", function (req, res) {
  const customListName =_.capitalize(req.params.customListName);
  List.findOne({ name: customListName }, function (err, result) {
    if (!err) {
      if (!result) {
        // create a new custom list
        const list = new List({
          name: customListName,
          items: itemnames,
        });

        list.save();
        res.redirect("/" + customListName);
      } else {
        // console.log("List exists");
        res.render("list", {
          listTitle: result.name,
          newListItems: result.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemname = req.body.newItem;
  const ListName = req.body.list;
  const item1 = new Item({
    name: itemname,
  });

  if (ListName === "today") {
    item1.save();
    res.redirect("/");
  } else {
    List.findOne({ name: ListName }, function (err, result) {
      result.items.push(item1);
      result.save();
      res.redirect("/" + ListName);
    });
  }
});

app.post("/delete", function (req, res) {
  const checkedid = req.body.checkbox;
  const ListName = req.body.ListName;



  if(ListName === "Today"){
  Item.findByIdAndRemove(checkedid, function (err) {
    if (!err) {
      console.log("successfully removed");
      res.redirect("/");
    }
  });
  } else {

        List.findOneAndUpdate({name:ListName},{$pull:{items:{_id:checkedid}}},function (err,result){
          if(!err){
            res.redirect("/"+ListName);
          }
        });


      }

  


});
  

// app.get("/about", function (req, res) {
//   res.render("about");
// });


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function () {
  console.log("Server started on port 3000");
});


//find unexpected end of inputs error.