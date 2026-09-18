// storage.js
// Remplace le localStorage par des appels a l'API backend (Node.js + S3),
// permettant a toutes les requetes d'etre partagees entre tous les utilisateurs.

const API_URL = '/api/requests';
const listeners = [];
let cache = [];
let pollingStarted = false;

function generateId() {
    return 'id-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
}

async function fetchAll() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();
        cache = data;
        notify(cache);
        return cache;
    } catch (err) {
        console.error('Erreur de lecture des donnees :', err);
        return cache;
    }
}

async function saveAll(records) {
    cache = records;
    notify(cache);
    try {
        await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(records)
        });
    } catch (err) {
        console.error('Erreur de sauvegarde des donnees :', err);
    }
}

function notify(records) {
    for (let i = 0; i < listeners.length; i++) {
        listeners[i](records);
    }
}

// Simule onSnapshot : appelle immediatement le callback avec les donnees
// actuelles, puis re-verifie periodiquement le serveur pour detecter les
// changements faits par d'autres utilisateurs (polling toutes les 5 secondes).
function subscribe(callback) {
    listeners.push(callback);
    fetchAll();

    if (!pollingStarted) {
        pollingStarted = true;
        setInterval(fetchAll, 5000);
    }
}

async function addRecord(record) {
    record.id = generateId();
    const records = await fetchAll();
    records.push(record);
    await saveAll(records);
    return record.id;
}

async function updateRecord(id, updates) {
    const records = await fetchAll();
    const index = records.findIndex(function (r) { return r.id === id; });
    if (index === -1) {
        return;
    }

    const keys = Object.keys(updates);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const value = updates[key];
        if (key.indexOf('.') !== -1) {
            const parts = key.split('.');
            let target = records[index];
            for (let j = 0; j < parts.length - 1; j++) {
                target = target[parts[j]];
            }
            target[parts[parts.length - 1]] = value;
        } else {
            records[index][key] = value;
        }
    }

    await saveAll(records);
}

async function deleteRecord(id) {
    const records = await fetchAll();
    const filtered = records.filter(function (r) { return r.id !== id; });
    await saveAll(filtered);
}

export { subscribe, addRecord, updateRecord, deleteRecord };
