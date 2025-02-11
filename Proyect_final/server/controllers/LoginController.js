import bcrypt from 'bcrypt';

function index(req, res) {
  // Redirect to index.html if user is logged in
  if (req.session.loggedin) {
    // Change this line to serve the static index.html file
    return res.redirect('/index.html'); // Make sure the path is correct based on your setup
  } else {
    res.render('login/index'); // Render login if not logged in
  }
}

function register(req, res) {
  res.render('login/register');
}

function createUser(req, res) {
  const { name, email, password, confirmPassword } = req.body;

  // Validar si las contraseñas coinciden
  if (password !== confirmPassword) {
    console.log('Las contraseñas no coinciden');
    return res.redirect('/register');
  }

  // Hash de la contraseña
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Guardar usuario en la base de datos
  req.getConnection((err, conn) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    // Comprobar si el email ya está registrado
    conn.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error al verificar el email');
      }

      if (rows.length > 0) {
        console.log('El email ya está registrado');
        return res.redirect('/register');
      }

      // Insertar el nuevo usuario sin 'confirmPassword'
      conn.query('INSERT INTO users (name, email, password) VALUES (?, ?, ?)', 
        [name, email, hashedPassword], (err, result) => {
          if (err) {
            console.error(err);
            return res.status(500).send('Error al crear el usuario');
          }

          console.log('Usuario registrado con éxito');
          res.redirect('/login');
      });
    });
  });
}


function auth(req, res) {
  const { email, password } = req.body;

  req.getConnection((err, conn) => {
    if (err) {
      console.error('Error en la conexión a la base de datos', err);
      return res.status(500).send('Error en la conexión a la base de datos');
    }

    conn.query('SELECT * FROM users WHERE email = ?', [email], (err, rows) => {
      if (err) {
        console.error('Error al verificar las credenciales', err);
        return res.status(500).send('Error al verificar las credenciales');
      }

      if (rows.length === 0) {
        console.log('No se encontró ningún usuario con ese correo electrónico');
        return res.redirect('/login');
      }

      const user = rows[0];

      // Comparar contraseña con bcrypt
      if (!bcrypt.compareSync(password, user.password)) {
        console.log('Contraseña incorrecta');
        return res.redirect('/login');
      }

      // Autenticación exitosa
      req.session.loggedin = true;
      req.session.name = user.name;
      res.redirect('/');
    });
  });
}


function logout(req, res) {
  if (req.session.loggedin) {
    req.session.destroy();
  }
  res.redirect('/');
}

// Cambia de `module.exports` a `export default`
export default {
  index,
  register,
  createUser,
  auth,
  logout,
};
