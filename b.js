







##Banking##

const bank = require('../Model/DataAccess');
const validator = require('../Utilities/validator');
const helper = require('../Utilities/helpers');



newTrans

/*1. Retrive the exsiting card details and pin no as 
    findOne({"cardNo": cardNo},{_id:0})
    find({"cardNo": cardNo},{_id:0,pinNo:1})

2.Validate CardNo and PIN.In case validation fails then create new error 
object with the message in json format as below:
  { "results":"Must enter 12 digit card number and 4 digit PIN"} and 
  set status code 404 with status as fail

3. Check if transAmount>card_data balance. If it fails return the json 
response as status: 'fail', message: 'Insufficient amount in an account'

4.If card details already present,then check its PIN. If PIN matched,then on 
successful validation of all
  method should generate new Transaction ID for that particular card data by 
  updating using <updateOne({"cardNo":cardNo},{ $addToSet: {"transaction.transNo":Id}})>
  the transaction id array return with the message in json format as below:
  { "message":"Transaction <<new_Transaction_id>> successful"} and set status 
  code 200 with status as success 
  Else, return with the message in json format as below:
  { "results":"Enter correct PIN"} and set status code 404 with status as fail and 
  incase of insufficient balance message in json format as below:
  { "message":"Insufficient amount in an account"} and set status code 401 with status as fail
4.In case of any error occured then return with the message in json format as below:
  { "message":"Something went wrong"} , and set status code 400 with status as fail */


*/
exports.newTrans = async (req, res,next) => {
  //perform CRUD operation using await
  try{
    let p= req.body.cardNo
    let e=await bank.findOne({"cardNo": p},{_id:0})
    
    if(!(validator.ValidateCardNo(p) && validator.ValidatePIN(req.body.pinNo))){
      // res.status(404).json({status:"error",message:"Enter valid Card Number"})
      let err =new Error({ status:"fail","results":"Must enter 12 digit card number and 4 digit PIN"})
      err.status=404
      throw err
      return
     
    }
    let tamount = req.body.transAmount
    let bamount = e.balance
    if(bamount<tamount){
      res.status(401).json({status: 'fail', message: 'Insufficient amount in an account'})
      return
    }    
    if(e.cardNo){
      if(e.pinNo===req.body.pinNo){
      if(e.password===req.body.password){
        let ntrns=await bank.findOne({cardNo:p})
        ntrns=ntrns.transaction.transNo.length
        trnsid="T"+(500+ntrns+1)
        let result=await bank.updateOne({"cardNo":p},{ $addToSet: {"transaction.transNo":trnsid}})
      if(result){
        res.status(200).json( { status:"success","message":`Transaction ${transid} successful`})
        return
      }
      
      }
    }
    else{
      res.status(404).json({ status:"fail","results":"Enter correct PIN"})
      return
    }
  }
    

  }
  catch(err){
    res.status(400).json({ status:"fail","message":"Something went wrong"})
    next(err)


  }


}

/*
getTransaction
*1. Impl the findOne method with following signature 
{"cardNo": cardNo},{cardStatus:1,password:1}).

2.If the status of the card is LOST then return json response as
  { "message":"Could not fetch details as Card is LOST"} and set status code 401
   with status as fail
   Else,  check for the password received in url equals to one in database
   retrive with find method the customer details as
    {"cardNo": cardNo},{custName:1,balance:1,points:1,transaction:1,_id:0})

3. send the data fetched as json response and set the status code 200 with status as success    status: 'success', data:{transDetails} 
    else return status: 'fail',
          message: 'Enter correct password' 
4.In case of any error occured then return the message in json format as below:
  { "message":"Something went wrong"} , and set status code 400 with status as fail 
*/

