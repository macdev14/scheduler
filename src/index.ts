import express from 'express';
import session from 'express-session';
import passport from 'passport';
import './middleware/auth';
import db from './db';
import { usersTable } from './db/schema';

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: 'your-secret',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

// Registration route
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = password;

  try {
    await db.insert(usersTable).values({
      username,
      password: hashedPassword,
    });

    res.redirect('/login');
  } catch (error) {
    res.status(500).send('Error registering user');
  }
});

// Protected route
app.get('/', (req, res) => {
    res.send('Hello world!');
});

// Login route
app.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
  })
);

// Protected route
app.get('/dashboard', (req, res) => {
  if (req.isAuthenticated()) {
    res.send('Welcome to your dashboard!');
  } else {
    res.redirect('/login');
  }
});

// Logout route
app.post('/logout', (req, res) => {
  req.logout(err => {
    if (err) {
        res.status(500).send('Error logging out user');
    }
    res.redirect('/login');
  });
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
