/**
 * Crea un usuario en Clerk desde la línea de comandos (para el primer usuario o sin tener sesión en el CMS).
 * Uso: node scripts/create-cms-user.js [email] [password] [firstName] [lastName]
 * O sin argumentos usa los valores por defecto abajo.
 */
import 'dotenv/config';

const CLERK_API = 'https://api.clerk.com/v1';

const [,, email, password, firstName, lastName] = process.argv;

const defaultEmail = email || 'urzuavales@gmail.com';
const defaultPassword = password || 'ClaveSegura1';
const defaultFirstName = firstName || 'Valentin';
const defaultLastName = lastName || 'Urzua';

async function main() {
  const key = process.env.CLERK_SECRET_KEY;
  if (!key) {
    console.error('Falta CLERK_SECRET_KEY en .env');
    process.exit(1);
  }

  const body = {
    email_address: [defaultEmail.trim().toLowerCase()],
    password: defaultPassword,
    first_name: defaultFirstName.trim() || undefined,
    last_name: defaultLastName.trim() || undefined,
  };

  const r = await fetch(`${CLERK_API}/users`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await r.json().catch(() => ({}));

  if (!r.ok) {
    console.error('Error al crear usuario:', data.errors?.[0]?.message || data.message || r.status);
    process.exit(1);
  }

  console.log('Usuario creado en Clerk:');
  console.log('  ID:', data.id);
  console.log('  Correo:', data.email_addresses?.[0]?.email_address ?? defaultEmail);
  console.log('  Nombre:', [data.first_name, data.last_name].filter(Boolean).join(' '));
  console.log('');
  console.log('Ya puede iniciar sesión en clerk-javascript (o donde tengas Clerk) con ese correo y contraseña.');
}

main();
