const express = require('express');
const app = express();
const port = 3000; // o el puerto que prefieras
const qr = require('qr-image');

app.set('view engine', 'ejs'); // Establece el motor de plantillas a EJS
app.use(express.static('public'));
const router = express.Router();

// Configurar middlewares y enrutadores aquí

app.listen(port, () => {
  console.log(`Servidor ejecutado en http://localhost:${port}`);
});

const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '12345678',
  database: 'validacionv1'
});

// Comprueba si la conexión es exitosa
connection.connect((err) => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión exitosa a la base de datos');
});

//VALIDAR MEDIANTE PLANTILLA
router.get('/validar', (req, res) => {
  const certificadoIdentificador = req.query.identificador;

  // Realiza una consulta a la base de datos para verificar el certificado
  connection.execute('SELECT * FROM certificados WHERE identificador = ?', [certificadoIdentificador], (err, results) => {
      if (err) {
          console.error('Error al consultar la base de datos:', err);
          res.status(500).send('Error interno del servidor');
          return;
      }

      if (results.length === 0) {
          // Certificado no encontrado
          res.redirect('/?certificadoNoEncontrado=true'); // Redirige a la página principal con el parámetro de certificadoNoEncontrado
      } else {
          const certificado = results[0];
          res.render('resultado', { certificado, certificadoNoEncontrado: false });
      }
  });
});

router.get('/validar/:identificador', (req, res) => {
    const certificadoIdentificador = req.params.identificador;
  
    // Realiza una consulta preparada a la base de datos para verificar el certificado
    connection.execute('SELECT * FROM certificados WHERE identificador = ?', [certificadoIdentificador], (err, results) => {
      if (err) {
        console.error('Error al consultar la base de datos:', err);
        res.status(500).send('Error interno del servidor');
        return;
      }
  
      if (results.length === 0) {
        res.status(404).send('Certificado no encontrado');
      } else {
        const certificado = results[0];
        // Realiza las comprobaciones necesarias en el certificado
        // Puedes devolver la información del certificado en JSON o renderizar una plantilla
        res.json(certificado);
      }
    });
});

// Ruta para generar el código QR
router.get('/generarQR/:identificador', (req, res) => {
    const certificadoIdentificador = req.params.identificador;
    const enlace = `http://localhost:3000/validar?identificador=${certificadoIdentificador}`;

    // Realiza una consulta a la base de datos para verificar si el identificador existe
    connection.execute('SELECT * FROM certificados WHERE identificador = ?', [certificadoIdentificador], (err, results) => {
        if (err) {
        console.error('Error al consultar la base de datos:', err);
        res.status(500).send('Error interno del servidor');
        return;
        }

        if (results.length === 0) {
        res.send('Certificado no encontrado');
        } else {
        // Genera el código QR con el identificador del certificado
        const qrCode = qr.image(enlace, { type: 'png' });
        res.type('png');
        qrCode.pipe(res);
        }
    });
});

// Registra el enrutador en la aplicación principal
app.use('/', router);
