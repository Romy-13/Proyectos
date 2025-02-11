import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { engine } from "express-handlebars";
import myconnection from "express-myconnection";
import mysql from "mysql";
import session from "express-session";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import { MercadoPagoConfig, Preference } from "mercadopago";
import loginRoutes from "./routes/login.js"

// Inicialización de dotenv
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configurar MercadoPago
const client = new MercadoPagoConfig({
  accessToken: "APP_USR-1160660466312499-092315-3c58f5fb00de223a71ac4953764a2f38-1995390814",
});

// Middleware de autenticación
const isAuthenticated = (req, res, next) => {
  if (req.session.loggedin) {
    next();
  } else {
    res.redirect("/login");
  }
};

// Configuración de Express
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Configurar vistas con Handlebars
app.set("views", path.join(__dirname, "../client/views"));
app.engine(
  ".hbs",
  engine({
    extname: ".hbs",
    layoutsDir: path.join(__dirname, "../client/views/layouts"),
    defaultLayout: "main",
  })
);
app.set("view engine", "hbs");

// Conexión a MySQL
app.use(
  myconnection(
    mysql,
    {
      host: "localhost",
      user: "root",
      password:"laujaz1706",
      port: 3306,
      database: "nodelogin",
    },
    "single"
  )
);

// Configuración de sesión
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// Ruta principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/index.html"));
});

// Rutas para login y registro
app.use("/", loginRoutes);

// Configurar archivos estáticos
app.use(express.static(path.join(__dirname, "../client")));


// Ruta de MercadoPago
app.post("/create_preference", async (req, res) => {
  try {
    const body = {
      items: [
        {
          title: req.body.title,
          quantity: Number(req.body.quantity),
          unit_price: Number(req.body.price),
          currency_id: "ARS",
        },
      ],
      back_urls: {
        success: "https://www.youtube.com/@virginiacastellano1789",
        failure: "https://www.youtube.com/@virginiacastellano1789",
        pending: "https://www.youtube.com/@virginiacastellano1789",
      },
      auto_return: "approved",
    };

    const preference = new Preference(client);
    const result = await preference.create({ body });
    res.json({
      id: result.id,
    });
  } catch (error) {
    console.error("Error creating preference:", error);
    res.status(500).json({ error: "An error occurred while creating the preference" });
  }
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`El servidor está corriendo en el puerto ${port}`);
});
