const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const jwt = require('jsonwebtoken');
const {v4 : uuidv4} = require('uuid');
var network = require('./fabric/network.js');

const app = express()
app.use(morgan('combined'))
app.use(bodyParser.json())
app.use(cors())


const { promisify } = require('util')
const sleep = promisify(setTimeout)

/******************BLOCKCHAIN END POINTS START HERE ******************************************/  
// testing can be delteed fom here
app.post('/CreateCar', (req, res) => {

  console.log(req.body);    
    network.Org1("INVOKE",["CreateCar",req.body.carNumber, req.body.make, req.body.model,req.body.colour, req.body.owner])
      .then((response) => {
        console.log(response);
        res.send(response)
      });
    })

    // change car model

app.post('/ChangeCarOwner', (req, res) => {

  console.log(req.body);    
    network.Org1("INVOKE",["ChangeCarOwner",req.body.carNumber, req.body.newOwner])
      .then((response) => {
        console.log(response);
        res.send(response)
      });
    })

app.get('/QueryCar',(req,res) => {
  network.Org1("QUERY",["QueryCar", req.body.carNumber])
      .then((response) => {
        console.log("data is "+response)
        res.send(response)
      });
})

app.get('/QueryAllCars',(req,res) => {
  console.log(req.body);
  network.Org1("QUERY",["QueryAllCars"])
      .then((response) => {
        console.log("data is "+response)
        res.send(response)
      });
})
// till here





app.post('/initialize_contract', (req, res) => { 
  console.log(req.body);    

      network.Org1("INVOKE",["Initialize",req.body.name,
      req.body.symbol, req.body.nameKey])
      .then((response) => {
        res.send(response)
      });
    })  

app.post('/MintWithTokenURI', (req, res) => { 
  console.log(req.body);    

      network.Org1("INVOKE",["MintWithTokenURI",req.body.tokenId,
      req.body.tokenURI, req.body.nameKey])
      .then((response) => {
        res.send(response)
      });
    }) 

app.post('/TransferFrom', (req, res) => { 
  console.log(req.body);    

      network.Org1("INVOKE",["TransferFrom",req.body.from, req.body.to,
      req.body.tokenId, req.body.nameKey])
      .then((response) => {
        res.send(response)
      });
    }) 

app.get('/ClientAccountBalance_org1', (req, res) => { 
  console.log(req.body);    
      network.Org1("QUERY",["ClientAccountBalance"])
      .then((response) => {
        res.send(response)
      });
    })

app.get('/ClientAccountBalance_org2', (req, res) => { 
  console.log(req.body);    
      network.Org2("QUERY",["ClientAccountBalance"])
      .then((response) => {
        res.send(response)
      });
    })

app.get('/OwnerOf', (req, res) => { 
  console.log(req.body);    
      network.Org1("QUERY",["OwnerOf", req.body.tokenId])
      .then((response) => {
        res.send(response)
      });
    })


app.get('/ClientAccountID_org1', (req, res) => { 
  console.log(req.body);    
      network.Org1("QUERY",["ClientAccountID"])
      .then((response) => {
        res.send(response)
      });
    })

app.get('/ClientAccountID_org2', (req, res) => { 
  console.log(req.body);    
      network.Org2("QUERY",["ClientAccountID"])
      .then((response) => {
        res.send(response)
      });
    })
    
app.listen(process.env.PORT || 8081)
