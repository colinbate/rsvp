import type { ORM } from '$lib/server/db';

declare global {
	namespace App {
		interface Locals {
			db: ORM;
			user?: string;
		}
		interface Platform {
			env: Env & {
				RESEND_API_KEY?: string;
				EMAIL_FROM?: string;
				APP_URL?: string;
			};
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};
