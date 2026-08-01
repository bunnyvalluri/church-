/**
 * backend/src/utils/db.js
 * Shared Prisma database client instance with generated client resolution.
 */

let PrismaClient;
try {
  PrismaClient = require('../../prisma/generated/client').PrismaClient;
} catch (e) {
  PrismaClient = require('@prisma/client').PrismaClient;
}

const prisma = new PrismaClient();

module.exports = prisma;
