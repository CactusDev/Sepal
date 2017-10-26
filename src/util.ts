
export function tryJson(check: string): any {
	try {
		return JSON.parse(check);
	} catch (e) {
		return null;
	}
}