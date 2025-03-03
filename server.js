const express = require('express');
const axios = require('axios');
const cors = require('cors');
const path = require('path');
const { exec } = require('child_process');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Servir el frontend
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para enviar consultas al modelo de Vertex AI
app.post('/predict', async (req, res) => {
    try {
        const { prompt } = req.body; // Recibe el prompt desde el frontend

        // URL del endpoint de Vertex AI
        const endpointUrl = `https://us-central1-aiplatform.googleapis.com/v1/projects/aerial-antonym-452010-u6/locations/us-central1/endpoints/1475075113010331648:predict`;

        // Token de acceso para autenticación
        const accessToken = await getAccessToken();

        // Enviar solicitud al endpoint de Vertex AI
        const response = await axios.post(endpointUrl, {
            instances: [
                {
                    prompt: prompt, // Usa el prompt proporcionado por el usuario
                    max_tokens: 2000, // Parámetros adicionales
                    temperature: 0.6,
                    top_p: 1.0,
                    top_k: -1
                }
            ],
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
        });

        // Devolver la respuesta al frontend
        res.json(response.data);
    } catch (error) {
        console.error('Error completo:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Error al procesar la solicitud', details: error.response ? error.response.data : error.message });
    }
});

// Función para obtener un token de acceso
async function getAccessToken() {
    return new Promise((resolve, reject) => {
        exec('gcloud auth print-access-token', (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout.trim());
            }
        });
    });
}

// Iniciar el servidor
app.listen(port, () => {
    console.log(`Servidor backend corriendo en http://localhost:${port}`);
});