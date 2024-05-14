##SkillTechi.#
routing.js

const express = require('express');
const routing = express.Router();
const controller = require('../Controller/Techie');

//Routing for register techie to app
// Invoke addTechie method from the controller
routing.post('/techies',controller.addTechie) 
//---------------------------------------------------------------------------------------
//Routing to fetch techie with particupar technology skills
// Invoke fetchTechiesForTechnology method from the controller and pass technology as route parameter
routing.get('/techies/:technology',controller.fetchTechiesForTechnology)

//---------------------------------------------------------------------------------------

//Routing to delete one techie from the collection
// Invoke deleteTechie method from the controller and pass email as route parameter
routing.delete('/techies/:email',controller.deleteTechie)

//-------------------------------------------------------------------------------
// Routing to handle the request to update the skill set of the registered techie.
// Invoke updateSkills method from the controller and pass email as route parameter
routing.put('/techies/:email',controller.updateSkills)

//---------------------------------------------------------------------
// Routing to handle invalid requests[all http methods].
// To the invalid requests, 
// Create error object with message as 'Invalid Route' and status as status as 404 and pass it to next method
routing.all('*',(req,res,next)=>{
    let err=new Error('Invalid Route')
    err.status=404
    next(err)
})


module.exports = routing;



controller.js

let controller = {};
let validator=require('../Utilities/validator')
let experts=require('../Model/Schema')
//import necessary modules

//This API registers new techie to the app for a POST request.
// It fetches techie details from request body, validates the details by invoking appropriate methods of utilities/validator.js

//If techie found, [hint: check the return data length != 0] the API sends a response as { status: 'error',message: 'Techie already exists'} with status code 406.
//If contact number is invalid, it sends the response as:{ status: 'error',message: "Invalid contact number",} with a status code 406.

// If all the details are valid, this API checks whether a techie with the same email is already present
//by using appropriate mongoDB query to the mongoose model present in Model/schema.js

//If techie found, the API sends a response as { status: 'error',message: 'Techie already exists'} with status code 406.
// If techie not found, creates a new model object and saves it to database using it appropriate mongo query.

// On successfull insertion, sends response as { message: "Added a new Techie: <techie name>"  }
// with a status code 200.

// All the code should be wrapped in try-catch block, all the caught errors should be passed
//to the error handler.
controller.addTechie = async (req, res, next) => {
    try{
    var data=req.body
    var result= await experts.find({'email':req.body.email})
    if(result.length>0){
        res.status(406).json({ status: 'error',message: 'Techie already Exists'})
        return

    }
    if(validator.validateEmail(data['email']) && validator.validateContact(data['contact'])){
        var getdata=await experts.find()
        var length=getdata.length+1
        var inserted=await experts.create(data)
        if(inserted){
            res.status(200).json({ message: "Added a new Techie:"+inserted['name']})
            return;
        }
        
    }
    else if(!validator.validateEmail(data['email'])){
        res.status(406).json({ status: 'error', message: "Invalid email"})
        return
    }
    else if(!validator.validateContact(data['contact'])){
        res.status(406).json({ status: 'error', message: "Invalid contact number"})

        return
    }
    }
    catch(err){
        next(err)
    }
};
// -------------------------------------------------------------------------------------



// This method fetches techies with particular technology skills for a GET request
// with appropriate query to the mongoose model present in Model/schema.js

// If no techies found for particular technology skills,
// Sends the response as { status: 'error',message: 'No techie with specified technical skills'}
// With a status code 404.

//Else sends a response with the fetched techie details with a status code 200.

// All the code should be wrapped in try-catch block
//and all the errors should be passed to the error handler.
controller.fetchTechiesForTechnology = async (req, res, next) => {
    try{
        var technology=req.params.technology
        var result= await experts.find({"skills.technology":technology})
        if(result.length<=0){
            res.status(404).json({ status: 'error',message: 'No techie with specified technical skills'})
            return;
        }
        res.status(200).json(result)
    }
    catch(err){
        next(err)

    }
};


