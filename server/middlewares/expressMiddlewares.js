import express from 'express'
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import mongoSanitize from 'express-mongo-sanitize';
// import sanitizeHandler from './sanitizeHandler.js';


const expressConfig = (app) => {
  // Enabling CORS
  const enableCors = {
    origin: [
      "https://workplacecodedone.online"
    ],
    exposeHeaders: ['Cross-Origin-Opener-Policy', 'Cross-Origin-Resource-Policy'],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true
  }

  // Express middlewares configuration
  app.use(cors(enableCors))
  app.use(morgan('dev'))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(cookieParser())
  app.use(helmet())

  // Sanitizing req.query, req.params & req.body
  // app.use(sanitizeHandler)
  
  app.use(
    mongoSanitize({
      allowDots: true,
      replaceWith: ' ',
    })
  );
}

export default expressConfig