//Validator
//Validate name
exports.validateName = (name) => {
  12;
  if (name.length >= 3 && name.length <= 15) {
    return true;
  } else {
    let err = new Error("Please enterys valid name with 3 to 15 characters");
    err.status = 400;
    throw err;
  }
};

//Validate phone number
exports.validatePhone = (phoneNo) => {
  if (/^\d(10)$/.test(phoneNo)) {
    return true;
  } else {
    let err = new Error("Please enter a valid phone number");
    err.status = 400;
    throw err;
  }
};

//Validate email
exports.validateEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9,-]+\.[a-zA-Z]{2,4}$/;
  if (emailRegex.test(email)) {
    return true;
  } else {
    let err = new Error("Please enter a valid email id");
    err.status = 400;
    throw err;
  }
};

//Validate url

exports.validateUrl = (url) => {
  const urlRegex = /^(https?:\/\/).+/;
  if (urlRegex.test(url)) {
    return true;
  } else {
    let err = new Error("Please enter a valid website URL");
    err.status = 400;
    throw err;
  }
};


//Error logger
const errorLogger = (err, req, res, next) => {
  const errorMessage = `${new Date().toISOString()} - ${err.stack}\n`;
  fs.appendFile("ErrorLogger.log", errorMessage, (appendErr) => {
    if (appendErr) {
      console.error("Error logging the error:", appendErr);
    }

    const statusCode = err.status || 500;
    res.status(statusCode).json({ message: err.message });
  });
};
module.exports = errorLogger;

//services---> Mallservices.js
//Invalid
exports.invalid = async (req, res) => {
  res.status(404).json({ message: "Invalid path" });
};

module.exports = exports;

//getMall
exports.getMall = async (req, res, next) => {
  try {
    const malls = await mallModel.find({ __V: 0 }, { __dirname: 0 });
    if (malls.length > 0) {
      res.json({ message: malls });
    } else {
      res.status(404).json({ message: "No data found" });
    }
  } catch (err) {
    next(err);
  }
};

//addMall
exports.addMall = async (req, res, next) => {
  try {
    const { name, contactNo, email, URL } = req.body;
    validators.validateName(name);
    validators.validatePhone(contactNo);
    validators.validateEmail(email);
    validators.validateUrl(URL);
    const mallId = helper.generateMallId();
    await mallModel.create({
      mallId,
      name,
      contactNo,
      email,
      URL,
      stores: [],
    });
    res.json({
      message: "Mall details are added successfully with mallId: " + mallId,
    });
  } catch (err) {
    next(err);
  }
};

//getstoreData
exports.getStoreData = async (req, res, next) => {
  try {
    const { mallId, storeId } = req.params;
    const mall = await mallModel.findOne(
      { mallId: mallId },
      { stores: { $elemMatch: { storeId } } }
    );
    if (mall || mall.stores.length > 0) {
      res.json({ message: mall.stores[0] });
    } else {
      res.status(404).json({ message: "No data found" });
    }
  } catch (error) {
    next(error);
  }
};


//updateStore
exports.updateStore = async (req, res, next) => {
  try {
    const { mailId, storeId } = req.params;
    const { floor, timings } = req.body;
    const result = await mallModel.updateOne(
      { mallId: mallId, "stores.storeId": storeId },
      {
        $set: {
          "stores.$.floor": floor,
          "stores.$.timing": timings,
        },
      }
    );

    if (result.nModified > 0) {
      res.json({ message: "The store details are updated" });
    } else {
      res.status(400).json({ message: "Unable to update the store details!" });
    }
  } catch (errог) {
    next(error);
  }
};

//deleteStore
exports.deleteStore = async (req, res, next) => {
  try {
    const { mallId, storeId } = req.params;
    const result = await mallModel.updateOne(
      { mallId: mallId },
      {
        $pull: {
          stores: {
            storeId: storeId,
          },
        },
      }
    );
    if (result.nModified > 0) {
      res.json({ message: "The store with store id ${storeId) is deleted" });
    } else {
      res.status(400).json({ message: "Unable to delete the store" });
    }
  } catch (error) {
    next(error);
  }
};


//Routing

router.get('/malls', mallServices.getMall);

router.post('/malls', mallServices.addMall);

router.post('/malls/:mallId', mallServices.addStore);

router.get('/malls/:mallId/:storeId', mallServices.getStoreData);

router.put('/malls/:mallId/:storeId', mallServices.updateStore);

router.delete('/malls/:mallId/:storeId', mallServices.deleteStore);

router.all('*', mallServices.invalid);



