import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const registerCar = async (req, res) => {
  try {
    if (
      !req.body.car_type ||
      !req.body.brand ||
      !req.body.color ||
      !req.body.production_year ||
      !req.body.cost ||
      !req.body.quantity
    ) {
      return res
        .status(404)
        .json({ message: "Form is not completed", status: false })
    }

    await prisma.cars.create({
      data: {
        car_type: req.body.car_type,
        brand: req.body.brand,
        color: req.body.color,
        production_year: req.body.production_year,
        cost: req.body.cost,
        quantity: req.body.quantity,
      },
    })

    return res.status(201).json({
      message: "You have successfully registered a car!",
      status: true,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: "A server error occured!", error: err, status: false })
  }
}

const updateCar = async (req, res) => {
  try {
    if (
      !req.body.id ||
      !req.body.car_type ||
      !req.body.brand ||
      !req.body.color ||
      !req.body.production_year ||
      !req.body.cost ||
      !req.body.quantity
    ) {
      return res
        .status(404)
        .json({ message: "Form is not completed", status: false })
    }

    const car = await prisma.cars.findUnique({
      where: {
        id: req.body.id,
      },
    })

    // check car is deleted
    if (car.deleted_at) {
      return res.status(406).json({
        message: "Car is already deleted, can't update",
        status: false,
      })
    }

    await prisma.cars.update({
      where: {
        id: req.body.id,
      },
      data: {
        car_type: req.body.car_type,
        brand: req.body.brand,
        color: req.body.color,
        production_year: req.body.production_year,
        cost: req.body.cost,
        quantity: req.body.quantity,
      },
    })

    return res.status(200).json({
      message: "You have successfully update a car!",
      status: true,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: "A server error occured!", error: err, status: false })
  }
}

const getCarDetailsById = async (req, res) => {
  try {
    if (!req.body.id) {
      return res
        .status(404)
        .json({ message: "An Id needed to get car detail", status: false })
    }

    const car = await prisma.cars.findUnique({
      where: {
        id: req.body.id,
      },
    })

    // check car is deleted
    if (car.deleted_at) {
      return res.status(406).json({
        message: "Car is already deleted, can't get detail",
        status: false,
      })
    }

    const carDetail = await prisma.cars.findUnique({
      where: {
        id: req.body.id,
      },
    })

    return res.status(200).json({
      message: "success",
      data: carDetail,
      status: true,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: "A server error occured", error: err, status: false })
  }
}

const getAllCar = async (req, res) => {
  try {
    let page = 1

    if (req.body.page) {
      page = req.body.page
    }

    const allCar = await prisma.cars.findMany({
      where: {
        deleted_at: null,
      },
      skip: (req.body.page - 1) * 10,
      take: 10,
    })

    return res.status(200).json({
      message: "success",
      data: allCar,
      status: true,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: "A server error occured", error: err, status: false })
  }
}

const findCar = async (req, res) => {
  try {
    if (!req.body.brand) {
      return res.status(404).json({
        message: "A brand needed to find car",
        status: false,
      })
    }

    let page = 1

    if (req.body.page) {
      page = req.body.page
    }

    const carFound = await prisma.cars.findMany({
      where: {
        brand: {
          contains: req.body.brand,
        },
        deleted_at: null,
      },
      skip: (page - 1) * 10,
      take: 10,
    })

    return res.status(200).json({
      message: "success",
      data: carFound,
      status: true,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: "A server error occured", error: err, status: false })
  }
}

const deleteCar = async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(404).json({
        message: "A id needed to delete car",
        status: false,
      })
    }

    //check if there are ongoing transaction with toBeDeletedCar
    const onGoingTransaction = await prisma.ongoing_transactions.findFirst({
      where: {
        cars_id: req.body.id,
      },
    })

    if (onGoingTransaction) {
      return res.status(406).json({
        message:
          "There are on going transaction with this car, resolve the transaction first! (Cancel or Succeed)",
        status: false,
      })
    }

    await prisma.cars.update({
      where: {
        id: req.body.id,
      },
      data: {
        deleted_at: new Date(),
      },
    })

    return res.status(200).json({
      message: "success, car has been soft deleted",
      status: true,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: "A server error occured", error: err, status: false })
  }
}

export default {
  register: registerCar,
  update: updateCar,
  detail: getCarDetailsById,
  get: getAllCar,
  find: findCar,
  delete: deleteCar,
}
