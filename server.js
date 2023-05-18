if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();


const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
var path = require('path');

app.use(express.static(path.join(__dirname, "public"))); //! static folder declaration

app.use(express.json())

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

app.use(cookieParser());
app.use(bodyParser.urlencoded({ limit: "10mB", extended: false })); //! for FORMS USAGE


const landingRouter = require("./routes/landing");
app.use("/", landingRouter);

const loginRouter = require("./routes/login");
app.use("/login", loginRouter);


const uuidRouter = require("./routes/uuid");
app.use("/", uuidRouter);


app.listen(3000);