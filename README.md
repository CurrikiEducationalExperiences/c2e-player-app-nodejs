# c2e-player-app
Code description
Src/config/config.json
This file comes with sequelize and it provides necessary configuration to establish database connection for migrations, and seed data etc.

Src/constant/error-messages.js
This file contains error messages that will be used in the code. The purpose of this file is to avoid hardcoded strings in the code.

Src/controllers/
The controllers import the relevant service and responseHandler function. It transforms the result from service functions to a formatted response.
If it encounters errors and go in catch block, it calls the globalErrorHandler.

Src/midleware/auth.js
The auth middleware is used to verify the JWT Tokens. It verifies and decodes the token and attaches it to the request as req.loggedUser. 
This auth middleware is also used to issue the JWT Tokens.

Src/midleware/validation.js
The validation middleware function uses JOI. It requires an object which needs to be validated. And optional isGet parameter which if provided true, it will validate req.query. Otherwise, it validates req.body.

Src/migrations/
The migrations folder comes with sequelize and there is one sample migration file which creates two tables with relation in them.

Src/models/
Models folder comes with sequelize and there are two models defined as a sample as per the migration file.

Src/routes/api.js
This file imports all the routes and exports a function which takes express app as argument and sets the app to use these routes. If there are new rotes files, they will be imported in this function with desired endpoint name.

Src/routes/
The routes files in this folder are the endpoints. These files import relevant controllers and middleware. The JWT authentication, JOI request filtering etc. are performed here.

Src/service/
The service folder contains main logics for the endpoints. These files contains functions for controllers. These functions use CustomError, Models, and any other libraries that are required in development and return some result. The result can be anything. It can be boolean, string, array, object etc.

Src/tests/
The test folder is used for jest unit testing. It has similar folder structure as routes, controllers and service. These folders have files with same name as the actual file to make tings easy to understand. 

Src/utils/database.js
This file configures and exports a Sequelize instance to define the Models.

Src/utils/error.js
This file defines CustomError class that extends the built-in Error class. The purpose of this class is to provide a way to create consistent error objects with a specified message and error code.

Src/utils/response.js
This response.js file has three functions related to handling errors and responses. 

The responseHandler function takes an object data as its parameter, which is expects properties like response, message, result, and code. It uses these properties to send an HTTP JSON response with the specified status code, message, and result.

The requestHelper function is used to remove the password in the body if there is one. And this function is used in globalErrorHandling function.

The globalErrorHandler function is an error-handling middleware that catches errors during the request processing. If the error is not an instance of CustomError, it creates a new CustomError using the error message. It then logs details of the error, including the URL, user ID, and request body, and sends an HTTP JSON response with the error details.

Src/validations/
The validations folder contains files for JOI schema to be verified the request with.