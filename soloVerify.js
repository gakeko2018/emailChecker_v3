const verifier = require("email-verify");
let fs = require("fs");
const upper =
  '<!DOCTYPE html> <html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><meta http-equiv="X-UA-Compatible" content="ie=edge" /><title>Bulk Email Checker</title> <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet"/><link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"/> </head> <body> <script> document.addEventListener("DOMContentLoaded", function() { var elems = document.querySelectorAll(".collapsible"); var instances = M.Collapsible.init(elems); }); </script><script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script> <main class="container"> <nav> <div class="nav-wrapper"><a href="/" class="brand-logo"><i class="material-icons">cloud</i>Email Checker</a></div> </nav><section><ul class="collapsible">';
const lower =
  '</ul> </section> </main> <script> document.addEventListener("DOMContentLoaded", function() { var elems = document.querySelectorAll(".collapsible"); var instances = M.Collapsible.init(elems); }); </script><script src="https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/js/materialize.min.js"></script></body></html>';
const sub1 =
  '<li> <div class="collapsible-header"> <i class="material-icons">email</i>';
const sub2 = '</div> <div class="collapsible-body">';
const sub3 = "</div> </li>";
var insertedTitle = "";
var insertedDetails = "";

module.exports.soloVerify = emailListFileName => {
  const verifyCodes = verifier.verifyCodes;
  const result = [];
  const getAddressFromTextFile = function(filepath) {
    let file = {
      exist: true,
      extension: require("path").extname(filepath),
      content: ""
    };

    let extensionErrorMsg =
      "Sorry, you needed to put addresses list into plain text (*.txt) file. Separated each address by new line";

    if (file.extension !== ".txt") throw new Error(extensionErrorMsg);

    try {
      file.content = fs.readFileSync(filepath, "utf-8");
    } catch (e) {
      if (e.code === "ENOENT") console.log("File not found!", e);
      else console.log("Error: ", e);
      file.exist = false;
    } finally {
      if (!file.exist) {
        console.log("Error, File not found!");
        return [];
      } else {
        let addressList = file.content.split("\n"),
          addressObject = {};

        addressList.forEach(address => {
          if (address.length > 0) {
            addressObject[address] = true;
          }
        });

        return Object.keys(addressObject);
      }
    }
  };

  async function verifyAll() {
    //const files = await getFilePaths();

    const arr = await getAddressFromTextFile(emailListFileName);

    await Promise.all(
      arr.map(async (item3, index) => {
        await verifier.verify(item3.trim(), function(err, info) {
          if (info.success) {
            console.log(
              "\x1b[32m%s\x1b[0m",
              item3.trim() + " : Verification Success"
            );
            insertedTitle +=
              "<span style='color:green'>" +
              item3.trim() +
              " : Verification Success: </span>";
          } else {
            console.log(
              "\x1b[31m%s\x1b[0m",
              item3.trim() + " : Verification Fail "
            );
            insertedTitle +=
              "<span style='color:red'>" +
              item3.trim() +
              " : Verification Failed:</span>";
          }

          if (err) {
            console.log("Cannot verify '" + item3.trim() + "'. Error Details:");
            console.log(err);
            insertedDetails +=
              "Cannot verify '" + item3.trim() + "'. Error Details:" + err;
            result.push([item3, info.success, err]);
          } else {
            //console.log(info.info);
            switch (info.code) {
              case verifyCodes.finishedVerification:
                result.push([
                  item3,
                  info.success,
                  "Verification Control Completed"
                ]);
                console.log("Verification Control Completed"); //existing email: should respond with an object where success is true
                insertedDetails += "Verification Control Completed";
                break;
              case verifyCodes.domainNotFound:
                result.push([item3, info.success, "Domain Not Found"]);
                console.log("Domain Not Found"); //non-existing domain: should respond with an object where success is false
                insertedDetails += "Domain Not Found";
                break;
              case verifyCodes.invalidEmailStructure: //badly formed email: should respond with an object where success is false
                result.push([item3, info.success, "Invalid Email Structure"]);
                console.log("Invalid Email Structure");
                insertedDetails += "Invalid Email Structure";
                break;
              case verifyCodes.noMxRecords:
                result.push([item3, info.success, "No MX Records"]);
                console.log("No MX Records");
                insertedDetails += "No MX Records";
                break;
              case verifyCodes.SMTPConnectionTimeout: //short timeout: should respond with an object where success is false
                result.push([item3, info.success, "SMTP Connection Timeout"]);
                console.log("SMTP Connection Timeout");
                insertedDetails += "SMTP Connection Timeout";
                break;
              case verifyCodes.SMTPConnectionError:
                result.push([item3, info.success, "SMTP Connection Error"]);
                console.log("SMTP Connection Error");
                insertedDetails += "SMTP Connection Error";
                break;

              default:
                result.push([item3, info.success, "Unknown Response"]);
                console.log("Unknown Response");
                insertedDetails += "Unknown Response";
            }
          }
          fs.appendFileSync(
            "./public/result.html",
            sub1 + insertedTitle + sub2 + insertedDetails + sub3
          );
          insertedTitle = "";
          insertedDetails = "";
        });
   
       
         
      })
    )
  }

  fs.writeFileSync("./public/result.html", upper);
 verifyAll();
  return result;
};
