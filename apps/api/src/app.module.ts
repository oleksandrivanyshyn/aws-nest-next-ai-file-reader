import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { serverConfig } from './config/server.config';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true, load: [serverConfig] })],
  controllers: [AppController],
})
export class AppModule {}
