require('dotenv').config();
const express = require('express');
const cors = require('cors');
const missionsRouter = require('./routes/missions');
const versionRouter  = require('./routes/versionRoutes');
const playersRouter  = require('./routes/players');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/missions',    missionsRouter);
app.use('/app-version', versionRouter);
app.use('/players',    playersRouter);

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`Missions API running on port ${PORT}`);
});
