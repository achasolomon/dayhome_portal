import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

type RequestWithUser = Request & { user?: unknown };

export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (data && typeof user === 'object' && user !== null) {
      return (user as Record<string, unknown>)[data];
    }

    return user;
  },
);
