import express from 'express';
// ... diğer importlar (cors, pino-http vb.)
import contactsRouter from './routers/contacts.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

export const setupServer = () => {
  const app = express();

  // İstek gövdesini (body) JSON olarak okumak için zorunludur
  app.use(express.json()); 
  
  // ... cors, logger middleware'leri

  // Rotaları bağlama
  app.use('/contacts', contactsRouter);

  // Bulunamayan rotalar (Listenin en sonunda olmalı)
  app.use(notFoundHandler);
  
  // Genel hata yakalayıcı (En son çalışacak middleware)
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};