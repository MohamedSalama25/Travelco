const mongoose = require("mongoose");
const Transfer = require("./src/models/Transfer.model");
const Company = require("./src/models/Company.model");
require("dotenv").config();

const diagnose = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    const transfers = await Transfer.find().limit(5);
    console.log("First 5 Transfers:");
    transfers.forEach(t => {
      console.log(`ID: ${t._id}, Booking: ${t.booking_number}, CompanyId: ${t.companyId}`);
    });

    const companies = await Company.find();
    console.log("\nRegistered Companies:");
    companies.forEach(c => {
      console.log(`ID: ${c._id}, Name: ${c.name}`);
    });

    process.exit(0);
  } catch (error) {
    console.error("Diagnosis failed:", error);
    process.exit(1);
  }
};

diagnose();
