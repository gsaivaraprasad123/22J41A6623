import "dotenv/config.js";
import fetch from 'node-fetch';
import dotenv from 'dotenv';

const LOGGING_API_URL = process.env.LOGGING_API_URL;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN; // 🔑 From your .env

export const sendLog = async (stack, level, pkg, message) => {
  try {
    const payload = { stack, level, package: pkg, message };

    const response = await fetch(LOGGING_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ACCESS_TOKEN}` // ✅ Important
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    return data;
  } catch (error) {
    console.error('[Logger Client Error]', error.message);
  }
};
