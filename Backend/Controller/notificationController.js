

const admin = require("firebase-admin");


const serviceAccount = require("./serviceAccountKey.json");


if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

/**
 
 * @param {string} token 
 * @param {string} title 
 * @param {string} body
 * @param {object} [data] 
 */
async function sendNotification(token, title, body, data = {}) {
    try {
        const message = {
            token,
            notification: {
                title,
                body
            },
            data, 
            webpush: {
                headers: {
                    Urgency: "high"
                },
                notification: {
                    icon: "/icon.png", 
                    vibrate: [200, 100, 200],
                    actions: [
                        { action: "view", title: "View" }
                    ]
                }
            }
        };

        const response = await admin.messaging().send(message);
        console.log("Notification sent successfully:", response);
        return { success: true, id: response };
    } catch (error) {
        console.error("Error sending notification:", error);
        return { success: false, error: error.message };
    }
}

module.exports = { sendNotification };
