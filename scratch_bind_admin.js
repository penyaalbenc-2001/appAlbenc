const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function bindAdmin() {
  try {
    // Busca l'ID de l'usuari admin
    const { rows: users } = await pool.query("SELECT id, email FROM auth.users WHERE email = 'penyaalbenc@gmail.com'");
    
    if (users.length > 0) {
      const adminId = users[0].id;
      console.log('Admin Auth ID:', adminId);
      
      // Vincula'l al membre "Administrador"
      await pool.query("UPDATE membres SET usuari_id_auth = $1 WHERE nom = 'Administrador'", [adminId]);
      console.log('Administrador vinculat amb èxit!');
    } else {
      console.log('No s\'ha trobat cap usuari amb eixe correu a auth.users');
    }
    
    // Per curiositat, comprovem com estan els membres
    const { rows: membres } = await pool.query("SELECT nom, usuari_id_auth FROM membres WHERE usuari_id_auth IS NOT NULL");
    console.log('Membres vinculats:', membres);
    
  } catch (e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}

bindAdmin();
