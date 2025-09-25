import './DB/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './DB/db.js'
import * as Sentry from "@sentry/node";
import { clerkWebhooks } from './controllers/webhooks.controllers.js'


//initialize express
const app= express()

//connect to database
await connectDB();

//Middlewares
app.use(cors())
app.use(express.json())
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

//Routes
app.get('/',(req,res)=>
  res.send("Api is working")
)
app.post('/webhooks',clerkWebhooks)



//port
const PORT= process.env.PORT || 5000
Sentry.setupExpressErrorHandler(app);

app.listen(PORT,()=>{
    console.log(`Server is running on port no ${PORT}`)
})