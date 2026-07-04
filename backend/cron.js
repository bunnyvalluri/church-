process.env.PROCESS_TYPE = 'cron';
// For cron jobs, we typically just run a specific script rather than a daemon.
// This is a placeholder for K8s CronJob to execute.
console.log('Running scheduled cron job...');
// Add tasks here (e.g. Prisma queries, cleanup)
setTimeout(() => {
  console.log('Cron job completed successfully.');
  process.exit(0);
}, 2000);
