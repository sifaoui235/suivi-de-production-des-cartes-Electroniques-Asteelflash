const express = require('express');
const cors = require('cors');
const { S3Client, GetObjectCommand, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
app.use(cors());
app.use(express.json());

const s3 = new S3Client({ region: 'us-east-1' });
const BUCKET = process.env.BUCKET_NAME || 'suivi-prod-my-app-088773050306-us-east-1-an';
const KEY = 'requests.json';

async function streamToString(stream) {
    const chunks = [];
    for await (const chunk of stream) {
        chunks.push(chunk);
    }
    return Buffer.concat(chunks).toString('utf-8');
}

// Récupérer toutes les requêtes
app.get('/api/requests', async (req, res) => {
    try {
        const command = new GetObjectCommand({ Bucket: BUCKET, Key: KEY });
        const response = await s3.send(command);
        const body = await streamToString(response.Body);
        res.json(JSON.parse(body));
    } catch (err) {
        console.error(err);
        res.json([]);
    }
});

// Sauvegarder toutes les requêtes (remplace le fichier complet)
app.post('/api/requests', async (req, res) => {
    try {
        const command = new PutObjectCommand({
            Bucket: BUCKET,
            Key: KEY,
            Body: JSON.stringify(req.body, null, 2),
            ContentType: 'application/json'
        });
        await s3.send(command);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`API en écoute sur le port ${PORT}`);
});
