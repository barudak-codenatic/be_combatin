import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PrismaModule } from './prisma/prisma.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule } from '@nestjs/config';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { GameGateway } from './game/game.gateway';
import { OllamaService } from './ollama/ollama.service';
import { OllamaGateway } from './ollama/ollama.gateway';
import { ModuleService } from './module/module.service';
import { ModuleController } from './module/module.controller';
import { MaterialController } from './material/material.controller';
import { MaterialService } from './material/material.service';
import { MaterialModule } from './material/material.module';
import { ModuleModule } from './module/module.module';
import { ContentProgressModule } from './content-progress/content-progress.module';
import { ModuleProgressModule } from './module-progress/module-progress.module';
import { TestModule } from './test/test.module';
// import { OllamaModule } from './ollama/ollama.module';

@Module({
  imports: [
    AuthModule,
    UserModule,
    PrismaModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.EMAIL_HOST,
        auth: {
          user: process.env.EMAIL_USERNAME,
          pass: process.env.EMAIL_PASSWORD,
        },
      },
    }),
    CloudinaryModule,
    MaterialModule,
    ModuleModule,
    ContentProgressModule,
    ModuleProgressModule,
    TestModule,
    // OllamaModule,
  ],
  providers: [
    GameGateway,
    OllamaService,
    OllamaGateway,
    ModuleService,
    MaterialService,
  ],
  controllers: [ModuleController, MaterialController],
})
export class AppModule {}
