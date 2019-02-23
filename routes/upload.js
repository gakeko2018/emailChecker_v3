var express = require("express");

var router = express.Router();
const fileUpload = require('express-fileupload');
const myVerify = require ("../soloVerify")
router.use(fileUpload());

/* 
router.post("/", function(req, res) {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send("No files were uploaded.");
  }
  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let sampleFile = req.files.sampleFile;
  // Use the mv() method to place the file somewhere on your server
  sampleFile.mv("./check/emailList.txt", function(err) {
    if (err) return res.status(500).send(err);
    res.send("File uploaded!");
    //res.render("upload", { result: "result" })
  });
});

 */

router.post("/", (req, res) => {
  if (Object.keys(req.files).length == 0) {
    return res.status(400).send("No files were uploaded.");
  }
  let sampleFile = req.files.sampleFile;
  sampleFile.mv("./emailList.txt", function(err) {
    if (err) return res.status(500).send(err);
 myVerify.soloVerify("./emailList.txt")
  });
 res.render("upload", {
  result:  "result"
});

});













module.exports = router;
