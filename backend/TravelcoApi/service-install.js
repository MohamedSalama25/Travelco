const Service = require('node-windows').Service;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Create a new service object
const svc = new Service({
    name: 'FlightBookingAPI',
    description: 'Flight Ticket Booking System API Server',
    script: path.join(__dirname, 'src', 'server.js'),
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ]
    //, workingDirectory: '...'
    //, allowServiceLogon: true
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function () {
    console.log('Service installed successfully!');
    svc.start();
});

// Listen for the "alreadyinstalled" event
svc.on('alreadyinstalled', function () {
    console.log('This service is already installed.');
});

// Listen for the "start" event
svc.on('start', function () {
    console.log('Service started!');
});

// Install the script as a service.
svc.install();