exports.getTransaction = async (req, res,next) => {
  //perform CRUD operation using await  
  try {
    const data = await bank.findOne({ cardNo: req.params.cardNo }, { cardStatus: 1, password: 1 })
    // if (data) {
      // console.log(data)
      if (data.cardStatus.toLowerCase() === 'lost') {
        // let err = new Error("Could not fetch details as Card is LOST");
        // err.status  = 401
        // throw err;

        res.status(401).json({ status: 'fail', message: "Could not fetch details as Card is LOST" })
      }
      else{
      if (req.params.password === data.password) {
        let cus = await bank.findOne({ cardNo: req.params.cardNo }, { custName: 1, balance: 1, points: 1, transaction: 1, _id: 0 })
        if (cus) {
          res.status(200).json({ status: 'success', data:  {cus}  })
        }
        // else {
        //   res.status(400).json({ "message": "Something went wrong" })
        // }
      }
      else {
       
        res.send({
          status: 'fail',
          message: 'Enter correct password'
        })
      }
    }
  // }else{
  //     res.status(400).json({ "message": "Something went wrong" })
  // }

  }
  catch (err) {
    
    res.status(400).json({status:"fail",message: "Something went wrong" })
    next(err)
  }

}



/*
deleteTrans
* Firstly check for card status with find({"cardNo": cardNo},{cardStatus:1}),
then, use deleteOne operator for this operation.

1.If the status of the card is LOST then this method should be able to
 delete details of the card.
  Else, return the message in json format as below:
  { "message": "The card details cannot be removed because its in use"} and 
  set status code 401 with status as fail 
2.On successful deletion, send the response in json format as below:
 { "message": "Card details removed successfully"} and set status code 200 with status as success 

3. On Catch, return the error message as json with below format
    status: 'fail',
    message: 'Something went wrong' 

*/


exports.deleteTrans = async (req, res,next) => {
  //perform CRUD operation using await  
  try{
    let p=await bank.findOne({"cardNo":req.params.cardNo})
    if(p.cardStatus=="LOST"){
      let e=await bank.deleteOne({"cardNo":req.params.cardNo})
      if(e){
        res.status(200).json({ "message": "Card details removed successfully"})
      }
    }
    else{
      res.status(401).json({ "message": "The card details cannot be removed because its in use"})
    }


  }
  catch(err){
    res.status(400).json({status: 'fail',
    message: 'Something went wrong' })
    // let error=new Error('Something went wrong')
    //  error.status='fail'
    //  throw error
     
    next(err)
    
  }


}


/*
updatePoints

1. Fristly, retrive the customer information using findOne methods with 
signature {"cardNo": cardNo},{password:1,_id:0}
2.Send the data in the request body(cardNO,password,amount) and 
    If validations (password from database and request match, customer 
      validator card no) are successful this method should allow user to 
  update points based on the below conditions:
    - If transaction < 5000 then reward points 250 must be added 
    - If transaction >= 5000 and transaction <= 10000 then reward points 500 must be added
    - If transaction >10000 and transaction <= 15000 then reward points 750 must be added
  Else, return the message in json format as below:
   { "message": "Card number mismatch or Incorrect password" } and set status code 401 with status fail
3.On successful updation {use UpdateOne} with $inc to update the points, send the response in json format as below:
   { "message": "Updated points are <<show_points>> " } and set status code 200 with status success
4.else, return  the message in json format as below:
   { "message":"Something went wrong"} , and set status code 400 with status as fail

*/
exports.updatePoints = async (req, res) => {
  //perform CRUD operation using await  
  try{
    let p=await bank.findOne({"cardNo": req.body.cardNo},{password:1,_id:0})
    if(p.password===req.body.password){
      let points
      if(p.balance<5000){
        points=250
      }
      else if(p.balance>=5000 && p.balance<=10000){
        points=500

      }
      else if(p.balance>10000 && p.balance<=15000){
        points=750
      }
      let e=await bank.updateOne({"cardNo": req.body.cardNo},{$inc:{points:points}})
      if(e.updatedCount>0){
        res.status(200).json({ "message": "Updated points are "+points })
      }
    }
    else{
      res.status(401).json({ "message": "Card number mismatch or Incorrect password" })
    }

  } 
  catch(err){
    res.status(400).json({ "message":"Something went wrong"})

  } 

}
O

