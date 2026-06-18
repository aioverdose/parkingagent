import { generateVapidKeys } from "../push";

const keys = generateVapidKeys();
console.log("Add these to your .env:\n");
console.log(`VAPID_PUBLIC_KEY=${keys.publicKey}`);
console.log(`VAPID_PRIVATE_KEY=${keys.privateKey}`);
