const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const postsRouter = require('./routes/posts');
const authRouter = require('./routes/auth');
const suggestRouter = require('./routes/suggest');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/posts', postsRouter);
app.use('/api/auth', authRouter);
app.use('/api/suggest', suggestRouter);

app.get('/', (req, res) => res.send({ status: 'ok', service: 'learnato-discussion-backend' }));

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/learnato';

mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
  })
  .catch(err => {
    console.error('Mongo connection error', err);
    process.exit(1);
  });
