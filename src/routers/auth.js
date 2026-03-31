import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import  validateBody  from '../middlewares/validateBody.js';
import { registerSchema, loginSchema } from '../schemas/auth.js';
import {
  registerController,
  loginController,
  refreshUserSessionController,
  logoutUserController,
} from '../controllers/auth.js';

const authRouter = Router();


authRouter.post(
  '/register',
  validateBody(registerSchema),
  ctrlWrapper(registerController)
);


authRouter.post(
  '/login',
  validateBody(loginSchema),
  ctrlWrapper(loginController)
);

authRouter.post(
  '/refresh', 
  ctrlWrapper(refreshUserSessionController)
);

authRouter.post(
  '/logout', 
  ctrlWrapper(logoutUserController)
);

export default authRouter;