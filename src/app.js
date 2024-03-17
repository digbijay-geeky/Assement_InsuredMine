const os = require("os");
const osUtils = require("os-utils");
const http = require("http");
const cpu_measurement = 0.7;

const mongoose = require("mongoose");
const express = require("express");
const ObjectId = require("mongodb").ObjectId;
const app = express();
var bodyParser = require("body-parser");
const cors = require("cors");
var multer = require("multer");
var csv = require("csvtojson");
var cluster = require("cluster");
const CSVSchema = require("./models/csvData");
const messageSchema = require("./models/mesasgePost");

require("./db/conn");
require("dotenv").config();
var upload = multer({ dest: "uploads/" });
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const port = process.env.port;

//Task-1craete Api To upload The Csv File
app.post("/upload", upload.single("file"), (req, res, next) => {
  try {
    if (req.file == undefined) {
      return res.status(400).send({
        message: "please upload a csv file",
      });
    }
    csv()
      .fromFile(req.file.path)
      .then((data) => {
        var resultArray = [];
        for (var i = 0; i < data.length; i++) {
          var obj = {};
          obj.agent = data[i]["agent"];
          obj.userType = data[i]["userType"];
          obj.policy_mode = data[i]["policy_mode"];
          obj.producer = data[i]["producer"];
          obj.premium_amount_written = data[i]["premium_amount_written"];
          obj.premium_amount = data[i]["premium_amount"];
          obj.policy_type = data[i]["policy_type"];
          obj.company_name = data[i]["company_name"];
          obj.category_name = data[i]["category_name"];
          obj.policy_start_date = data[i]["policy_start_date"];
          obj.policy_end_date = data[i]["policy_end_date"];
          obj.csr = data[i]["csr"];
          obj.account_name = data[i]["account_name"];
          obj.email = data[i]["email"];
          obj.firstname = data[i]["firstname"];
          obj.city = data[i]["city"];
          obj.account_type = data[i]["account_type"];
          obj.phone = data[i]["phone"];
          obj.address = data[i]["address"];
          obj.state = data[i]["state"];
          obj.zip = data[i]["zip"];
          obj.dob = data[i]["dob"];
          resultArray.push(obj);
        }

        CSVSchema.insertMany(resultArray)
          .then(function () {
            res.status(200).send({
              message: "Successfully Uploaded!",
            });
          })
          .catch(function (error) {
            res.status(500).send({
              message: "failure",
              error,
            });
          });
      })
      .catch((error) => {
        res.status(500).send({
          message: "failure",
          error,
        });
      });
  } catch (error) {
    res.status(500).send({
      message: "could not upload the file " + req.file.originalname,
    });
  }
});
//Task:-2search Api To Find The PolicyInfo With the help of the username
app.get("/searchUserName", (req, res, next) => {
  let user = req.query.firstname;
  CSVSchema.aggregate()
    .match({
      firstname: user,
    })
    .project({
      policy_mode: 1,
      policy_end_date: 1,
      policy_type: 1,
      policy_start_date: 1,
    })
    .then((data) => {
      if (data.length > 0) {
        res.status(200).send(data);
      } else {
        res.status(400).send({
          message: "data is not present",
        });
      }
    })
    .catch((error) => {
      res.status(400).send({
        message: "data not exist",
      });
    });
});
//Task-3 Api to provide aggreagted policy by each user
app.get("/findAggregatedPolicy/:id", (req, res, next) => {
  if (mongoose.isValidObjectId(req.params.id)) {
    CSVSchema.aggregate()
      .group({
        _id: new ObjectId(req.params.id),
        Premium: { $sum: "$premium" },
        Policies: { $sum: 1 },
      })
      .then((result) => {
        if (result.length > 0) {
          res.status(200).send(result);
        } else {
          res.status(400).send({
            message: "The unique id is not exist",
          });
        }
      })
      .catch((error) => {
        res.status(400).send({
          message: error,
        });
      });
  } else {
    res.status(400).send({
      message: "ID is not valid",
    });
  }
});
//Task-4 create post -service that takes message ,day & time in body parameters and insert data into db
app.post("/message", (req, res, next) => {
  const { day, time, message } = req.body;
  const dayTime = new messageSchema({ day, time, message });
  dayTime
    .save()
    .then(function () {
      res.status(200).send({
        message: "Successfully Uploaded To messageSchema Database",
      });
    })
    .catch((error) => {
      res.status(500).send({
        message: "failure to add data",
        error,
      });
    });
});
//Task-5Track real time cpu utilization of the node server and on &0 % usage restart the server
function restartServer() {
  process.exit();
}
setInterval(() => {
  osUtils.cpuUsage((cpuPercent) => {
    if (cpuPercent > cpu_measurement) {
      restartServer();
    }
  });
}, 5000);

app.listen(port, () => {
  console.log(`connection is established at ${port}`);
});
