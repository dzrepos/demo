##PrePaidPostPaid##

plan.js

const repo = require('../Model/schema.js');
const validator = require('../Utilities/validator');
const helper = require('../Utilities/helpers');

/*
    - This method should add new plan if details are valid and return appropriate message
    - Perform CRUD operations using await and by 'find' and 'create' whenever necessary  
    - If plan is already registered with same planValue and type then 
      Error message "Plan already registered" should be sent as resoponse with status code 400
    - Else if it is a new plan then validate type and planValue using validateType and validatePlanValue methods of Utilities/validator.js
    - If type is invalid then Error message "Plan type should be Postpaid or Prepaid" 
      should be sent as resoponse with status code 400
    - If planValue is invalid then Error message "Plan value should be greater than 39" 
      should be sent as resoponse with status code 400
    - if both type and planValue are valid then insert the plan details  return inserted plan object  
      as response with status code 201 
    - Hint: Use generatePlanId method of Utilities/helper.js for planId generation no
      
*/

exports.addPlan = async (req, res,next) => {
  var result=req.body;
  // planId: { type: String, unique: true },
  // planValue: Number,
  // gbPerDay: Number,
  // addOns: String,
  // unLimitedCalls: Boolean,
  // type: String
  const newPlan = await repo.find({planValue:result.planValue,type:result.type})
  // console.log(newPlan,newPlan.length)
    if(newPlan.length>0){
        // let err =  new Error("Plan already registered")
        // err.status = 400
        // throw err
res.status(400).json({message:"Plan already registered"})
    }
    else{
        if(validator.validateType(req.body.type) && validator.validatePlanValue(req.body.planValue)){


            let newData = req.body
            if(newData['planValue']<39){
              res.status(400).json({"message":"Plan value should be greater than 39"})
              return;
            }
            // console.log("huhhhkjh")
            newData["planId"] = await helper.generatePlanId(newData['type'])
            console.log(newData)
            const addData = await repo.create(newData)

                res.status(201).json({"message":addData})
          


        }else
        if(!validator.validateType(req.body.type)){
            
            res.status(400).json({message: "Plan type should be Postpaid or Prepaid" })
            
        }else
        if(! validator.validatePlanValue(req.body.planValue)){
        
            res.status(400).json({message: "Plan value should be greater than 39" })
        }
      }

}

/*
    - This method should update gbPerDay value for given planId and return appropriate message.
    - Perform CRUD operation using await and by using 'updateOne'  
    - If plan not updated, Error message "Plan is not updated" should be 
      sent as resoponse with status code 400
    - Else if plan is updated it should return message "Plan updated successfully" 
      as response with status code 200 
      
*/
exports.updatePlan = async (req, res) => {
  // var result=req.params.planId
  // const data1=await repo.findOne({planId:result})
  // const data=await repo.updateOne({planId:req.params.planId},
  //  { $set :{gbPerDay:req.body.gbPerDay}},
  // {runValidators:true,new:true})
  // if (data){
  //   res.status(200).json({message: "Plan updated successfully"})
    
  // }
  // else{
  //   res.status(400).json({message: "Plan is not updated" })
  // }
  const data=await repo.updateOne({planId:req.params.planId},
    {$set:{gbPerDay:req.body.gbPerDay}},
    {runValidators:true,new:true})
  console.log (data)
  if (data["nModified"]>0){
    res.status(200).json({message: "Plan updated successfully"})
  }
  else{
    res.status(400).json({message: "Plan is not updated" })
  }

}

/*
    - This method should fetch all existing plan details
    - Perform CRUD operation using await and by using 'find'  
    - If no plans available, Error message "Unable to fetch plan details" 
      should be sent as response with status code 400 
    - Else On successfull retrieval of details, it should return details
      as response with status code 200 
      
*/


exports.fetchPlanDetails = async (req, res) => {
  const data=await repo.find()
  if(data.length<=0){
    res.status(400).json({message:"Unable to fetch plan details" })
  }
  else{
    res.status(200).json({"message":data})
  }

}

/*
    - This method should delete plan based on planId and return appropriate message.
    - Perform CRUD operation using await and by using 'deleteOne'  
    - If plan not deleted, Error message "PlanId is not deleted" should be 
      sent as resoponse with status code 400
    - Else if plan is deleted it should return message "Plan deleted successfully" 
      as response with status code 200 
      
*/



exports.deletePlan = async (req, res) => {
  const data=await repo.deleteOne({planId:req.params.planId})
console.log(data)
if(data.deletedCount<=0){
  res.status(400).json({message:"PlanId is not deleted" })
}
else{
  res.status(200).json({message:"Plan deleted successfully"}
    )
}


}

//This method should handle all the invalid requests
/* 
    1. Send the json response in below format with status code 404
       {message : "Resource not found"}
*/

exports.invalid = async (req, res) => {
  res.status(404).json({message : "Resource not found"})

};






helper.js

const repo = require('../Model/schema');

exports.generatePlanId = async (type) => {
  const planDetials = await repo.find({ type: type })
  if (type.toUpperCase() == "PREPAID") {
    // Concatenate PR10 with the length of planDetails and return it
    return "PR10"+planDetials.length+1
  }
  else {
    // Concatenate PO10 with the length of planDetails and return it
    return "PO10"+planDetials.length+1
  }
}








validator.js


/* 
    Validation of planValue and type should be coded below
    DO NOT change function names.
*/

////////////////////////////////////////////////////////////////////////

/*
    - This method should validate the planValue
    - If the planValue is less than 39 it should return false, Else it should return true
    - Example:
            if planValue(dataType:Number) is 45, method should return true
            if planValue(dataType:Number) is 17, method should return false                  
                   
*/

exports.validatePlanValue = (planValue) => {
  // Code Here
  if(planValue<39
      return false
  return true

}

/*
  - This method should validate the type
  - If type is POSTPAID or PREPAID (CaseInsensitive Comparision should be done) then it should
    return true; else false
  - Example:
          if type(dataType:String) is 'PostPaid', method should return true
          if type(dataType:String) is 'post', method should return false                  
                 
*/

exports.validateType = (type) => {
  // Code Here
  if(type.toLowerCase() == "postpaid" || type.toLowerCase() == "prepaid"  )
      return true
  return false
 
}







routing.js

const express = require('express');
const routing = express.Router();
const plan = require('../Controller/plan');

// Routing for add new plan
// Invoke addPlan method from the controller
//---------------------------------------------------------------------------------------
routing.post("/addPlan",plan.addPlan)

// routing.post('/addPlan',plan.addPlan pi)
// Routing for fetching plan details
// Invoke fetchPlanDetails method from the controller
//---------------------------------------------------------------------------------------
routing.get('/viewPlans',plan.fetchPlanDetails)
// Routing for updating plan details
// Invoke updatePlan method from the controller
// Pass planId as Route Parameter
//---------------------------------------------------------------------------------------
routing.put('/updatePlan/:planId',plan.updatePlan)

// Routing for deting plan details
// Invoke removePlan method from the controller
// Pass planId as Route Parameter
//---------------------------------------------------------------------------------------
routing.delete('/removePlan/:planId',plan.deletePlan)

// Routing for all other invalid routes
// Invoke invalid method from the controller
// Should handle Get, Post, Put and delete requests
//---------------------------------------------------------------------------------------
routing.all('*',plan.invalid)

module.exports = routing;







