import axios from 'axios';
import { getToken } from './auth';
import { v4 as uuidv4 } from 'uuid';

const API_URL = 'http://localhost:4000/api';

/**
 * Get axios instance with auth header
 */
const getAxiosInstance = () => {
    const token = getToken();
    return axios.create({
        baseURL: API_URL,
        headers: token ? {
            'Authorization': `Bearer ${token}`
        } : {}
    });
};

/**
 * Create a new event
 */
export const createEvent = async (name, seatCount) => {
    const api = getAxiosInstance();
    const response = await api.post('/events', { name, seatCount });
    return response.data;
};

/**
 * Get seats for an event
 */
export const getSeats = async (eventId) => {
    const api = getAxiosInstance();
    const response = await api.get(`/events/${eventId}/seats`);
    return response.data;
};

/**
 * Hold a seat
 */
export const holdSeat = async (eventId, seatId) => {
    const api = getAxiosInstance();
    const response = await api.post('/seats/hold', { eventId, seatId });
    return response.data;
};

/**
 * Confirm booking for a seat
 */
export const confirmBooking = async (eventId, seatId) => {
    const api = getAxiosInstance();
    const idempotencyKey = uuidv4();

    const response = await api.post('/seats/confirm',
        { eventId, seatId },
        {
            headers: { 'Idempotency-Key': idempotencyKey }
        }
    );
    return response.data;
};