// -------------------------------------------------------------------------------------

//This method deletes one techie from the collection according to the email for a DELETE
//request by appropriate query to the mongoose model present in Model/schema.js.

// On successful deletion, sends the response as { message: "Removed Techie with email: <email>"}
// with a status code 200.
//Else sends a response as { status: 'error', message: 'Invalid Email',} with a status code 404.

//All the code should be wrapped in try-catch block
// and all the errors should be passed to the error handler.
controller.deleteTechie = async (req, res, next) => {
    try{
        var email=req.params.email
        var result=await experts.deleteOne({"email":email})
        // console.log(result)
        if(result.n>0){
            res.status(200).json({ message: "Removed Techie with email: "+email})
        }
        else{
            res.status(404).json({ status: 'error', message: 'Invalid Email'})

        }
        

    }
    catch(err){
        next(err)
    }
};

// -------------------------------------------------------------------------------------

// This method updates techie details for a PUT request to the mongoose model present in Model/schema.js.

// The new technology and the new proficiency are fetched from the request body,
// And the email is fetched from the routing parameters.

// This method checks whether a techie is present in db with the email, and with the new technology in his/ her skills array.
// If yes, update the proficiency of the technology to the new one
// If not, push the new technology with the corresponding proficiency to the skills array of the techie.

// On successfully updating the details, send the response as { message: "Skill updated" } with a status code 200.

// Else if the techie with the given email is not present in db,
// Sends the response as { status: 'fail', message:  "Skill not updated -- Techie not registered"}
// with a status code 400.

//Wrap the complete code with try-catch block, and pass all the errors to error handler.
// db.experts.find({"email":"deepthy.j@infosys.com","skills":{$elemMatch:{technology:"Angular"}}})
// db.experts.update({"email":"deepthy.j@infosys.com","skills":{$elemMatch:{technology:"Angular"}}},{$set:{"skills.$.proficiency":"intermediate"}})
controller.updateSkills = async (req, res, next) => {
    try{
        var data=req.body
        var email=req.params.email
        var result=await experts.find({"email":email,"skills":{$elemMatch:{technology:data.technology}}})
        var result1=await experts.find({"email":email})

        if(result.length>0 || result1.length>0){
            upd=false
            
            if(result.length>0){
                
                var updated=await experts.update({"email":email,"skills":{$elemMatch:{technology:data.technology}}},{$set:{"skills.$.proficiency":data.proficiency}})
                upd=true

            }else if(result1.length>0){
                var updated1=await experts.update({"email":email},{$addToSet:{"skills":data}})
                upd=tru

            }
            if(upd==true){
                res.status(200).json({message: "Skill updated"})
            }
        }else{
            res.status(400).json({ status: 'fail', message:  "Skill not updated -- Techie not registered"})

        }
    }
    catch(err){
        next(err)
    }
};

module.exports = controller;




errorlogger.js

//import necessary modules
const fs=require('fs');

//Complete the middleware to log errors in ErrorLogger.txt file
// If error status present, set the response status as the status of the error.
// Else, set the response status as 500
// Send the response as { status: 'error', "message": <Error message> }

const errorLogger = (err, req, res, next) => {
    if(err){
        fs.appendFile('ErrorLogger.txt','',(error)=>{
            if(error){
                console.log(error)
            }
        });
        if(err.status){
            res.status(err.status)
        }
        else{
            res.status(500)
        }
        res.json({ status: 'error', "message": err.message })
        
    }
};

module.exports = errorLogger;


validator.js

const validator = {};

validator.validateContact = (contact) => {
  //Validate the contact number
  if(contact.length==10){
    return true;
  }
  return false
  //Return true if the length of the contact number is 10, else return false
};

validator.validateEmail = (email) => {
  //Validate the email
  if(/\S+@\S+\.\S+/.test(email)){
    return true
  }
  return false
  //Return true if the email is in correct format, else return false
};

module.exports = validator;


