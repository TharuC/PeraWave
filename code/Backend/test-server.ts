import express from 'express';
import { registerUser } from './src/controllers/authController';

const app = express();
app.use(express.json());

app.post('/test', registerUser);

app.listen(5001, () => console.log('Test server listening on 5001'));
