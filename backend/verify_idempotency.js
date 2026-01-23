const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

const API_URL = 'http://localhost:4000/api';
let token;
let userId;
let eventId;
let seatId;
let seatId2;

async function runTests() {
    try {
        console.log('🚀 Starting Idempotency Tests...\n');

        // 1. Authentication
        console.log('1️⃣  Authenticating...');
        const uniqueId = uuidv4();
        const email = `test.${uniqueId}@example.com`;

        try {
            const authRes = await axios.post(`${API_URL}/auth/register`, {
                email,
                password: 'password123',
                name: `Test User ${uniqueId}`
            });
            token = authRes.data.data.token;
            userId = authRes.data.data.user.id;
            console.log('   ✅ Authenticated\n');
        } catch (e) {
            console.error('   Registration failed:', e.response?.data || e.message);
            throw e;
        }

        // 2. Setup Event & Seat
        console.log('2️⃣  Setting up Event and Seat...');
        try {
            const eventRes = await axios.post(`${API_URL}/events`, {
                name: `Idempotency Test Event ${uniqueId}`,
                seatCount: 10
            }, { headers: { Authorization: `Bearer ${token}` } });

            eventId = eventRes.data.id;

            // Get a seat
            const seatsRes = await axios.get(`${API_URL}/events/${eventId}/seats`);
            if (seatsRes.data.length === 0) throw new Error('No seats created');
            seatId = seatsRes.data[0].seatId;
            seatId2 = seatsRes.data[1].seatId;
            console.log(`   ✅ Event: ${eventId}, Seat1: ${seatId}, Seat2: ${seatId2}\n`);


            // 3. Test Missing Key (on Confirm endpoint)
            console.log('3️⃣  Test: Missing Idempotency Key');
            try {
                await axios.post(`${API_URL}/seats/confirm`, {
                    eventId, seatId, userId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                console.error('   ❌ Failed: Should have rejected request without key');
            } catch (error) {
                if (error.response && error.response.status === 400) {
                    console.log('   ✅ Passed: Server rejected request (400 Bad Request)');
                } else {
                    console.error(`   ❌ Failed: Unexpected status ${error.response?.status}`);
                }
            }
            console.log('');


            // 4. Test Valid Booking & caching (First Request)
            console.log('4️⃣  Test: First Valid Request');

            // Step 4a: HOLD the seat first
            console.log('   👉 Holding seat first...');
            try {
                const holdRes = await axios.post(`${API_URL}/seats/hold`, {
                    eventId, seatId
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (holdRes.data.status === 'HELD') {
                    console.log('   ✅ Seat Held Successfully');
                } else {
                    throw new Error(`Seat hold failed: ${JSON.stringify(holdRes.data)}`);
                }
            } catch (e) {
                console.error('   ❌ Seat Hold Failed (Possible 401 issue):', e.response?.status, e.response?.data);
                return; // Stop here if hold fails
            }

            // Step 4b: Confirm
            const idempotencyKey = uuidv4();
            console.log('   👉 Confirming booking...');

            const res1 = await axios.post(`${API_URL}/seats/confirm`, {
                eventId, seatId, userId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Idempotency-Key': idempotencyKey
                }
            });

            if (res1.status === 200 && res1.data.status === 'CONFIRMED') {
                console.log('   ✅ Passed: Booking confirmed');
            } else {
                console.error('   ❌ Failed: Booking not confirmed', res1.data);
            }
            console.log('');


            // 5. Test Duplicate Request (Same Key)
            console.log('5️⃣  Test: Duplicate Request (Same Key)');
            const res2 = await axios.post(`${API_URL}/seats/confirm`, {
                eventId, seatId, userId
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Idempotency-Key': idempotencyKey
                }
            });

            if (res2.status === 200 && res2.data.bookingId === res1.data.bookingId) {
                console.log('   ✅ Passed: Returned cached Booking ID matches original');
            } else {
                console.log('   ❌ Failed: Response did not match original');
            }
            console.log('');


            // 6. Test Concurrent Requests (Race Condition)
            console.log('6️⃣  Test: Concurrent Requests (Race Condition)');
            const raceKey = uuidv4();

            // Hold seat 2 first
            await axios.post(`${API_URL}/seats/hold`, { eventId, seatId: seatId2 }, { headers: { Authorization: `Bearer ${token}` } });
            console.log('   ✅ Seat 2 Held');

            console.log(`   Trying to book seat ${seatId2} with key ${raceKey} twice simultaneously...`);

            const reqPromise1 = axios.post(`${API_URL}/seats/confirm`, {
                eventId, seatId: seatId2, userId
            }, {
                headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': raceKey }
            }).catch(e => e.response || e);

            const reqPromise2 = axios.post(`${API_URL}/seats/confirm`, {
                eventId, seatId: seatId2, userId
            }, {
                headers: { Authorization: `Bearer ${token}`, 'Idempotency-Key': raceKey }
            }).catch(e => e.response || e);

            const [r1, r2] = await Promise.all([reqPromise1, reqPromise2]);

            const statuses = [r1.status, r2.status].sort();
            console.log(`   Statuses received: ${statuses.join(', ')}`);

            if (statuses.includes(200) && statuses.includes(409)) {
                console.log('   ✅ Passed: Race condition prevented (One Success, One Processing Error)');
            } else if (statuses[0] === 200 && statuses[1] === 200) {
                console.log('   ✅ Passed: Both returned success (Second was likely cached)');
            } else {
                console.log('   ⚠️ Check: Results were unexpected.');
                console.log('Response 1:', r1.data);
                console.log('Response 2:', r2.data);
            }

        } catch (e) {
            console.error('❌ Test setup failed:', e.response?.data || e.message);
        }
    } catch (err) {
        console.error('❌ Critical error:', err);
    }
}

runTests();
