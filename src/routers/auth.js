import { Router } from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import validateBody from '../middlewares/validateBody.js';

import { 
  registerSchema, 
  loginSchema, 
  requestResetEmailSchema, 
  resetPasswordSchema 
} from '../schemas/auth.js';

import {
  registerController,
  loginController,
  refreshUserSessionController,
  logoutUserController,
  sendResetEmailController,
  resetPasswordController,
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


authRouter.post(
  '/send-reset-email',
  validateBody(requestResetEmailSchema),
  ctrlWrapper(sendResetEmailController)
);

// Adım 4: Yeni şifreyi belirleme rotası
authRouter.post(
  '/reset-pwd',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController)
);

export default authRouter;