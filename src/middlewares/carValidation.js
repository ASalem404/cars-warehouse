const { body } = require('express-validator');

exports.createCarValidationInput = [
  body('model').trim().notEmpty().withMessage('Car model is required'),
  body('color').trim().notEmpty().withMessage('Car color is required'),
  body('quantity')
    .notEmpty()
    .withMessage('Car quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
];
