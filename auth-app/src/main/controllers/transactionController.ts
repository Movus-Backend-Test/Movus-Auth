import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const bookACar = async (req, res) => {
  try {
    if (!req.body.carsId) {
      return res
        .status(404)
        .json({ message: "Form is not completed", status: false })
    }

    const onGoingBook = await prisma.ongoing_transactions.findUnique({
      where: {
        user_id_cars_id: {
          cars_id: req.body.carsId,
          user_id: req.user.userId,
        },
      },
    })

    if (onGoingBook) {
      return res.status(406).json({
        message: "This user already book this car, you can't book twice",
        status: false,
      })
    }

    const cars = await prisma.cars.findUnique({
      where: {
        id: req.body.carsId,
      },
    })

    if (cars.deleted_at) {
      return res.status(406).json({
        message: "This car already deleted, you can't book this car",
        status: false,
      })
    }

    if (cars.quantity === 0) {
      return res.status(406).json({
        message: "This car stock is empty, you can't book this car",
        status: false,
      })
    }

    const user = await prisma.users.findUnique({
      where: {
        id: req.user.userId,
      },
    })

    if (user.balance < cars.cost) {
      return res.status(406).json({
        message: "issuficient balance, please top up",
        status: false,
      })
    }

    const buyOperation = prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        balance: user.balance - cars.cost,
      },
    })

    const decreaseStockOperation = prisma.cars.update({
      where: {
        id: cars.id,
      },
      data: {
        quantity: cars.quantity - 1,
      },
    })

    const createOnGoingTransaction = prisma.ongoing_transactions.create({
      data: {
        users: {
          connect: {
            id: user.id,
          },
        },
        cars: {
          connect: {
            id: cars.id,
          },
        },
      },
    })

    await prisma.$transaction([
      buyOperation,
      decreaseStockOperation,
      createOnGoingTransaction,
    ])

    return res.status(200).json({
      message: "You have successfully book this car!",
      status: true,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: "A server error occured!", error: err, status: false })
  }
}

const topUp = async (req, res) => {
  try {
    if (!req.body.amount) {
      return res
        .status(404)
        .json({ message: "Form is not completed", status: false })
    }

    await prisma.users.update({
      where: {
        id: req.user.userId,
      },
      data: {
        balance: {
          increment: req.body.amount,
        },
      },
    })

    return res.status(200).json({
      message: "Top Up success",
      status: true,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: "A server error occured!", error: err, status: false })
  }
}

const getBalance = async (req, res) => {
  try {
    const user = await prisma.users.findUnique({
      where: {
        id: req.user.userId,
      },
    })

    const balance = user.balance

    return res.status(200).json({
      message: "success",
      data: balance,
      status: true,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: "A server error occured!", error: err, status: false })
  }
}

const getAllTransaction = async (req, res) => {
  try {
    const onGoingTransaction = await prisma.ongoing_transactions.findMany()

    const successTransaction = await prisma.finished_transaction.findMany({
      where: {
        status: "success",
      },
    })

    const canceledTransaction = await prisma.finished_transaction.findMany({
      where: {
        status: "cancel",
      },
    })

    return res.status(200).json({
      message: "success",
      data: {
        onGoing: onGoingTransaction,
        success: successTransaction,
        canceled: canceledTransaction,
      },
      status: true,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: "A server error occured!", error: err, status: false })
  }
}

const finishTransaction = async (req, res) => {
  try {
    if (!req.body.action || !req.body.userId || !req.body.carsId) {
      return res
        .status(404)
        .json({ message: "Form is not complete", status: false })
    }

    await prisma.ongoing_transactions.delete({
      where: {
        user_id_cars_id: {
          user_id: req.body.userId,
          cars_id: req.body.carsId,
        },
      },
    })

    if (req.body.action === "success") {
      await prisma.finished_transaction.create({
        data: {
          users: {
            connect: {
              id: req.body.userId,
            },
          },
          cars: {
            connect: {
              id: req.body.carsId,
            },
          },
          status: "success",
        },
      })

      return res.status(200).json({
        message: "success, thankyou for using our book service",
        status: true,
      })
    }

    const user = await prisma.users.findUnique({
      where: {
        id: req.body.userId,
      },
    })

    const car = await prisma.cars.findUnique({
      where: {
        id: req.body.carsId,
      },
    })

    const revertUserBalance = prisma.users.update({
      where: {
        id: user.id,
      },
      data: {
        balance: {
          increment: car.cost,
        },
      },
    })

    const revertCarStock = prisma.cars.update({
      where: {
        id: car.id,
      },
      data: {
        quantity: {
          increment: 1,
        },
      },
    })

    const createFinishedTransaction = prisma.finished_transaction.create({
      data: {
        users: {
          connect: {
            id: req.body.userId,
          },
        },
        cars: {
          connect: {
            id: req.body.carsId,
          },
        },
        status: "cancel",
      },
    })

    await prisma.$transaction([revertUserBalance, revertCarStock, createFinishedTransaction])

    return res.status(200).json({
      message:
        "oh no, transaction is canceled by admin, don't worry member money and stock is back!",
      status: true,
    })
  } catch (err) {
    console.log(err)
    return res
      .status(500)
      .json({ message: "A server error occured!", error: err, status: false })
  }
}

export default {
  book:bookACar,
  topUp:topUp,
  getBalance:getBalance,
  getAll:getAllTransaction,
  finish:finishTransaction
}