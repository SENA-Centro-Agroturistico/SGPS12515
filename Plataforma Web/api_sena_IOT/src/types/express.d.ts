import { Request } from 'express';

declare module 'express' {
  interface Request {
    user?: any;
  }
  interface User {
    username: string;
  }
}