import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import routes from './app/routes';

const app: Application = express();

app.use(cors());

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// console.log(app.get('env'));

// use routes
app.use('/api/v1', routes);

//handle not found
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: 'Not Found',
    errorMessages: [
      {
        path: req.originalUrl,
        message: 'API Not Found',
      },
    ],
  });
  next();
});

// Testing
// app.get('/', async (req: Request, res: Response, next: NextFunction) => {
//   //   throw new ApiError(400, 'Api Error')
//   //   next("Custom Error");
//   //   Promise.reject(new Error('Unhandled Promise Rejection!'))
//   //   console.log(x)
// })

// global error handler
app.use(globalErrorHandler);

export default app;
