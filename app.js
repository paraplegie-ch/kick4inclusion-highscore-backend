var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient()
const SHA2 = require("sha2");
const cors = require("cors");

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());

app.get('/score', async (req, res) => {
  const scores = await prisma.score.findMany({
    select: {
      NAME: true,
      SCORE: true
    },
    orderBy: {
      SCORE: 'desc'
    }
  });

  res.send(scores);
});

app.put('/score', async (req, res) => {
  const scoreJson = req.body;

  const hash = SHA2.SHA512(getHashString(scoreJson)).toString("hex");
  console.log(hash + " | " + scoreJson.ver);
  const valid = hash === scoreJson.ver;

  if (valid) {
    const score = await prisma.score.findUnique({
      where: {
        NAME: scoreJson.name,
      }
    })

    if(score) {
      if (score.SCORE < scoreJson.score) {
        const updateUser = await prisma.score.update({
          where: {
            NAME: scoreJson.name,
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
          NAME: scoreJson.name,
          // MAIL: scoreJson.mail,
          SCORE: parseInt(scoreJson.score),
          TIMESTAMP: new Date(),
        },
      })
    }
    res.send();
  } else {
    console.log("CHEAT");
    res.send();
  }
});

function getHashString(score) {
  const surnameHash = score.name.split("").reverse().join("");
  const scoreHash = parseInt(score.score) * 1892;
  // const mailHash = score.mail.split("@")[0] + "|" + score.name;

  return surnameHash + scoreHash;
}

module.exports = app;
