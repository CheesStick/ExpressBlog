const express = require('express');

const fs = require('fs');
const morgan = require('morgan');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const blogRoutes = require('./routes/blogRoutes');
const userRoutes = require('./routes/userRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middlewares/authMiddleware');

// express app
const app = express();

// load congfig
dotenv.config({path: path.join(__dirname, 'config/config.env')});

// connect to mongodb
const dbURI = process.env.MONGO_URI;

mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false })
  .then(conn => {
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        app.listen(process.env.PORT, 
        console.log(`Server is runing in ${process.env.NODE_ENV} on ${process.env.PORT}`));
  })
  .catch(err => console.log(err));

// register a view engine
app.set('view engine', 'pug');

// global middlewares
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
app.use(authMiddleware.limiter);
app.use(express.json({limit: '10kb'}));
app.use(mongoSanitize());
app.use(xss());
app.use(hpp());
app.use(cookieParser());

// log requests to the file access.log
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), {flags: 'a'});
app.use(morgan('dev', {stream: accessLogStream}));

app.get('*', authMiddleware.checkUser);

// root routes
app.get('/', (req, res) => res.redirect('/blogs'));

app.get('/about', (req, res) => res.render('about', {title: 'About'}));

// blog routes
app.use('/blogs', blogRoutes);

// user routes
app.use(userRoutes);

// auth routes
app.use(authRoutes);

// 404 page
app.use((req, res) => res.status(404).render('404', {title: '404'}));