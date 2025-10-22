export function toast(message: string) {
	try {
		if (typeof window !== "undefined" && "Notification" in window) {
			// simple fallback: console + alert for dev
			// avoid modal spam in production; adjust as needed
			console.info("toast:", message);
			// optional simple UI fallback:
			// window.alert(message);
		} else {
			console.info("toast:", message);
		}
	} catch (e) {
		console.error("toast error", e);
	}
}
