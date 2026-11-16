/**
 * External API Configuration
 * Configuration for external service integrations
 */

import dotenv from 'dotenv';

dotenv.config();

export const externalConfig = {
  githubStatusApi: process.env.GITHUB_STATUS_API || 'https://www.githubstatus.com/api/v2/status.json',
  cacheExpiryMinutes: 5,
  requestTimeoutMs: 5000,
  userAgent: 'FlowOps-Platform'
};

export default externalConfig;
