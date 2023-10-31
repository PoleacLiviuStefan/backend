const express= require("express");
const app =express();
const cors= require("cors");
const router = require('./routers/router');
const dotenv = require("dotenv")
const mongoose= require('mongoose')
const google= require('googleapis')
dotenv.config();

const port=process.env.PORT;
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors({
    origin: '*',
    methods: ['POST','GET'],
    optionsSuccessStatus: 200
}))
app.listen(port,()=>{
    console.log(`Server listening on port ${port}`)
})


app.use(express.json());

app.use('/api',router)