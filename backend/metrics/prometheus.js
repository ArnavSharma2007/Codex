const client = require('prom-client');

// Enable default Node.js metrics (CPU, memory, event loop lag, GC, etc.)
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ prefix: 'codex_' });

// ─── Custom Metrics ────────────────────────────────────────────────────────

/**
 * HTTP request duration histogram
 * Tracks latency per method + route + status code
 */
const httpRequestDurationMs = new client.Histogram({
  name: 'codex_http_request_duration_ms',
  help: 'Duration of HTTP requests in ms',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [10, 50, 100, 250, 500, 1000, 2500, 5000],
});

/**
 * Total HTTP requests counter
 */
const httpRequestsTotal = new client.Counter({
  name: 'codex_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

/**
 * Active connections gauge
 */
const activeConnections = new client.Gauge({
  name: 'codex_active_connections',
  help: 'Number of active connections',
});

/**
 * Auth failures counter (useful for security monitoring)
 */
const authFailures = new client.Counter({
  name: 'codex_auth_failures_total',
  help: 'Total number of failed authentication attempts',
  labelNames: ['reason'],
});

/**
 * Health check status gauge (1 = healthy, 0 = unhealthy)
 */
const healthStatus = new client.Gauge({
  name: 'codex_health_status',
  help: 'Health status of the service (1=healthy, 0=unhealthy)',
});

// ─── Middleware ────────────────────────────────────────────────────────────

/**
 * Express middleware to record HTTP metrics per request.
 * Attach to app before routes.
 */
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  activeConnections.inc();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const route = req.route ? req.route.path : req.path;
    const labels = {
      method: req.method,
      route,
      status_code: res.statusCode,
    };

    httpRequestDurationMs.observe(labels, duration);
    httpRequestsTotal.inc(labels);
    activeConnections.dec();
  });

  next();
};

module.exports = {
  client,
  metricsMiddleware,
  httpRequestDurationMs,
  httpRequestsTotal,
  activeConnections,
  authFailures,
  healthStatus,
};
