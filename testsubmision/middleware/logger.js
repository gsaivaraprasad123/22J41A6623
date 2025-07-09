export const loggerMiddleware = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      timestamp: new Date().toISOString(),
      responseTime: `${Date.now() - startTime}ms`
    };

    
    fakeLogAPI(logData);
  });

  next();
};

import fs from 'fs';

function fakeLogAPI(log) {
  fs.appendFileSync('logs.txt', JSON.stringify(log) + '\n');
}

