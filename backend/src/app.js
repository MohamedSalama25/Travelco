const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
}));


// Import routes
const airCompRoutes = require('./routes/airCompRoutes');
const usersRoutes = require('./routes/usersRoutes');
const authRoutes = require('./routes/authRoutes');
const transferRoutes = require('./routes/transferRoutes');
const customerRoutes = require('./routes/customerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const treasuryRoutes = require('./routes/treasuryRoutes');
const advanceRoutes = require('./routes/advanceRoutes');

// Import middleware
const auth = require('./middlewares/auth');

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (auth required)
app.use('/api/airComp', auth, airCompRoutes);
app.use('/api/users', auth, usersRoutes);
app.use('/api/transfers', auth, transferRoutes);
app.use('/api/customers', auth, customerRoutes);
app.use('/api/payments', auth, paymentRoutes);
app.use('/api/dashboard', auth, dashboardRoutes);
app.use('/api/treasury', auth, treasuryRoutes);
app.use('/api/advances', auth, advanceRoutes);
app.use('/api/expenses', auth, require('./routes/expenseRoutes'));

// Error handler
app.use((err, req, res, next) => {
    res.status(err.status || 500).json({
        success: false,
        message: !(err.status) ? 'Internal server error' : err.message
    });
});

module.exports = app;
