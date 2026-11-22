/**
 * backend/src/utils/db.js
 * Shared Prisma database client singleton with generated client resolution.
 * Synchronized with global.__kcmPrisma to prevent multiple connection pools.
 */

let PrismaClient;
try {
  PrismaClient = require('../../prisma/generated/client').PrismaClient;
} catch (e) {
  PrismaClient = require('@prisma/client').PrismaClient;
}

if (!global.__kcmPrisma) {
  global.__kcmPrisma = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    errorFormat: 'pretty',
  });
}

const prisma = global.__kcmPrisma;

module.exports = prisma;

