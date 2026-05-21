const os = require('os');
const fs = require('fs');
const path = require('path');

function getLocalIp() {
  const interfaces = os.networkInterfaces();
  let bestIp = null;
  
  for (const name of Object.keys(interfaces)) {
    // Evitar adaptadores de máquinas virtuales o WSL que no suelen ser accesibles por el móvil
    const nameLower = name.toLowerCase();
    if (nameLower.includes('vmware') || 
        nameLower.includes('virtualbox') ||
        nameLower.includes('wsl') ||
        nameLower.includes('veth') ||
        nameLower.includes('loopback')) continue;
        
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        // Guardamos la primera IP válida encontrada por si acaso
        bestIp = bestIp || iface.address;
        
        // Priorizamos interfaces de red comunes para móviles
        if (nameLower.includes('wi-fi') || nameLower.includes('wlan') || nameLower.includes('hotspot') || nameLower.includes('ethernet')) {
           return iface.address;
        }
      }
    }
  }
  return bestIp || '127.0.0.1';
}

const newIp = getLocalIp();
console.log(`\n📡 IP Local Detectada: ${newIp}`);

const configPath = path.join(__dirname, '../config/config.js');

try {
  if (fs.existsSync(configPath)) {
    let configContent = fs.readFileSync(configPath, 'utf8');
    
    // Reemplaza la IP estática con la nueva IP detectada
    configContent = configContent.replace(/const host = ['"][\d.]+['"];/, `const host = '${newIp}';`);
    
    fs.writeFileSync(configPath, configContent);
    console.log(`✅ ¡config.js actualizado con éxito! Nuevo host: ${newIp}\n`);
  } else {
    console.error(`❌ No se encontró el archivo: ${configPath}`);
  }
} catch (error) {
  console.error('❌ Error actualizando config.js:', error);
}
