/**
 * Instrumentation module for Sentry and OpenTelemetry.
 *
 * These are optional monitoring integrations. If the required packages
 * are not installed (e.g., in Docker production builds using pnpm deploy),
 * instrumentation is silently skipped.
 */

// Sentry integration (optional)
try {
  if (process.env.SENTRY_DSN) {
    const Sentry = require('@sentry/nestjs');
    const { nodeProfilingIntegration } = require('@sentry/profiling-node');

    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      integrations: [nodeProfilingIntegration()],
      tracesSampleRate: parseFloat(
        process.env.SENTRY_TRACES_SAMPLE_RATE || '0.1',
      ),
      profilesSampleRate: parseFloat(
        process.env.SENTRY_PROFILES_SAMPLE_RATE || '0.1',
      ),
    });
    console.log('[Instrumentation] Sentry initialized');
  }
} catch {
  // Sentry packages not installed — skip silently
}

// OpenTelemetry integration (optional)
try {
  if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
    const { NodeSDK } = require('@opentelemetry/sdk-node');
    const {
      OTLPTraceExporter,
    } = require('@opentelemetry/exporter-trace-otlp-http');
    const {
      getNodeAutoInstrumentations,
    } = require('@opentelemetry/auto-instrumentations-node');

    const otlpExporter = new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    });

    const sdk = new NodeSDK({
      traceExporter: otlpExporter,
      instrumentations: [getNodeAutoInstrumentations()],
    });

    sdk.start();
    console.log('[Instrumentation] OpenTelemetry initialized');
  }
} catch {
  // OpenTelemetry packages not installed — skip silently
}
