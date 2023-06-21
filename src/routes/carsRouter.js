const router = require("express").Router();
const authController = require("../controllers/authController");
const {
  createCar,
  deleteCar,
  getCar,
  getCars,
  updateCar,
} = require("../controllers/carsControllers");

const { createCarValidationInput } = require("../middlewares/carValidation");

router
  .route("/")
  .get(getCars)
  .post(
    createCarValidationInput,
    authController.protect,
    authController.restrictTo("admin"),
    createCar
  );

router
  .route("/:id")
  .get(getCar)
  .patch(authController.protect, authController.restrictTo("admin"), updateCar)
  .delete(
    authController.protect,
    authController.restrictTo("admin"),
    deleteCar
  );

module.exports = router;