/* Invalid Handle all invalid routers with status code as 400 and status, body as
status: 'fail',
message: 'Invalid request' */

exports.invalid = async (req, res) => {
  res.status(400).json({status: 'fail',
  message: 'Invalid request'})

};



let validator = {}

/*

This method should check wthether card number have minimum of 12 digits
If not validated return false else true

*/

validator.ValidateCardNo = function (cardNo) {
if(cardNo.toString().length >= 12){
    return true;
}
else{
return false;
}
}


/*

This method should check wthether pin is 4 digits. 
If validated return true else false 

*/

validator.ValidatePIN = function (pinNo) {
if(pinNo.toString().length === 4){
    return true;
}
else {
    return false;
}
}
Routing



module.exports = validator;
8888888888
routing:
const express = require('express');
const routing = express.Router();
const validator = require('../Utilities/validator');
const method = require('../Service/BankService');

/*configure the router object to handle the POST request to '/transactions'
perform a new transaction using newTrans of Service/BankService.js, request body holds the details of the new transaction
*/
routing.post('/transactions', method.newTrans
)


/*configure the router object to handle the GET request to '/transactions/:cardNo/:password'
dispaly the transaction details using the getTransaction of Service/BankService.js, pass request body as parameter
*/
routing.get('/transactions/:cardNo/:password', method.getTransaction )


/*configure the router object to handle the PUT request to '/rewards'
update the user points depending on the transaction amount using updatePoints of Service/BankService.js
*/
routing.put('/rewards', method.updatePoints )



/*configure the router object to handle the DELETE request to '/remove/:cardNo'
Delete the card information using deleteTrans of Service/BankService.js, pass request body as parameter
*/
routing.delete('/remove/:cardNo', method.deleteTrans )



/*configure the router object to handle the ALL invalid request by invoking the invalid method in service

*/
routing.all('*',method.invalid)

module.exports = routing;


---------------------------------xxxxxxxxxxxxxx--------------------xxxxxxxxxx------------------xxxxxxxxxxx------

// bank.js(Modification:Controllers.register)

//Bank.js
//Validator
// If password is invalid, return false
validator.validatePassword = function (password) {
  const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*[A-Z]).{8,}$/;
  if (password.match(passwordRegex)) {
    return true;
  } else {
    return false;
  }
};

//ValidatePan
validator.validatePan = function (pan, name) {
  if (pan.length == 10 && pan[3] == "P" && pan[4] === name[0]) {
    return true;
  } else {
    return false;
  }
};

//ValidateAge
validator.validateAge = function (dob) {
  const currentDate = new Date();

  const birthDate = new Date(dob);

  const ageDifference = currentDate.getFullYear() - birthDate.getFullYear();
  if (ageDifference > 25) {
    return true;
  } else {
    return false;
  }
};

//ValidateAccountType
validator.acctType = function (account) {
  if (account === "S" || account === "C") {
    return true;
  }
  //else{}
  return false;
};

//Conytroller<--->Bank.js
//register
controllers.register = async (req, res) => {
  try {
    const isPanValid = validators.validatePan(
      req.body.panto,
      req.body.firstName
    );
    const isUsernameValid = validators.validateUsername(
      req.body.validateUsername
    );
    const isPasswordValid = validators.validatePassword(req.body.password);

    if (isPanValid && isUsernameValid && isPasswordValid) {
      const existingUser = await model.findOne({ username: req.body.username });

      if (existingUser) {
        res
          .status(400)
          .json({ status: "fail", message: "Username already exists" });
      } else {
        req.body.data = { internationalTrans: false };

        const newcustomer = await model.create(req.body);
        res.status(201).json({
          status: "success",
          message: "Customer registered",
          data: newcustomer,
        });
      }
    } else {
      if (!isPanValid) {
        res.status(400).json({ status: "fail", message: "Invalid PAN number" });
      } else if (!isUsernameValid) {
        res.status(400).json({ status: "fail", message: "Invalid Username" });
      } else {
        res.status(400).json({ status: "fail", message: "Invalid Password" });
      }
    }
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err,
    });
  }
};

