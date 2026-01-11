import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: [
      'http://localhost:5173', 
      'http://localhost:5174',
      'https://activitycard.fly.dev',
      'https://ojitxslml.github.io',
    ],
    methods: 'GET',
    credentials: true,
  });
  
  const port = process.env.PORT || 3000;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Backend running on port ${port}`);
  console.log('📊 GitHub Token:', process.env.GITHUB_TOKEN ? 'Configured ✓' : 'Not configured ✗');
}
bootstrap();
