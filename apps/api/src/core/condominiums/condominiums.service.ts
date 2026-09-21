import { Injectable } from '@nestjs/common';

// Placeholder: acá se inyecta PrismaService una vez que se arme
// el módulo compartido de acceso a datos.
@Injectable()
export class CondominiumsService {
  findAll() {
    return [];
  }

  findOne(id: number) {
    return { id };
  }
}
