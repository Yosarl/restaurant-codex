import cron from 'node-cron';
import { env } from '../config/env';
import { lowStockAlerts, salesReport } from './report.service';

export function startSchedulers(): void {
  cron.schedule(env.LOW_STOCK_CRON, async () => {
    const alerts = await lowStockAlerts();
    if (alerts.length > 0) {
      // eslint-disable-next-line no-console
      console.log(`Low stock alerts: ${alerts.length}`);
    }
  });

  cron.schedule(env.REPORT_CRON, async () => {
    const report = await salesReport({});
    // eslint-disable-next-line no-console
    console.log('Daily sales summary generated', JSON.stringify(report).slice(0, 120));
  });
}
