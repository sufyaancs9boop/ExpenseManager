const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const expenseRoutes = require("./routes/expenseRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/expenseDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

app.use("/api/expenses", expenseRoutes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
