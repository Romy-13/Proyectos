import express from 'express';
const router = express.Router();

// Ruta para mostrar el formulario de login
router.get('/login', (req, res) => {
  if (req.session.loggedin) {
    res.redirect('/');
  } else {
    res.render('login/index', {
      layout: 'main'
    });
  }
});

// Ruta para mostrar el formulario de registro
router.get('/register', (req, res) => {
  if (req.session.loggedin) {
    res.redirect('/');
  } else {
    res.render('login/register', {
      layout: 'main'
    });
  }
});

// Ruta para procesar el login
router.post('/auth', (req, res) => {
  const { email, password } = req.body;
  
  req.getConnection((err, conn) => {
    if (err) return res.send(err);

    conn.query('SELECT * FROM users WHERE email = ? AND password = ?', [email, password], (err, rows) => {
      if (err) return res.send(err);

      if (rows.length > 0) {
        req.session.loggedin = true;
        req.session.name = rows[0].name;
        res.redirect('/');  // Redirige a la ruta principal que ahora renderizará home.hbs
      } else {
        res.render('login/index', {
          error: 'Incorrect email and/or password!',
          layout: 'main'
        });
      }
    });
  });
});

// Ruta para procesar el registro
router.post('/register', (req, res) => {
  const data = req.body;

  req.getConnection((err, conn) => {
    if (err) return res.send(err);

    conn.query('INSERT INTO users SET ?', [data], (err, rows) => {
      if (err) return res.send(err);

      res.redirect('/login');
    });
  });
});

// Ruta para logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

export default router;