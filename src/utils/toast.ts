export function toast(message: string | { message?: string } = "", options?: any) {
	// Minimal fallback: if react-toastify is installed later, replace this import
	const text = typeof message === "string" ? message : message?.message ?? "";
	// no-op for dev: log so behavior remains observable
	// eslint-disable-next-line no-console
	console.log("toast:", text, options);
}
export default toast;
