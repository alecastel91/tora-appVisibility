module.exports = {
  apps: [
    {
      name: 'tora-backend',
      cwd: '/Users/alessandrocastelbuono/Desktop/tora-backend',
      script: 'npm',
      args: 'run dev',
      env: {
        NODE_ENV: 'development',
        PORT: '5001'
      },
      error_file: '/tmp/tora-backend-error.log',
      out_file: '/tmp/tora-backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s'
    },
    {
      name: 'tora-frontend',
      cwd: '/Users/alessandrocastelbuono/Desktop/tora-app',
      script: 'npm',
      args: 'start',
      env: {
        REACT_APP_API_URL: 'http://192.168.2.103:5001/api',
        HOST: '0.0.0.0',
        PORT: '3001',
        NODE_ENV: 'development'
      },
      error_file: '/tmp/tora-frontend-error.log',
      out_file: '/tmp/tora-frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
};
