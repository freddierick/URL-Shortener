const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
const yup = require("yup");
const monk = require("monk");
const geoip = require('geoip-lite');
const { nanoid } = require("nanoid");
const { lookup } = require("geoip-lite");
const slowDown = require('express-slow-down');
const rateLimit = require('express-rate-limit');
const axios = require('axios');


require('dotenv').config();

const app = express();
const db = monk(process.env.mongoURI);
const urls = db.get("urls");
urls.createIndex({ id: 1 } , { unique: true});

 




// app.use(helmet());
app.use(morgan(`tiny`));
app.use(cors());
app.use(express.json());
app.use(express.static(`./public`));
app.set('view engine', 'ejs')
app.set('views', './views')

const schema = yup.object().shape({
    id: yup.string().trim().matches(/^[\w\-]+$/i),
    url: yup.string().trim().url().required(),
})

app.get(`/`, (req,res) => {
    res.render("index.ejs",{
        error:req.query.error || null,
        response: req.query.response || null,
    })
})

app.post(`/`, (req,res) => {
    let { id,url } = req.body;
    console.log(req.body)

    

})

app.get((req,res) => {
    res.json({
        message: `fre.rest - a easy way to shorten your URLs! | Go to fre.res/ to create one now!`
    })
})

app.get(`/:id/data`, async (req,res) => {
    res.set("Content-Security-Policy", "default-src 'none'");
    try {
    const {id} = req.params;
    const url = await urls.findOne({id});
    delete url._id
    res.json(url)
} catch (error) {
    res.json({message:"That URL ID was not found!"})
}
})

app.get(`/:id`, async (req,res) => {
    const {id} = req.params;
    try {
        const url = await urls.findOne({id});
        console.log(url)
        if (url){
            let remIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            const ipInfo = geoip.lookup(remIP);
            toAdd={
                country:ipInfo.country,
                region:ipInfo.region,
                city:ipInfo.city,
                time:Date.now()
            }
            await urls.update({id:id},{$push: {hits:toAdd}});
            res.redirect(url.url)
        }
    res.redirect(`/?error=${id} not found!`)
    } catch (error) {
        console.error(error)
        res.redirect(`/?error=Link not found!`)

    }
})

app.post(`/url`,slowDown({
    windowMs: 30 * 1000,
    delayAfter: 1,
    delayMs: 500,
  }), rateLimit({
    windowMs: 1 * 1000,
    max: 1,
  }), async (req,res,next) => {
    let { id,url } = req.body;
    try {
        if (!id || id==null || id==``){
            id=nanoid(5);
        }
        id = id.toLowerCase();
        const newUrl = {
            url,
            id,
        }
        const created = await urls.insert(newUrl);
        delete created._id;

        res.json(created)

    } catch (error) {
        next(error);
    }
})
app.use((error, req, res, next) => {
    if (error.message.startsWith("E11000")) error.message="That id is all ready in use!"
    if (error.status) {
      res.status(error.status);
    } else {
      res.status(500);
    }
    res.json({
      message: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack,
    });
  });
const port = process.env.PORT || 3000;

app.listen(port, ()=> {
    console.log(`Listening at  http://localhost:${port}`)
})