'use strict';

const express = require('express');
const cors = require('cors');

const ogs = require('open-graph-scraper-lite');
const cheerio = require('cheerio');

var corsOptions = {
  origin: 'http://localhost:4300',
  optionsSuccessStatus: 200, // For legacy browser support
  methods: "GET, POST"
}

// App
const app = express();

app.use(cors(corsOptions))

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// Constants
const PORT = 3300;
const HOST = '0.0.0.0';


app.get('/', (req, res) => {
    const options = { url: 'https://alpha.findcenter.com/topics/Meditation' , timeout: 5000,};
    ogs(options, (error, results, response) => {
    console.log('error:', error); // This is returns true or false. True if there was a error. The error it self is inside the results object.
    console.log('results:', results); // This contains all of the Open Graph results
    // console.log('response:', response); // This contains the HTML of page
    res.send(results);
    });
  
});

app.post('/og', function (req, res) {  
    var postData = req.body;
    const options = { url: postData.web_url , timeout: 5000,};
    ogs(options, (error, results, response) => {
    // console.log('error:', error); // This returns true or false. True if there was an error. The error itself is inside the results object.
    console.log('results:', results); // This contains all of the Open Graph results
    var og_title = ""
    var og_description = ""
    var og_imageURL = ""
    if(results.ogTitle!=undefined){
      og_title=results.ogTitle
    }
    if(results.ogDescription!=undefined){
      og_description=results.ogDescription
    }
    if(results.ogImage!=undefined && results.ogImage.url != undefined){
      og_imageURL=results.ogImage.url
    }

    var response_og= {
      "title":og_title,
      "description":og_description,
      "imageURL":og_imageURL
    }
    res.send(response_og);
    });

    
})

app.post('/og-meta', function (req, res) {  
  var postData = req.body;
  

  fetch(postData.web_url)
  .then(response => {
    const htmlText = response.text()
    console.log(htmlText);
    return htmlText;
  })
  .then(html => {
    console.log(html) 
    const $ = cheerio.load(html);
    // console.log($("meta[property='og:title']").attr("content"));
    var title = $('title').text();
    console.log("Title :",title);
    var description = $("meta[name='description']").attr("content");
    console.log("Description :",description);
    var imageURL = ""
    imageURL = $("meta[itemprop='image']").attr("content");
    console.log("imageURL ",imageURL);
    
    if($("meta[property='og:title']").attr("content") != undefined){
      title = $("meta[property='og:title']").attr("content");
    }
    if($("meta[property='og:description']").attr("content") != undefined){
      description = $("meta[property='og:description']").attr("content");
    }
    if($("meta[property='og:image']").attr("content") != undefined){
      imageURL = $("meta[property='og:image']").attr("content");
    }

    var ch_og_resp = {
      "title":title?title:"",
      "description":description?description:"",
      "imageURL":imageURL
    }

    res.send(ch_og_resp);
  })
  .catch(error =>{
    console.log("ERROR Scraper Fails: ",error);
  })

})

function haltOnTimedout (req, res, next) {
    if (!req.timedout) next()
  }

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);