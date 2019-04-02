'use strict';

const cwd = process.cwd();

// 3rd Party Resources
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Esoteric Resources
const errorHandler = require('./middleware/error.js');
const notFound = require('./middleware/404.js');

// Authentication middleware
const authRouter = require('./auth/router.js');

// Book routes
const bookRouter = require('./routes/books.js');

// Prepare the express app
const app = express();

// App Level MW
app.use(cors());
app.use(morgan('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/', express.static(`${cwd}/docs`)); // JSDoc Documentation (no authentication required)
app.use('/docs', express.static(`${cwd}/docs`));
app.use(authRouter); // Authentication middleware
app.use(bookRouter); // The client's target routes

// Error handling
app.use(notFound);
app.use(errorHandler);

let isRunning = false;

/**
 * Exported function to start the Express server
 * @param port {number} Port used for the server
 */
module.exports = {
  server: app,
  start: port => {
    if (!isRunning) {
      app.listen(port, () => {
        isRunning = true;
        console.log(`Server Up on ${port}`);
      });
    } else {
      console.log('Server is already running');
    }
  },
};
