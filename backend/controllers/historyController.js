const { getSummaryCollection } = require('../config/db');

async function getHistory(req, res) {
    if (!req.user || !req.user.email) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
        const summaryCollection = getSummaryCollection();
        if (!summaryCollection) {
            return res.status(503).json({ error: 'Database not initialized' });
        }

        const history = await summaryCollection
            .find({ userEmail: req.user.email })
            .sort({ timestamp: -1 })
            .toArray();

        res.json(history);
    } catch (error) {
        console.error("Failed to fetch history:", error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
}

module.exports = { getHistory };
