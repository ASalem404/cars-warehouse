const router = require('express').Router();
const {
  createCar,
  deleteCar,
  getCar,
  getCars,
  updateCar,
} = require('../controllers/carsControllers');

const { createCarValidationInput } = require('../middlewares/carValidation');

router.route('/').get(getCars).post(createCarValidationInput, createCar);

router.route('/:id').get(getCar).patch(updateCar).delete(deleteCar);

module.exports = router;
