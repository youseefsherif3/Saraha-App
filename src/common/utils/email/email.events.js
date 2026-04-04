import { EventEmitter } from "node:events";

export const Eventemitter = new EventEmitter();

Eventemitter.on("confirmEmail", async (fn) => {
	await fn();
});