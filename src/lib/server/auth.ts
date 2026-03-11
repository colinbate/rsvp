import { jwtVerify, createRemoteJWKSet } from 'jose';

export async function getUserFromAccess(request: Request, env: Env | undefined) {
	if (!env) return null;
	const token = request.headers.get('cf-access-jwt-assertion');

	// local-only convenience shim
	console.log('CHECK ACCESS', token, env?.DEV_USER_EMAIL);
	if (!token && env?.DEV_USER_EMAIL) {
		return {
			email: env.DEV_USER_EMAIL,
			dev: true
		};
	}

	if (!token) return null;

	const JWKS = createRemoteJWKSet(new URL(`${env.AUTH_DOMAIN}/cdn-cgi/access/certs`));

	const { payload } = await jwtVerify(token, JWKS, {
		issuer: env.AUTH_DOMAIN,
		audience: env.RSVP_AUD
	});

	return {
		email: payload.email as string,
		sub: payload.sub
	};
}
