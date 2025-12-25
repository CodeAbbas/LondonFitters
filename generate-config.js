const fs = require('fs');
const path = require('path');

//path where config.js should be created
const targetPath = path.join(__dirname, 'js', 'config.js');

const configContent = `
export const firebaseConfig = {
    apiKey: "${process.env.FIREBASE_API_KEY}",
    authDomain: "${process.env.FIREBASE_AUTH_DOMAIN}",
    projectId: "${process.env.FIREBASE_PROJECT_ID}",
    storageBucket: "${process.env.FIREBASE_STORAGE_BUCKET}",
    messagingSenderId: "${process.env.FIREBASE_MESSAGING_SENDER_ID}",
    appId: "${process.env.FIREBASE_APP_ID}"
};

export const appSettings = {
    appId: 'london-fitters-web'
};
`;

// Write the file
fs.writeFileSync(targetPath, configContent);

console.log(`Generated js/config.js successfully.`);