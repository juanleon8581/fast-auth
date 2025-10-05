import logger from './logger.config';

// Test function to verify winston configuration manually
const testWinstonConfiguration = () => {
  console.log('🧪 Testing Winston Configuration...\n');

  // Test different log levels
  logger.log('error', 'Test ERROR log', { 
    service: 'test-service', 
    userId: 'test-user-123',
    requestId: 'req-456',
    error: 'Sample error message'
  });

  logger.log('warn', 'Test WARN log', { 
    service: 'test-service',
    requestId: 'req-456'
  });

  logger.log('info', 'Test INFO log', { 
    service: 'test-service',
    userId: 'test-user-123'
  });

  logger.log('http', 'Test HTTP log', { 
    service: 'api-service',
    method: 'GET',
    url: '/api/test',
    statusCode: 200
  });

  logger.log('verbose', 'Test VERBOSE log', { 
    service: 'test-service',
    details: 'Verbose information'
  });

  logger.log('debug', 'Test DEBUG log', { 
    service: 'test-service',
    debugInfo: 'Debug information'
  });

  logger.log('silly', 'Test SILLY log', { 
    service: 'test-service',
    sillyInfo: 'Silly information'
  });

  console.log('\n✅ Winston configuration test completed!');
  console.log('📝 Check the console output above for formatted logs');
  console.log('🗄️  In production, logs will also be saved to files');
};

// Run the test if this file is executed directly
if (require.main === module) {
  testWinstonConfiguration();
}

export { testWinstonConfiguration };