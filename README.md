# SlotDrop - Customized Time-Slot Delivery Logistics Platform (MERN)

Customers choose the delivery window they want. Admins publish slots with a capacity and optional premium fee, assign drivers, and watch the queue. Drivers see their runs and update status.

## Run it
1. Start MongoDB locally (or use an Atlas URI).
2. Backend: cd backend && cp .env.example .env && npm install && npm run seed && npm run dev
3. Frontend (new terminal): cd frontend && cp .env.example .env && npm install && npm run dev
4. Open http://localhost:5173

Demo logins (from seed): admin@slotdrop.com / admin123, driver@slotdrop.com / driver123, customer@slotdrop.com / customer123

## API
POST /api/auth/register | /login, GET /api/auth/me
GET /api/slots?date=&zone=  (customers see only open slots)
POST/PUT/DELETE /api/slots (admin)
POST /api/orders (customer books), GET /api/orders (role-scoped)
PUT /api/orders/:id/reschedule | /cancel | /assign | /status
GET /api/orders/track/:trackingId (public), GET /api/orders/stats/summary (admin)

## Key design point
Booking uses one atomic findOneAndUpdate (booked < capacity, then $inc), so two customers can never take the last place in a slot. Cancelling or rescheduling releases the place.
