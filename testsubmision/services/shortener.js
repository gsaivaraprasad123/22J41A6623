import { nanoid } from 'nanoid';
import { isValidUrl, isValidShortcode } from '../utils/validators.js';
import { Log } from 'logger-middleware/logger/logger.js';

export const generateUniqueShortcode = async () => {
  let code;
  do {
    code = nanoid(6);
  } while (await global.db.get(code));
  return code;
};

export const createShortUrl = async (url, validity = 30, customCode, host) => {
  try {
    if (!isValidUrl(url)) {
      await Log('backend', 'error', 'service', `Invalid URL format received: ${url}`);
      throw new Error('Invalid URL format');
    }

    let shortcode = customCode || await generateUniqueShortcode();

    if (customCode && !isValidShortcode(customCode)) {
      await Log('backend', 'error', 'service', `Invalid shortcode format: ${customCode}`);
      throw new Error('Invalid shortcode format');
    }

    if (await global.db.get(shortcode)) {
      await Log('backend', 'warn', 'service', `Shortcode collision attempted: ${shortcode}`);
      throw new Error('Shortcode already exists');
    }

    const now = new Date();
    const expiry = new Date(now.getTime() + validity * 60_000);

    const entry = {
      url,
      created: now.toISOString(),
      expiry: expiry.toISOString(),
      clicks: []
    };

    await global.db.set(shortcode, entry);

    await Log('backend', 'info', 'service', `Short URL created: ${shortcode} for ${url}`);

    return {
      shortLink: `${host}/${shortcode}`,
      expiry: entry.expiry
    };

  } catch (error) {
    // Log unexpected errors if any
    await Log('backend', 'error', 'service', `Error in createShortUrl: ${error.message}`);
    throw error;
  }
};

export const handleRedirect = async (shortcode, referrer, ip) => {
  try {
    const data = await global.db.get(shortcode);

    if (!data) {
      await Log('backend', 'warn', 'service', `Redirect requested for non-existent shortcode: ${shortcode}`);
      return null;
    }

    if (new Date(data.expiry) < new Date()) {
      await Log('backend', 'info', 'service', `Redirect requested for expired shortcode: ${shortcode}`);
      return 'expired';
    }

    data.clicks.push({
      timestamp: new Date().toISOString(),
      referrer: referrer || 'Direct',
      geo: ip || 'Unknown'
    });

    await global.db.set(shortcode, data);

    await Log('backend', 'info', 'service', `Redirecting shortcode ${shortcode} to original URL`);

    return data.url;

  } catch (error) {
    await Log('backend', 'error', 'service', `Error in handleRedirect: ${error.message}`);
    throw error;
  }
};

export const getShortUrlStats = async (shortcode) => {
  try {
    const data = await global.db.get(shortcode);

    if (!data) {
      await Log('backend', 'warn', 'service', `Stats requested for non-existent shortcode: ${shortcode}`);
      return null;
    }

    await Log('backend', 'info', 'service', `Stats retrieved for shortcode: ${shortcode}`);

    return {
      originalUrl: data.url,
      createdAt: data.created,
      expiry: data.expiry,
      totalClicks: data.clicks.length,
      clickData: data.clicks
    };
  } catch (error) {
    await Log('backend', 'error', 'service', `Error in getShortUrlStats: ${error.message}`);
    throw error;
  }
};
