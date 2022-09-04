var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.put('/score', async (req, res) => {
  const scoreJson = req.body;

  const score = await prisma.score.findUnique({
    where: {
      MAIL: scoreJson.mail,
    }
  })

  if(score) {
    if (score.SCORE < scoreJson.score) {
      const updateUser = await prisma.score.update({
        where: {
          MAIL: scoreJson.mail,
        },
        data: {
          SCORE: parseInt(scoreJson.score),
          TIMESTAMP: new Date()
        },
      })
    }
  } else {
    const user = await prisma.score.create({
      data: {
        FIRSTNAME: scoreJson.firstname,
        SURNAME: scoreJson.surname,
        MAIL: scoreJson.mail,
        SCORE: parseInt(scoreJson.score),
        TIMESTAMP: new Date()
      },
    })
  }
  res.send();
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
