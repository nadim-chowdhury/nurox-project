import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';

@Injectable()
export class ApiKeyThrottlerGuard extends ThrottlerGuard {
  protected async getTracker(req: Record<string, any>): Promise<string> {
    // If the request is authenticated with an API key, use it as the rate limit key
    if (req.headers && req.headers['x-api-key']) {
      return `api-key:${req.headers['x-api-key']}`;
    }

    // Otherwise fallback to IP
    return req.ips?.length ? req.ips[0] : req.ip;
  }

  // Override handleRequest if we want different limits based on API key vs IP
  // But for now, we can rely on multiple named throttlers in app.module
  // and maybe check if the tracker starts with 'api-key:' to increase the limit.
  // The simplest way to handle higher limits is to just allow it or use a custom Throttler module configuration.

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: any,
  ): Promise<void> {
    throw new ThrottlerException(
      'Rate limit exceeded. Please try again later.',
    );
  }
}
