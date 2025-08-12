const axios = require('axios');

axios.post('http://localhost:500/api/login', {
  email: 'test@example.com',
  password: 'test123'
})
.then(res => {
  console.log('Login success:', res.data);
})
.catch(err => {
  console.error('Login failed:', err.response?.data || err.message);
});