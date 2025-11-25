const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const Papa = require('papaparse');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(bodyParser.json());

// --- Data Paths ---
const DATA_DIR = path.join(__dirname, 'data');
const CSV_PATH = path.join(DATA_DIR, 'prompts.csv');
const VIP_PATH = path.join(DATA_DIR, 'vip-prompts.json');
const CUSTOM_PATH = path.join(DATA_DIR, 'custom-prompts.json');
const METADATA_PATH = path.join(DATA_DIR, 'metadata.json');

// --- Helper Functions ---

// Ensure files exist
if (!fs.existsSync(CUSTOM_PATH)) fs.writeFileSync(CUSTOM_PATH, '[]');
if (!fs.existsSync(METADATA_PATH)) fs.writeFileSync(METADATA_PATH, JSON.stringify({ favorites: [], usageCounts: {} }));

const readJson = (filePath) => {
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        console.error(`Error reading ${filePath}:`, err);
        return [];
    }
};

const writeJson = (filePath, data) => {
    try {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } catch (err) {
        console.error(`Error writing ${filePath}:`, err);
    }
};

const getIconForAct = (act) => {
    const lowerAct = act.toLowerCase();
    if (lowerAct.includes('developer') || lowerAct.includes('code') || lowerAct.includes('engineer') || lowerAct.includes('terminal') || lowerAct.includes('interpreter') || lowerAct.includes('php') || lowerAct.includes('python') || lowerAct.includes('sql') || lowerAct.includes('javascript') || lowerAct.includes('console')) return '💻';
    if (lowerAct.includes('writer') || lowerAct.includes('poet') || lowerAct.includes('novelist') || lowerAct.includes('storyteller') || lowerAct.includes('essay') || lowerAct.includes('screenwriter') || lowerAct.includes('copywriter')) return '✍️';
    if (lowerAct.includes('designer') || lowerAct.includes('artist') || lowerAct.includes('svg') || lowerAct.includes('painter') || lowerAct.includes('decorator')) return '🎨';
    if (lowerAct.includes('seo') || lowerAct.includes('analyst') || lowerAct.includes('statistician') || lowerAct.includes('accountant') || lowerAct.includes('manager') || lowerAct.includes('strategist')) return '📊';
    if (lowerAct.includes('teacher') || lowerAct.includes('coach') || lowerAct.includes('mentor') || lowerAct.includes('guide') || lowerAct.includes('tutor') || lowerAct.includes('instructor')) return '🧑‍🏫';
    if (lowerAct.includes('movie') || lowerAct.includes('film') || lowerAct.includes('critic') || lowerAct.includes('actor')) return '🎬';
    if (lowerAct.includes('doctor') || lowerAct.includes('health') || lowerAct.includes('psychologist') || lowerAct.includes('therapist') || lowerAct.includes('nurse') || lowerAct.includes('dentist')) return '🩺';
    if (lowerAct.includes('chef') || lowerAct.includes('cook') || lowerAct.includes('food') || lowerAct.includes('dietitian')) return '🍳';
    if (lowerAct.includes('music') || lowerAct.includes('composer') || lowerAct.includes('rapper') || lowerAct.includes('singer')) return '🎵';
    if (lowerAct.includes('game') || lowerAct.includes('player') || lowerAct.includes('gamer')) return '🎮';
    return '✨';
};

// --- Routes ---

// GET /api/prompts - Fetch all prompts (VIP + CSV + Custom) with metadata
app.get('/api/prompts', (req, res) => {
    try {
        // 1. Load Metadata
        const metadata = readJson(METADATA_PATH);
        const favorites = new Set(metadata.favorites || []);
        const usageCounts = metadata.usageCounts || {};

        // 2. Load VIP Prompts
        const vipPrompts = readJson(VIP_PATH).map(p => ({
            ...p,
            isFavorite: favorites.has(p.id),
            usageCount: usageCounts[p.id] || 0
        }));

        // 3. Load Custom Prompts
        const customPrompts = readJson(CUSTOM_PATH).map(p => ({
            ...p,
            isFavorite: favorites.has(p.id),
            usageCount: usageCounts[p.id] || 0
        }));

        // 4. Load CSV Prompts
        const csvFile = fs.readFileSync(CSV_PATH, 'utf8');
        Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                const csvPrompts = results.data.map((p, index) => {
                    const id = `${index}-${p.act?.replace(/\s+/g, '-') || 'unknown'}`;
                    return {
                        id: id,
                        act: p.act || 'Untitled',
                        prompt: p.prompt || '',
                        icon: getIconForAct(p.act || ''),
                        category: (p.act || 'General').split(' ')[0],
                        tags: (p.act || '').toLowerCase().split(/\s+/),
                        isFavorite: favorites.has(id),
                        usageCount: usageCounts[id] || 0,
                        isVip: false
                    };
                }).filter(p => p.prompt.length > 0);

                // Combine all
                const allPrompts = [...vipPrompts, ...customPrompts, ...csvPrompts];
                res.json(allPrompts);
            },
            error: (err) => {
                console.error("CSV Parse Error:", err);
                res.status(500).json({ error: "Failed to parse CSV prompts" });
            }
        });

    } catch (err) {
        console.error("Server Error:", err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// POST /api/prompts - Create Custom Prompt
app.post('/api/prompts', (req, res) => {
    const newPrompt = req.body;
    if (!newPrompt.act || !newPrompt.prompt) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const customPrompts = readJson(CUSTOM_PATH);
    customPrompts.unshift(newPrompt); // Add to top
    writeJson(CUSTOM_PATH, customPrompts);

    res.json(newPrompt);
});

// PUT /api/prompts/:id - Update Custom Prompt
app.put('/api/prompts/:id', (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const customPrompts = readJson(CUSTOM_PATH);
    const index = customPrompts.findIndex(p => p.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Prompt not found" });
    }

    customPrompts[index] = { ...customPrompts[index], ...updates };
    writeJson(CUSTOM_PATH, customPrompts);

    res.json(customPrompts[index]);
});

// DELETE /api/prompts/:id - Delete Custom Prompt
app.delete('/api/prompts/:id', (req, res) => {
    const { id } = req.params;
    let customPrompts = readJson(CUSTOM_PATH);
    const initialLength = customPrompts.length;

    customPrompts = customPrompts.filter(p => p.id !== id);

    if (customPrompts.length === initialLength) {
        return res.status(404).json({ error: "Prompt not found" });
    }

    writeJson(CUSTOM_PATH, customPrompts);
    res.json({ success: true });
});

// POST /api/favorites - Toggle Favorite
app.post('/api/favorites', (req, res) => {
    const { id } = req.body;
    const metadata = readJson(METADATA_PATH);
    const favorites = new Set(metadata.favorites || []);

    if (favorites.has(id)) {
        favorites.delete(id);
    } else {
        favorites.add(id);
    }

    metadata.favorites = Array.from(favorites);
    writeJson(METADATA_PATH, metadata);

    res.json({ favorites: metadata.favorites });
});

// POST /api/usage - Increment Usage
app.post('/api/usage', (req, res) => {
    const { id } = req.body;
    const metadata = readJson(METADATA_PATH);

    if (!metadata.usageCounts) metadata.usageCounts = {};
    metadata.usageCounts[id] = (metadata.usageCounts[id] || 0) + 1;

    writeJson(METADATA_PATH, metadata);

    res.json({ usageCount: metadata.usageCounts[id] });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});
