const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));


app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Server is running');
});

const authRouter = require('./routes/auth');

app.use('/auth', authRouter);

app.use('/api/eye', require('./routes/eyeRoutes'));

app.use('/api/exercise', require('./routes/exerciseRoutes'));

app.use('/api/eye', require('./routes/eyeRoutes'));
app.use('/api/exercise', require('./routes/exerciseRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

module.exports = app;
