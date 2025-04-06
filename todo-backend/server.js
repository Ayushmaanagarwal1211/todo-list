const dotenv = require('dotenv');
dotenv.config();
require('./mongoose_conn');
const express = require('express');
const {requireAuth} = require("@clerk/express")
const app = express();
const PORT = process.env.PORT;
const cors = require("cors")
const {todoRouter} = require('./routes/todo');
app.use(express.json());
app.use(cors())
app.use(requireAuth())

app.use('/todo',(req, res, next) => {
    res.setHeader("Cache-Control", "private, max-age=31536000");
    next();
  },todoRouter)
app.get('/',(req,res)=>{
    console.log("HII")
    return res.status(200).json({msg:"dsdsdsdsd"})
})
app.listen(PORT);