//Check login details
controllers.checkLoginDetails = async (req, res) => {
  try {
    const customer = await model.findOne({
      username: req.body.username,

      password: req.body.password,
    });
    if (customer) {
      res.status(200).json({ status: "success", result: true });
    } else {
      res.status(200).json({ status: "fail", result: false });
    }
  } catch (error) {
    res.status(500).json({ status: "fail", message: error });
  }
};

//Controllers.account

controllers.account = async (req, res) => {
  try {
    const isAccountTypeValid = validators.acctType(req.body.acctType);
    if (!isAccountTypeValid) {
      res.status(400).json({ status: "fail", message: "Invalid Account Type" });
      return;
    }
    const customer = await model.findOne({ username: req.params.username });

    if (!customer) {
      res
        .status(400)
        .json({ status: "fail", message: "Customer details not found" });
      return;
    }

    if (isAccountTypeValid) {
      const newAccount = await helpers.accountDetails(req.body.acctType);

      const updatedCustomer = await model.findOneAndUpdate(
        { username: req.params.username },
        { $push: { accounts: newAccount } },
        { new: true }
      );

      res.status(201).json({
        status: "success",
        message: "Account details updated",
        data: updatedCustomer,
      });
    }
  } catch (error) {
    res.status(500).json({ status: "fail", message: error });
  }
};

//updateTrans

controllers.updateTrans = async (req, res) => {
  try {
    const customer = await model.findOne({ username: req.params.username });

    if (!customer) {
      res
        .status(400)
        .json({ status: "fail", message: "Customer details not found" });

      return;
    }

    const isAgeValid = validators.validateAge(customer.dob);

    if (!isAgeValid) {
      res.status(408).json({
        status: "fail",
        message: "Customer age should be greater than or equal to 25",
      });
      return;
    }

    const updatedCustomer = await model.findOneAndUpdate(
      { username: req.params.username },
      { internationalTrans: true },
      { new: true }
    );
    res.status(201).json({
      status: "success",
      message: "International transactions Updated",
      data: updatedCustomer,
    });
  } catch (error) {
    res.status(500).json({ status: "fail", message: error });
  }
};

//Fetch details
controllers.fetchDetails = async (req, res) => {
  try {
    const details = await model.findOne({ username: req.params.username });

    if (details) {
      res.status(200).json({ status: "success", result: details });
    } else {
      res
        .status(400)
        .json({ status: "fail", message: "Customer details not found" });
    }
  } catch (error) {
    res.status(500).json({ status: "fail", message: error });
  }
};

//helper.js----->If required
helper.accountDetails = async function (Type) {
  try {
    const maxAccount = await model
      .find({ accType: Type })
      .sort({ acctNo: -1 })

      .limit(1);

    let newAccount = 1;

    if (maxAccount.length > 0) {
      newAccount = maxAccount[0].acctNo + 1;
    }

    const newDetails = {
      acctNo: newAccount,
      accType: Type,
    };

    if (Type === "S") {
      newDetails.balance = 1000;
    } else if (Type === "C") {
      newDetails.balance = 5000;
    }

    return newDetails;
  } catch (error) {
    throw new Error("Error fetching account details");
  }
};
module.exports = helper;

//Routing
routing.post("/customers/register", controller.register);
routing.post("/customers/login", controller.checkLoginDetails);
routing.post("/customers/:username", controller.fetchDetails);
routing.post("/customers/:username/accounts", controller.account);
routing.post("/customers/:username", controller.updateTrans);

routing.use((req, res, next) => {
  const error = new Error("Invalid Route");
  error.status = 400;
  next(error);
});







