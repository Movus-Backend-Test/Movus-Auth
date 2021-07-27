-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "firstname" VARCHAR(25) NOT NULL,
    "lastname" VARCHAR(25) NOT NULL,
    "username" VARCHAR(25) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "address" VARCHAR(200) NOT NULL,
    "phone_number" VARCHAR(25) NOT NULL,
    "user_type" VARCHAR(25) NOT NULL,
    "password" VARCHAR(100) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "balance" INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_token" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expiration" BIGINT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_token" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(50) NOT NULL,
    "user_id" INTEGER NOT NULL,
    "expiration" BIGINT NOT NULL,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cars" (
    "id" SERIAL NOT NULL,
    "car_type" VARCHAR NOT NULL,
    "brand" VARCHAR NOT NULL,
    "color" VARCHAR NOT NULL,
    "production_year" INTEGER NOT NULL,
    "cost" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" DATE,
    "image_url" VARCHAR,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "finished_transaction" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cars_id" INTEGER NOT NULL,
    "status" VARCHAR NOT NULL,
    "created_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ongoing_transactions" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cars_id" INTEGER NOT NULL,
    "created_at" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("user_id","cars_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users.username_unique" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "users.email_unique" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "password_token.token_unique" ON "password_token"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_token.token_unique" ON "verification_token"("token");

-- AddForeignKey
ALTER TABLE "password_token" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verification_token" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finished_transaction" ADD FOREIGN KEY ("cars_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "finished_transaction" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ongoing_transactions" ADD FOREIGN KEY ("cars_id") REFERENCES "cars"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ongoing_transactions" ADD FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
