//Dependencies
const express = require('express');
const mongoose = require('mongoose');
const handlebars = require('express-handlebars');
const logger = require('morgan');


let PORT = process.env.PORT || 3000;
let MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost/mongoHeadlines';

//Init Express
const app = express();

//Use morgan logger to log all requests
app.use(logger('dev'));
//Sets up the express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
//Uses the express.static middleware to serve the static portions of the app
app.use(express.static("public"));

app.engine('handlebars', handlebars({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

//Config database
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

//Connection Checks
let db = mongoose.connection;
db.on('error', (error) =>{
    console.log('Connection error ${error}');
});
require('./routes/routes.js')(app);

//Start Server
app.listen(PORT, ()=> {
    console.log(`App running on port ${PORT}`);
});