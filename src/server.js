const fs = require('fs');
const path = require('path');
const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;

const allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
    
    if ('OPTIONS' === req.method) {
        res.send(200);
    } else {
        next();
    }
};

app.use(allowCrossDomain);
app.use(bodyParser.json());
app.use(express.static('../dist/'));

app.get('/getenvironment/:process', (request, response) => {
    fs.readFile(__dirname + '/process-env/' +request.params.process.toUpperCase() + '/.env','utf8',(err, data) => {
        if (err) {
            response.send(err);
            return;
        }
        let lines = data.split(/\r?\n/);
        let result = {},temp;

        for(let i=0; i<lines.length;i++){
            temp = lines[i].split('=');
            result[temp[0]] = temp[1];
        }
        
        response.send(result);
    });
});

app.get('/setenvironment/:process/:key/:value', (request, response) => {
    fs.readFile(__dirname + '/process-env/' +request.params.process.toUpperCase() + '/.env','utf8',(err, data) => {
        if (err) {
            response.send(err);
            return;
        }
        let lines = data.split(/\r?\n/);
        let JSONtext = {},temp = '';

        for(let i=0; i<lines.length;i++){
            temp = lines[i].split('=');
            JSONtext[temp[0]] = temp[1];
        }
        
        JSONtext[request.params.key] = decodeURIComponent(request.params.value); // new value
        
        let keys = Object.keys(JSONtext);
        temp = '';
        for(let j=0;j<keys.length;j++) {
            if(j !== keys.length-1)
                temp += `${keys[j]}=${JSONtext[keys[j]]}\n`;
            else
            temp += `${keys[j]}=${JSONtext[keys[j]]}`;
        }

        fs.writeFile(__dirname + '/process-env/' +request.params.process.toUpperCase() + '/.env', temp, function (err) {
            if (err) {
                response.send(err);
                return;
            }
            response.send(JSONtext);            
        });         
    });
});

app.post('/addprocess',(request,response) => {
    let keys = Object.keys(request.body);
    let temp = '';

    function ensureDirectoryExistence(filePath) {
        if (fs.existsSync(filePath)) {
            console.log('directory exists');
        }
        else{
            fs.mkdirSync(filePath);
        }
        return true;
    }

    let dirCheck = ensureDirectoryExistence(path.join(__dirname,'/process-env/'+request.body.PROCESS.toUpperCase()));
    if(dirCheck){
        for(let j=0;j<keys.length;j++) { 
            if(j !== keys.length-1)
                temp += `${keys[j]}=${decodeURIComponent(request.body[keys[j]])}\n`;
            else
             temp += `${keys[j]}=${decodeURIComponent(request.body[keys[j]])}`;
        }
        
        fs.writeFile(__dirname + '/process-env/' +request.body.PROCESS.toUpperCase() + '/.env', temp, function (err) {
            if (err) {
                console.log('err:'+JSON.stringify(err));
                response.send(err);
                return;
            }
            response.send({'result':'success'});            
        }); 
    }
});


var getAllProcess = function(dir) {
    let files = fs.readdirSync(dir);
    let processList = [];
    files.forEach(function(file) {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        processList.push(file);
      }
    });
    return processList;
};

app.get('/getallprocess', (request, response) => {
    return response.send(getAllProcess(__dirname + '/process-env'));
});

app.get('/*', (request, response) => {
    response.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(port, (err) => {
  if (err) {
    return console.log('error occured', err)
  }

  console.log(`server is running on ${port}`)
})