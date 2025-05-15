const express = require('express');
const cors = require('cors');
const { dbConnect } = require('./config/db');
require('dotenv').config();

const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("server alive ");
  });

app.listen(port, () => {
    dbConnect();
    console.log(`Example app listening on port ${port}`);
  });  



module.exports = app;