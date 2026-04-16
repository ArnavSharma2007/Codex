const axios = require('axios').default;
const logger = require('../middleware/logger');
const { healthStatus } = require('../metrics/prometheus');

const ALERT_WEBHOOK_URL = process.env.ALERT_WEBHOOK_URL || null;
const HEALTH_URL = process.env.BACKEND_URL
  ? `${process.env.BACKEND_URL}/health`
  : 'http://localhost:5000/health';

/**
 * Trigger an alert: logs to Winston + optionally posts to a webhook.
 */
async function triggerAlert(level, title, detail) {
  const payload = {
    level,
    title,
    detail,
    service: 'codex-backend',
    timestamp: new Date().toISOString(),
  };

  // ── Console & file log (always) ──────────────────────────────────────────
  logger.warn(`🚨 ALERT [${level}] ${title}: ${detail}`, payload);

  // Print the alert visually for Jenkins log demo visibility
  console.log('\n' + '='.repeat(60));
  console.log(`🚨  ALERT TRIGGERED  [${level}]`);
  console.log(`    Title   : ${title}`);
  console.log(`    Detail  : ${detail}`);
  console.log(`    Service : ${payload.service}`);
  console.log(`    Time    : ${payload.timestamp}`);
  console.log('='.repeat(60) + '\n');

  // ── Optional webhook (Slack/Teams/PagerDuty) ─────────────────────────────
  if (ALERT_WEBHOOK_URL) {
    try {
      await axios.post(ALERT_WEBHOOK_URL, {
        text: `🚨 *[${level}] ${title}*\n${detail}\nService: \`${payload.service}\``,
      });
      logger.info('Alert webhook delivered successfully');
    } catch (err) {
      logger.error(`Alert webhook delivery failed: ${err.message}`);
    }
  }
}

/**
 * Check the /health endpoint and fire an alert if it is degraded.
 * Called periodically from server.js.
 */
async function runHealthCheck() {
  try {
    const res = await axios.get(HEALTH_URL, { timeout: 5000 });
    if (res.data && res.data.status === 'ok') {
      healthStatus.set(1);
      logger.info('Health check PASSED ✅');
    } else {
      healthStatus.set(0);
      await triggerAlert(
        'HIGH',
        'Health Check Degraded',
        `/health responded but status is not "ok": ${JSON.stringify(res.data)}`
      );
    }
  } catch (err) {
    healthStatus.set(0);
    await triggerAlert(
      'CRITICAL',
      'Health Check FAILED',
      `Could not reach ${HEALTH_URL}: ${err.message}`
    );
  }
}

/**
 * Start periodic health monitoring.
 * @param {number} intervalMs - Default: 60 seconds
 */
function startHealthMonitor(intervalMs = 60_000) {
  logger.info(`Health monitor started — checking every ${intervalMs / 1000}s`);
  // Run immediately, then on interval
  runHealthCheck();
  return setInterval(runHealthCheck, intervalMs);
}

module.exports = { triggerAlert, runHealthCheck, startHealthMonitor };
