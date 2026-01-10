import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    methods: 'GET',
    credentials: true,
  });
  
  await app.listen(3000);
  console.log('🚀 Backend running on http://localhost:3000');
  console.log('📊 GitHub Token:', process.env.GITHUB_TOKEN ? 'Configured ✓' : 'Not configured ✗');
}
bootstrap();
