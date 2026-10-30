/**
 * src/modules/administration/admin.service.ts
 * Super-Admin system health, configuration, and maintenance services.
 */

import { checkPrismaHealth } from '../../infrastructure/prisma/client';
import { checkMongoHealth } from '../../infrastructure/mongodb/mongoClient';
import { checkRedisHealth } from '../../infrastructure/redis/client';

export class AdminService {
  public async getSystemDiagnostics() {
    const [pg, mongo, redis] = await Promise.all([
      checkPrismaHealth(),
      checkMongoHealth(),
      checkRedisHealth(),
    ]);

    return {
      status: pg.status === 'healthy' ? 'OPTIMAL' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      databases: {
        neonPostgres: pg,
        mongoAtlas: mongo,
        redisCluster: redis,
      },
    };
  }
}

export const adminService = new AdminService();
