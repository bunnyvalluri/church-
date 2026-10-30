import fs from 'fs';
import path from 'path';
import ClientRouteHealthDashboard from './ClientDashboard';

export const metadata = {
  title: 'Route Health & HTTP 200 Monitoring | KCM Administration',
  description: 'Automated status monitoring and HTTP validation for all church routes and APIs.',
};

export default function RouteHealthPage() {
  const reportPath = path.join(process.cwd(), 'health/reports/route-health.json');
  let healthData: any = null;

  try {
    if (fs.existsSync(reportPath)) {
      healthData = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
    }
  } catch (err) {
    console.error('Failed to read route health report:', err);
  }

  return <ClientRouteHealthDashboard initialData={healthData} />;
}

