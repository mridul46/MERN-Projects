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
await connectDB()
await connectCloudinary()

//Middlewares
app.use(cors());
app.use(express.json()); // ⬅ this is what parses JSON body
app.use(express.urlencoded({ extended: true })); // for form data
app.get("/debug-sentry", function mainHandler(req, res) {
  throw new Error("My first Sentry error!");
});

//Routes
app.get('/',(req,res)=>
  res.send("Api is working")
)
app.post('/webhooks',clerkWebhooks)

//import Routes
import healthCheckRouter from './routes/healthCheck.routes.js'
import companyRouter from "./routes/company.routes.js"
import connectCloudinary from './utils/cloudinary.js'
import jobRouter from './routes/job.rotes.js'
//Mount Routes
app.use("/api/v1/healthcheck",healthCheckRouter);
app.use('/api/v1/company',companyRouter);
app.use('/api/v1/jobs',jobRouter)
//port
const PORT= process.env.PORT || 5000
Sentry.setupExpressErrorHandler(app);

app.listen(PORT,()=>{
    console.log(`Server is running on port no ${PORT}`)
})