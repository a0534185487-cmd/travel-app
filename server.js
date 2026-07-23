const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const CLIENTS_FILE = path.join(__dirname, 'clients.json');

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

app.use(fileUpload({
    createParentPath: true,
    limits: { fileSize: 15 * 1024 * 1024 }
}));

function getClients() {
    if (!fs.existsSync(CLIENTS_FILE)) {
        fs.writeFileSync(CLIENTS_FILE, JSON.stringify([]));
    }
    try {
        const data = fs.readFileSync(CLIENTS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

function saveClients(clients) {
    fs.writeFileSync(CLIENTS_FILE, JSON.stringify(clients, null, 2), 'utf8');
}

app.get('/api/clients', (req, res) => {
    const clients = getClients();
    res.json(clients);
});

app.post('/api/clients', (req, res) => {
    try {
        const clients = getClients();
        const newClient = {
            id: Date.now().toString(),
            formType: req.body.formType || 'standard', // 'standard' או 'summary'
            clientName: req.body.clientName || 'לקוח',
            phone: req.body.phone || '',
            bookingType: req.body.bookingType || 'flight_hotel', // 'flight', 'hotel', 'flight_hotel'

            // שדות אופציה 1 (רגיל)
            pnr: req.body.pnr || '',
            flightNumber: req.body.flightNumber || '',
            departureDate: req.body.departureDate || '',
            returnDate: req.body.returnDate || '',
            hotelName: req.body.hotelName || '',
            boardBasis: req.body.boardBasis || '',
            notes: req.body.notes || '',

            // שדות אופציה 2 (סיכום הזמנה מפורט)
            datesSummary: req.body.datesSummary || '',
            destination: req.body.destination || '',
            airline: req.body.airline || '',
            depFlightTime: req.body.depFlightTime || '',
            retFlightTime: req.body.retFlightTime || '',
            luggageDetails: req.body.luggageDetails || '',
            passengersPassports: req.body.passengersPassports || '',
            hotelCity: req.body.hotelCity || '',
            roomComposition: req.body.roomComposition || '',
            roomName: req.body.roomName || '',
            cancellationTerms: req.body.cancellationTerms || '',
            totalCost: req.body.totalCost || '',

            voucherBase64: req.body.voucherBase64 || '',
            voucherName: req.body.voucherName || ''
        };

        clients.unshift(newClient);
        saveClients(clients);
        res.json({ success: true, client: newClient });
    } catch (error) {
        console.error('שגיאה בשמירה:', error);
        res.status(500).json({ success: false, error: 'שגיאה בשמירת הנתונים' });
    }
});

app.delete('/api/clients/:id', (req, res) => {
    try {
        let clients = getClients();
        clients = clients.filter(c => c.id !== req.params.id);
        saveClients(clients);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'שגיאה במחיקה' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Travel CRM Pro running at http://localhost:${PORT}`);
});