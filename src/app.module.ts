import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ProductsModule } from './products/products.module';
import { LoggerMiddleware } from './utils/logger.middleware';
import { UploadModule } from './upload/upload.module';
import { RouterModule } from '@nestjs/core';
import { ImageModule } from './upload/image/image.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.dev.env',
      isGlobal: true,
    }),
    AuthModule,
    UserModule,
    ProductsModule,
    UploadModule,
    RouterModule.register([
      {
        path: 'upload',
        module: UploadModule,
        children: [
          {
            path: 'image',
            module: ImageModule,
          },
        ],
      },
    ]),
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
