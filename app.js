//jshint es-6
const express = require('express');
const ejs = require("ejs");
const bodyParser=require("body-parser");
const _ = require("lodash");
const mongoose = require("mongoose");
var validator = require("email-validator");
var nodemailer = require('nodemailer');

mongoose.connect("mongodb+srv://bhuvanesh-admin:xyz123@456@website.ckfrs.mongodb.net/Hotels", {useNewUrlParser: true,useUnifiedTopology: true});
const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.set("view engine",'ejs');
app.use(express.static("public"));

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'easerooms123@gmail.com',
    pass: 'xyz123@456'
  }
});

const hotelSchema = {
  name: String,
  images: Array,
  description: String,
  city: String,
};
const bookingSchema = {
  name: String,
  email:String,
  phone:String,
  message:String,
  to_date:Date,
  from_date:Date,
  hotel:String,
};
const querySchema = {
  name: String,
  email:String,
  phone:String,
  message:String,
};


let cities = ["bengaluru","mumbai","kolkata","chennai","delhi"];
var error="";
const Hotel = mongoose.model("hotel", hotelSchema);
const Booking = mongoose.model("booking", bookingSchema);
const Query = mongoose.model("query", querySchema);

app.get('/', (req, res) => {
  res.render("index");  
})

app.get('/about', (req, res) => {
  res.render("about");
})

app.get('/contact', (req, res) => {
  res.render("contact",{
    error:error
  });
})

app.get('/hotels', (req, res) => {
  res.render("cities");
})

app.get('/contact/thankyou', (req, res) => {
  res.render("thankyou_contact");
})


app.get("/:cityName/hotels", function(req, res){
  const requestedCity = _.lowerCase(req.params.cityName);
  cities.forEach(function(city){
    const storedTitle = _.lowerCase(city);
    if (storedTitle === requestedCity) {
      Hotel.find({city:requestedCity},function(err, foundItems){
        if (foundItems.length != 0){
          res.render("hotels", {
            title: requestedCity,
            hotelList: foundItems
          });
        }
      });
    }
  });

});

app.get("/hotel/:hotelName", function(req, res){
  const requestedHotel = req.params.hotelName;
  res.render("hotel-details", {
    hotel: requestedHotel,
    error:error
  });
});

app.post('/hotel/:hotelName', (req, res) => {
  const requestedHotel = req.params.hotelName;
  var name=req.body.name;
  var email=req.body.email;
  var phone=req.body.phone;
  var message=req.body.message;
  var to_date=req.body.to_date;
  var from_date=req.body.from_date;
  var isValid=validator.validate(email);
  console.log(to_date);
  console.log(isValid);
  if(phone.length!=10 || name.length==0 || message.length==0 || to_date<from_date){
    isValid=false;
  }
  if(!isValid){
    error="Please enter valid details";
    res.render("hotel-details",{
      hotel: requestedHotel,
      error:error
    });
  }
  else{
    var mailOptions = {
      from: 'easerooms123@gmail.com',
      to: email,
      subject: 'Regarding your recent booking',
      html: '<h1>Hello Customer,</h1><p>We have successfully booked your room.</p>'        
    };
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        error=error;
      } else {
        console.log('Email sent: ' + info.response);
        res.render("thankyou_contact");
      }
    });

    Booking.insertMany([{
      name:name,
      email:email,
      phone:phone,
      message:message,
      to_date:to_date,
      from_date:from_date,
      hotel:requestedHotel,
    }], function(err){
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully booked.");
      }
    });
  }
});


app.post('/contact', (req, res) => {
    var name=req.body.name;
    var email=req.body.email;
    var phone=req.body.phone;
    var message=req.body.message;
    var isValid=validator.validate(email);
    console.log(isValid);
    if(phone.length!=10 || name.length==0 || message.length==0){
      isValid=false;
    }
    if(!isValid){
      error="Please enter valid details";
      res.render("contact",{
        error:error
      });
    }
    else{
      var mailOptions = {
        from: 'easerooms123@gmail.com',
        to: email,
        subject: 'Regarding your recent query',
        html: '<h1>Hi Customer,</h1><p>We have considered your query, we will review it and get back to you ASAP.</p>'        
      };
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          error=error;
        } else {
          console.log('Email sent: ' + info.response);
          res.render("thankyou_contact");
        }
      });

      Query.insertMany([{
        name:name,
        email:email,
        phone:phone,
        message:message,
      }], function(err){
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully booked.");
        }
      });
    }
  });

let port = process.env.PORT;
if (port == null || port == "") {
    port = 3000;
}
module.exports= app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})