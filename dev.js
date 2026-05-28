const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

try {
    if (process.platform === 'win32') {
        execSync(
            'for /f "tokens=5" %a in (\'netstat -ano ^| findstr ":8081 :3333"\') do taskkill /F /PID %a 2>nul',
            { shell: 'cmd', stdio: 'ignore' }
        );
        execSync('taskkill /F /IM ngrok.exe 2>nul', { shell: 'cmd', stdio: 'ignore' });
    }
} catch (_) { }

const sh = process.platform === 'win32' ? 'cmd' : 'sh';
const flag = process.platform === 'win32' ? '/c' : '-c';
const cfBin = path.join(__dirname, 'node_modules', 'cloudflared', 'bin', 'cloudflared.exe');
const root = __dirname;
const backendDir = path.join(root, 'backend');

function run(cmd, cwd, label, color) {
    const child = spawn(sh, [flag, cmd], { cwd, stdio: 'pipe', shell: false });
    child.stdout.on('data', (d) => process.stdout.write(`\x1b[${color}m[${label}]\x1b[0m ${d}`));
    child.stderr.on('data', (d) => process.stderr.write(`\x1b[${color}m[${label}]\x1b[0m ${d}`));
    return child;
}

async function main() {
    // 1. Sobe o backend
    run('npm run dev', backendDir, 'BACKEND', '36');

    // 2. Cria tunnel Cloudflare para a API (porta 3333)
    console.log('\x1b[36m[SETUP]\x1b[0m Criando tunnel para a API...');
    const apiUrl = await new Promise((resolve, reject) => {
        const cf = spawn(cfBin, ['tunnel', '--url', 'http://localhost:3333', '--no-autoupdate'], {
            stdio: ['ignore', 'pipe', 'pipe'],
        });
        const timer = setTimeout(() => reject(new Error('Timeout tunnel API')), 25000);
        function onData(data) {
            const match = data.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
            if (match) { clearTimeout(timer); resolve(match[0]); }
        }
        cf.stdout.on('data', onData);
        cf.stderr.on('data', onData);
        cf.on('error', reject);
        process.on('SIGINT', () => { cf.kill(); process.exit(0); });
    });

    console.log(`\x1b[32m[SETUP]\x1b[0m API → ${apiUrl}`);

    // 3. Atualiza .env.local com a URL pública da API
    const envPath = path.join(root, '.env.local');
    let env = fs.readFileSync(envPath, 'utf8');
    env = env.replace(/EXPO_PUBLIC_API_URL=.*/g, `EXPO_PUBLIC_API_URL=${apiUrl}`);
    env = env.replace(/\nREACT_NATIVE_PACKAGER_HOSTNAME=.*/g, '');
    fs.writeFileSync(envPath, env);

    // 4. Sobe o Expo com --tunnel (ngrok) — igual ao que funcionava antes
    run('npx expo start --tunnel --clear', root, 'EXPO', '35');
}

main().catch(e => { console.error(e.message); process.exit(1); });

