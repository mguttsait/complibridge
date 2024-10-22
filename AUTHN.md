Step 1: Backend - Setting Up User Authentication
1.1 Install Required Dependencies
You need bcryptjs for password hashing and jsonwebtoken for token generation.

Run the following in the backend directory:

bash
Copy code
npm install bcryptjs jsonwebtoken
1.2 Define the User Model
Let’s create a simple User model using Sequelize to store user details.

Generate the model:

bash
Copy code
npx sequelize-cli model:generate --name User --attributes firstName:string,lastName:string,email:string,password:string
Run the migration:

bash
Copy code
npx sequelize-cli db:migrate
Your User model should look like this in models/user.js:

javascript
Copy code
module.exports = (sequelize, DataTypes) => {
const User = sequelize.define('User', {
firstName: DataTypes.STRING,
lastName: DataTypes.STRING,
email: {
type: DataTypes.STRING,
allowNull: false,
unique: true,
validate: {
isEmail: true
}
},
password: DataTypes.STRING
}, {});
return User;
};
1.3 Create Authentication Controller
Next, you need to create a controller to handle registration, login, and JWT generation.

Create a new file controllers/authController.js:

javascript
Copy code
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// User registration
exports.register = async (req, res) => {
const { firstName, lastName, email, password } = req.body;
try {
const hashedPassword = await bcrypt.hash(password, 10);
const newUser = await User.create({
firstName,
lastName,
email,
password: hashedPassword
});
res.status(201).json({ message: 'User registered successfully', user: newUser });
} catch (error) {
res.status(500).json({ error: 'Error during registration' });
}
};

// User login
exports.login = async (req, res) => {
const { email, password } = req.body;
try {
const user = await User.findOne({ where: { email } });
if (!user) {
return res.status(404).json({ error: 'User not found' });
}

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, 'your_jwt_secret', { expiresIn: '1h' });
    res.status(200).json({ token });

} catch (error) {
res.status(500).json({ error: 'Error during login' });
}
};
1.4 Protect Routes with JWT Middleware
Create a middleware to verify JWTs and protect certain routes:

javascript
Copy code
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
const token = req.header('Authorization');
if (!token) {
return res.status(401).json({ error: 'Access denied, no token provided' });
}

try {
const decoded = jwt.verify(token, 'your_jwt_secret');
req.user = decoded;
next();
} catch (error) {
res.status(400).json({ error: 'Invalid token' });
}
};

module.exports = authenticateToken;
1.5 Create Routes for Authentication
In routes/auth.js, add routes for registration and login:

javascript
Copy code
const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');

router.post('/register', register);
router.post('/login', login);

module.exports = router;
Then, connect these routes to app.js:

javascript
Copy code
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);
Step 2: Frontend - Setting Up Authentication
2.1 Install Axios for API Requests
In the frontend directory, install axios to handle HTTP requests:

bash
Copy code
npm install axios
2.2 Create Auth Service
In frontend/src/services/authService.js, create a service to manage login and registration API calls:

javascript
Copy code
import axios from 'axios';

const API_URL = 'http://localhost:3001/auth'; // Update this if needed

export const register = async (userData) => {
return axios.post(`${API_URL}/register`, userData);
};

export const login = async (userData) => {
return axios.post(`${API_URL}/login`, userData);
};
2.3 Create Login Form Component
Next, create a React component for user login (LoginForm.js):

javascript
Copy code
import React, { useState } from 'react';
import { login } from '../services/authService';

const LoginForm = () => {
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [message, setMessage] = useState('');

const handleSubmit = async (e) => {
e.preventDefault();
try {
const response = await login({ email, password });
localStorage.setItem('token', response.data.token); // Save JWT in localStorage
setMessage('Login successful!');
} catch (error) {
setMessage('Login failed. Please check your credentials.');
}
};

return (
<form onSubmit={handleSubmit}>
<input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
<input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required />
<button type="submit">Login</button>
{message && <p>{message}</p>}
</form>
);
};

export default LoginForm;
2.4 Protect Routes on the Frontend
Create a utility to protect routes based on whether the user is authenticated:

javascript
Copy code
import React from 'react';
import { Route, Redirect } from 'react-router-dom';

const PrivateRoute = ({ component: Component, ...rest }) => {
const token = localStorage.getItem('token');
return (
<Route
{...rest}
render={(props) =>
token ? <Component {...props} /> : <Redirect to="/login" />
}
/>
);
};

export default PrivateRoute;
Step 3: Testing User Authentication
Start Backend: Run the backend API:

bash
Copy code
cd backend
npm start
Start Frontend: Run the React frontend:

bash
Copy code
cd ../frontend
npm start
Test the Registration and Login:

Use Postman or the frontend form to register a user.
Log in with the registered user and check if the token is saved in localStorage.
Test protected routes using PrivateRoute to ensure the JWT is being used correctly.
