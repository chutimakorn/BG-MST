import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { QuotationsModule } from './quotations/quotations.module';
import { MasterDataModule } from './master-data/master-data.module';
import { ReportsModule } from './reports/reports.module';
import { ImportModule } from './import/import.module';
import { JobOrdersModule } from './job-orders/job-orders.module';
import { SettingsModule } from './settings/settings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: process.env.DB_TYPE as any,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : undefined,
      username: process.env.DB_USERNAME || undefined,
      password: process.env.DB_PASSWORD || undefined,
      database: process.env.DB_DATABASE,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      options: process.env.DB_TYPE === 'mssql' ? { 
        encrypt: false,
        trustServerCertificate: true,
        enableArithAbort: true,
      } : undefined,
    }),
    AuthModule,
    UsersModule,
    QuotationsModule,
    MasterDataModule,
    ReportsModule,
    ImportModule,
    JobOrdersModule,
    SettingsModule,
  ],
})
export class AppModule {}
