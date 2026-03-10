import type { ORM } from '$lib/server/db';

declare global {
	namespace App {
		interface Locals {
			db: ORM;
		}
		interface Platform {
			env: Env;
			cf: CfProperties;
			ctx: ExecutionContext;
		}
	}
}

export {};
