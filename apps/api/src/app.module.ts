import { Module } from '@nestjs/common';
import { CondominiumsModule } from './core/condominiums/condominiums.module';

// A medida que se sumen los demás módulos de core/ y modules/
// (según estructura-carpetas-monorepo.md), se importan acá.
@Module({
  imports: [CondominiumsModule],
})
export class AppModule {}
