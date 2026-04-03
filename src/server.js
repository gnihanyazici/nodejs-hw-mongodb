import express from 'express';
import cors from 'cors';
import pino from 'pino-http';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express'; // Swagger UI eklendi
import fs from 'fs'; // Dosya okuma modülü eklendi
import path from 'path';

import contactsRouter from './routers/contacts.js';
import authRouter from './routers/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

export const setupServer = () => {
  const app = express();
  
  const swaggerDocument = JSON.parse(
    fs.readFileSync(path.resolve('docs', 'swagger.json'), 'utf8')
  );

  // 1. Temel Middleware'ler
  app.use(express.json()); // İstek gövdesini (body) JSON olarak okur
  app.use(cookieParser()); // Çerezleri (cookies) okur
  app.use(cors()); // Farklı domainlerden gelen isteklere izin verir
  
  // 2. Logger (Terminalde istekleri görmek için)
  app.use(
    pino({
      transport: {
        target: 'pino-pretty', // Logları daha okunaklı hale getirir
      },
    })
  );

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  // 3. Rotaları Bağlama
  app.use('/auth', authRouter); // Kimlik doğrulama işlemleri
  app.use('/contacts', contactsRouter); // İletişim/Rehber işlemleri

  // 4. Bulunamayan Rotalar (404)
  // Eğer istek yukarıdaki rotalara uymazsa buraya düşer
  app.use(notFoundHandler);
  
  // 5. Genel Hata Yakalayıcı (Error Handler)
  // Uygulamanın herhangi bir yerinde hata fırlatılırsa (next(error)) burası çalışır
  app.use(errorHandler);

  const PORT = process.env.PORT || 3000;
  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};