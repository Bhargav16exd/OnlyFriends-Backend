import express, { urlencoded } from "express"
import cookieParser from "cookie-parser"
import cors from "cors"
import userRouter from "./routes/user.routes.js"
import letterRouter from "./routes/letter.routes.js"
import bodyParser from "body-parser"

const app = express()

// Basic Setup for server 
app.use(cookieParser())
app.use(urlencoded({extended:true}))
app.use(cors({
    origin:process.env.ORIGIN,
    credentials:true,
}))
app.use(express.static("public"))
app.use(express.json({
    limit:"50mb"
}))




// Routes
app.use("/api/v1/user" , userRouter)
app.use("/api/v1/letter" , letterRouter)



// Error Handling
app.use((err, req, res,next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message ;
  const errors = err.errors || [];

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    data: null,
  });
  next();
});

export default app;