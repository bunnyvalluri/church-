/**
 * health/core/registerAllChecks.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * Registers all specialized HealthCheck implementations into HealthRegistry.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { HealthRegistry } from "./HealthRegistry";

// Frontend
import { FrontendHealthCheck } from "../frontend/FrontendHealthCheck";
import { RouteHealthCheck } from "../frontend/RouteHealthCheck";
import { ComponentHealthCheck } from "../frontend/ComponentHealthCheck";
import { BuildHealthCheck } from "../frontend/BuildHealthCheck";
import { BundleHealthCheck } from "../frontend/BundleHealthCheck";
import { AccessibilityHealthCheck } from "../frontend/AccessibilityHealthCheck";
import { SEOHealthCheck } from "../frontend/SEOHealthCheck";
import { PerformanceHealthCheck as FrontendPerfCheck } from "../frontend/PerformanceHealthCheck";
import { BrowserCompatibilityHealthCheck } from "../frontend/BrowserCompatibilityHealthCheck";
import { PWAHealthCheck } from "../frontend/PWAHealthCheck";
import { I18nHealthCheck } from "../frontend/I18nHealthCheck";

// Backend
import { BackendHealthCheck } from "../backend/BackendHealthCheck";
import { ApiHealthCheck } from "../backend/ApiHealthCheck";
import { EndpointHealthCheck } from "../backend/EndpointHealthCheck";
import { MiddlewareHealthCheck } from "../backend/MiddlewareHealthCheck";
import { ErrorHandlingHealthCheck } from "../backend/ErrorHandlingHealthCheck";
import { ValidationHealthCheck } from "../backend/ValidationHealthCheck";

// Auth
import { AuthenticationHealthCheck } from "../auth/AuthenticationHealthCheck";
import { AuthorizationHealthCheck } from "../auth/AuthorizationHealthCheck";
import { SessionHealthCheck } from "../auth/SessionHealthCheck";
import { OAuthHealthCheck } from "../auth/OAuthHealthCheck";
import { RoleHealthCheck } from "../auth/RoleHealthCheck";

// Database
import { DatabaseHealthCheck } from "../database/DatabaseHealthCheck";
import { PostgreSQLHealthCheck } from "../database/PostgreSQLHealthCheck";
import { PrismaHealthCheck } from "../database/PrismaHealthCheck";
import { MongoDBHealthCheck } from "../database/MongoDBHealthCheck";
import { RedisHealthCheck } from "../database/RedisHealthCheck";
import { MigrationHealthCheck } from "../database/MigrationHealthCheck";
import { ConnectionPoolHealthCheck } from "../database/ConnectionPoolHealthCheck";

// Security
import { SecurityHealthCheck } from "../security/SecurityHealthCheck";
import { SecretScanHealthCheck } from "../security/SecretScanHealthCheck";
import { DependencySecurityCheck } from "../security/DependencySecurityCheck";
import { HeadersHealthCheck } from "../security/HeadersHealthCheck";
import { CORSHealthCheck } from "../security/CORSHealthCheck";
import { CSRFHealthCheck } from "../security/CSRFHealthCheck";
import { RateLimitHealthCheck } from "../security/RateLimitHealthCheck";
import { InputValidationHealthCheck } from "../security/InputValidationHealthCheck";
import { AuthorizationBoundaryCheck } from "../security/AuthorizationBoundaryCheck";
import { OwnershipCheck } from "../security/OwnershipCheck";

// Integrations
import { CloudinaryHealthCheck } from "../integrations/CloudinaryHealthCheck";
import { GoogleHealthCheck } from "../integrations/GoogleHealthCheck";
import { FirebaseHealthCheck } from "../integrations/FirebaseHealthCheck";
import { PaymentHealthCheck } from "../integrations/PaymentHealthCheck";
import { EmailHealthCheck } from "../integrations/EmailHealthCheck";
import { AIHealthCheck } from "../integrations/AIHealthCheck";

// Infrastructure
import { DockerHealthCheck } from "../infrastructure/DockerHealthCheck";
import { KubernetesHealthCheck } from "../infrastructure/KubernetesHealthCheck";
import { HelmHealthCheck } from "../infrastructure/HelmHealthCheck";
import { GitHubActionsHealthCheck } from "../infrastructure/GitHubActionsHealthCheck";
import { EnvironmentHealthCheck } from "../infrastructure/EnvironmentHealthCheck";
import { TLSHealthCheck } from "../infrastructure/TLSHealthCheck";

// Observability
import { LoggingHealthCheck } from "../observability/LoggingHealthCheck";
import { MetricsHealthCheck } from "../observability/MetricsHealthCheck";
import { TracingHealthCheck } from "../observability/TracingHealthCheck";
import { MonitoringHealthCheck } from "../observability/MonitoringHealthCheck";

// Testing
import { UnitTestHealthCheck } from "../testing/UnitTestHealthCheck";
import { IntegrationTestHealthCheck } from "../testing/IntegrationTestHealthCheck";
import { E2EHealthCheck } from "../testing/E2EHealthCheck";
import { SecurityTestHealthCheck } from "../testing/SecurityTestHealthCheck";
import { RegressionHealthCheck } from "../testing/RegressionHealthCheck";

// Performance
import { PerformanceHealthCheck } from "../performance/PerformanceHealthCheck";
import { DatabasePerformanceCheck } from "../performance/DatabasePerformanceCheck";
import { ApiPerformanceCheck } from "../performance/ApiPerformanceCheck";
import { FrontendPerformanceCheck } from "../performance/FrontendPerformanceCheck";
import { BundlePerformanceCheck } from "../performance/BundlePerformanceCheck";

export function registerAllChecks(registry: HealthRegistry = HealthRegistry.getInstance()): HealthRegistry {
  registry.registerAll([
    // Frontend
    new FrontendHealthCheck(),
    new RouteHealthCheck(),
    new ComponentHealthCheck(),
    new BuildHealthCheck(),
    new BundleHealthCheck(),
    new AccessibilityHealthCheck(),
    new SEOHealthCheck(),
    new FrontendPerfCheck(),
    new BrowserCompatibilityHealthCheck(),
    new PWAHealthCheck(),
    new I18nHealthCheck(),

    // Backend
    new BackendHealthCheck(),
    new ApiHealthCheck(),
    new EndpointHealthCheck(),
    new MiddlewareHealthCheck(),
    new ErrorHandlingHealthCheck(),
    new ValidationHealthCheck(),

    // Auth
    new AuthenticationHealthCheck(),
    new AuthorizationHealthCheck(),
    new SessionHealthCheck(),
    new OAuthHealthCheck(),
    new RoleHealthCheck(),

    // Database
    new DatabaseHealthCheck(),
    new PostgreSQLHealthCheck(),
    new PrismaHealthCheck(),
    new MongoDBHealthCheck(),
    new RedisHealthCheck(),
    new MigrationHealthCheck(),
    new ConnectionPoolHealthCheck(),

    // Security
    new SecurityHealthCheck(),
    new SecretScanHealthCheck(),
    new DependencySecurityCheck(),
    new HeadersHealthCheck(),
    new CORSHealthCheck(),
    new CSRFHealthCheck(),
    new RateLimitHealthCheck(),
    new InputValidationHealthCheck(),
    new AuthorizationBoundaryCheck(),
    new OwnershipCheck(),

    // Integrations
    new CloudinaryHealthCheck(),
    new GoogleHealthCheck(),
    new FirebaseHealthCheck(),
    new PaymentHealthCheck(),
    new EmailHealthCheck(),
    new AIHealthCheck(),

    // Infrastructure
    new DockerHealthCheck(),
    new KubernetesHealthCheck(),
    new HelmHealthCheck(),
    new GitHubActionsHealthCheck(),
    new EnvironmentHealthCheck(),
    new TLSHealthCheck(),

    // Observability
    new LoggingHealthCheck(),
    new MetricsHealthCheck(),
    new TracingHealthCheck(),
    new MonitoringHealthCheck(),

    // Testing
    new UnitTestHealthCheck(),
    new IntegrationTestHealthCheck(),
    new E2EHealthCheck(),
    new SecurityTestHealthCheck(),
    new RegressionHealthCheck(),

    // Performance
    new PerformanceHealthCheck(),
    new DatabasePerformanceCheck(),
    new ApiPerformanceCheck(),
    new FrontendPerformanceCheck(),
    new BundlePerformanceCheck(),
  ]);

  return registry;
}
