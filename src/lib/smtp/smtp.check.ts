import 'dotenv/config';
import { smtp, PROVIDERS } from './smtp';

const args = process.argv.slice(2);

async function check() {
  console.log('🔍 SMTP Universal Checker\n');

  // Affiche les providers supportés
  if (args[0] === 'providers') {
    console.log('Providers supportés :');
    Object.entries(PROVIDERS).forEach(([key, config]) => {
      console.log(`  ${key.padEnd(15)} → ${config.host}:${config.port}`);
    });
    process.exit(0);
  }

  // Vérification configuration
  const config = smtp.getConfig();
  console.log(`Provider : ${config.name}`);
  console.log(`Serveur  : ${config.host}:${config.port}`);
  console.log(`Secure   : ${config.secure}`);
  console.log(`RequireTLS : ${config.requireTLS}`);
  console.log(`Pool     : ${config.pool}`);
  console.log('');

  // Test connexion
  console.log('⏳ Test de connexion...');
  const verifyResult = await smtp.verify();

  if (!verifyResult.success) {
    console.error('❌ CONNEXION ÉCHOUÉE');
    console.error(`   Code : ${verifyResult.error?.code}`);
    console.error(`   Msg  : ${verifyResult.error?.message}`);
    console.error(`   Retry: ${verifyResult.error?.retryable ? 'Oui' : 'Non'}`);
    await smtp.close();
    process.exit(1);
  }

  console.log('✅ Connexion OK\n');

  // Test envoi si email fourni
  const testEmail = args.find(a => a.includes('@'));
  if (testEmail) {
    console.log(`⏳ Test d'envoi à ${testEmail}...`);

    const result = await smtp.send({
      to: testEmail,
      subject: `Test SMTP [${config.name}] - ${new Date().toISOString()}`,
      text: `Ceci est un test envoyé via ${config.name}.\nConfig: ${config.host}:${config.port}`,
      html: `<h1>Test SMTP</h1><p>Provider: <strong>${config.name}</strong></p><p>Server: ${config.host}:${config.port}</p>`
    });

    if (result.success) {
      console.log('✅ Email envoyé');
      console.log(`   ID: ${result.messageId}`);
    } else {
      console.error('❌ Échec envoi');
      console.error(`   Code : ${result.error?.code}`);
      console.error(`   Msg  : ${result.error?.message}`);
      console.error(`   Retry: ${result.error?.retryable ? 'Oui' : 'Non'}`);
      await smtp.close();
      process.exit(1);
    }
  }

  await smtp.close();
  console.log('\n🏁 Terminé');
  process.exit(0);
}

check().catch(async (err) => {
  console.error('💥 Erreur fatale:', err.message);
  try {
    await smtp.close();
  } catch { /* ignore close errors during fatal exit */ }
  process.exit(1);
});