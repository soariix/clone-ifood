const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const http = require('http');

const root = __dirname;
const backendDir = path.join(root, 'backend');
const cfBin = path.join(root, 'node_modules', 'cloudflared', 'bin', 'cloudflared.exe');
const sh = process.platform === 'win32' ? 'cmd' : 'sh';
const flag = process.platform === 'win32' ? '/c' : '-c';

// Sobe o backend
const backend = spawn(sh, [flag, 'npm run dev'], { cwd: backendDir, stdio: 'pipe', shell: false });
backend.stdout.on('data', (d) => process.stdout.write(`\x1b[36m[BACKEND]\x1b[0m ${d}`));
backend.stderr.on('data', (d) => process.stderr.write(`\x1b[36m[BACKEND]\x1b[0m ${d}`));

// Aguarda o backend responder na porta 3333
function waitForBackend(retries = 20) {
    return new Promise((resolve, reject) => {
        function attempt(n) {
            const req = http.get('http://localhost:3333/health', (res) => {
                resolve();
            });
            req.on('error', () => {
                if (n <= 0) return reject(new Error('Backend não subiu'));
                setTimeout(() => attempt(n - 1), 1000);
            });
            req.end();
        }
        attempt(retries);
    });
}

async function main() {
    console.log('\x1b[33m[TUNNEL]\x1b[0m Aguardando backend ficar pronto...');
    await waitForBackend();
    console.log('\x1b[36m[TUNNEL]\x1b[0m Backend pronto! Criando tunnel...');

    const cf = spawn(cfBin, ['tunnel', '--url', 'http://localhost:3333', '--no-autoupdate'], {
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    function onData(data) {
        const match = data.toString().match(/https:\/\/[a-z0-9-]+\.trycloudflare\.com/);
        if (match) {
            const apiUrl = match[0];
            const envPath = path.join(root, '.env.local');
            let env = fs.readFileSync(envPath, 'utf8');
            env = env.replace(/EXPO_PUBLIC_API_URL=.*/g, `EXPO_PUBLIC_API_URL=${apiUrl}`);
            fs.writeFileSync(envPath, env);

            console.log(`\n\x1b[32m✅ Backend rodando!\x1b[0m`);
            console.log(`\x1b[32m✅ API pública: ${apiUrl}\x1b[0m`);
            console.log(`\x1b[32m✅ .env.local atualizado\x1b[0m`);
            console.log(`\n\x1b[33mAgora rode em outro terminal:\x1b[0m npx expo start --tunnel --clear\n`);
        }
    }

    cf.stdout.on('data', onData);
    cf.stderr.on('data', onData);
    process.on('SIGINT', () => { cf.kill(); backend.kill(); process.exit(0); });
}

main().catch(e => { console.error(e.message); process.exit(1); });
