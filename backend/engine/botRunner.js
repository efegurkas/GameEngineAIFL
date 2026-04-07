const { spawn }    = require('child_process');
const path         = require('path');
const fs           = require('fs');
const EventEmitter = require('events');

const BOTS_DIR   = path.join(__dirname, '..', 'bots');
const MOVE_TIMEOUT_MS = 5000; // Bot başına hamle için max süre

class BotRunner extends EventEmitter {
  constructor(teamName) {
    super();
    this.teamName   = teamName;
    this.process    = null;
    this.ready      = false;
    this.buffer     = '';
    this._moveResolve = null;
    this._moveTimer   = null;
  }

  getBotPath() {
    return path.join(BOTS_DIR, this.teamName, 'bot.py');
  }

  hasBot() {
    return fs.existsSync(this.getBotPath());
  }

  start() {
    return new Promise((resolve, reject) => {
      if (!this.hasBot()) {
        return reject(new Error(`${this.teamName} için bot.py bulunamadı`));
      }

      const botPath = this.getBotPath();

      this.process = spawn('python3', [botPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
        // Her bot izole working directory'de çalışır
        cwd: path.join(BOTS_DIR, this.teamName),
      });

      this.process.stdout.setEncoding('utf8');
      this.process.stderr.setEncoding('utf8');

      // stdout'u satır satır oku
      this.process.stdout.on('data', (chunk) => {
        this.buffer += chunk;
        const lines = this.buffer.split('\n');
        this.buffer = lines.pop(); // tamamlanmamış son satır beklemede

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;
          this._onLine(trimmed);
        }
      });

      this.process.stderr.on('data', (data) => {
        console.error(`[bot:${this.teamName}] stderr: ${data.trim()}`);
      });

      this.process.on('exit', (code) => {
        console.log(`[bot:${this.teamName}] process exited (code=${code})`);
        this.ready = false;
        this._rejectMove(new Error(`Bot process exit (code=${code})`));
        this.emit('exit', code);
      });

      this.process.on('error', (err) => {
        console.error(`[bot:${this.teamName}] spawn error:`, err.message);
        reject(err);
      });

      // Süreç başladı — hazır kabul et
      // (Bot'un başlangıç mesajı beklenmez, doğrudan hamle gönderilecek)
      this.ready = true;
      resolve();
    });
  }

  // Engine state'ini bot'a gönder, hamle al
  requestMove(state) {
    return new Promise((resolve, reject) => {
      if (!this.ready || !this.process) {
        return reject(new Error('Bot hazır değil'));
      }

      // Önceki bekleyen varsa temizle
      this._clearMoveTimeout();

      this._moveResolve = resolve;

      // Timeout
      this._moveTimer = setTimeout(() => {
        this._moveResolve = null;
        reject(new Error(`${this.teamName} zaman aşımı (${MOVE_TIMEOUT_MS}ms)`));
      }, MOVE_TIMEOUT_MS);

      // State'i JSON satırı olarak gönder
      const payload = JSON.stringify(state) + '\n';
      this.process.stdin.write(payload, 'utf8', (err) => {
        if (err) {
          this._clearMoveTimeout();
          this._moveResolve = null;
          reject(new Error(`stdin yazma hatası: ${err.message}`));
        }
      });
    });
  }

  _onLine(line) {
    if (!this._moveResolve) {
      console.warn(`[bot:${this.teamName}] beklenmeyen çıktı: ${line}`);
      return;
    }

    try {
      const move = JSON.parse(line);
      if (typeof move.x === 'number' && typeof move.y === 'number') {
        this._clearMoveTimeout();
        const resolve = this._moveResolve;
        this._moveResolve = null;
        resolve({ x: Math.round(move.x), y: Math.round(move.y) });
      } else {
        throw new Error('Geçersiz format');
      }
    } catch (err) {
      console.error(`[bot:${this.teamName}] JSON parse hatası: ${line}`);
      // Geçersiz çıktı → null döndür (engine geçersiz hamle sayar)
      this._clearMoveTimeout();
      const resolve = this._moveResolve;
      this._moveResolve = null;
      if (resolve) resolve({ x: -1, y: -1 });
    }
  }

  _clearMoveTimeout() {
    if (this._moveTimer) {
      clearTimeout(this._moveTimer);
      this._moveTimer = null;
    }
  }

  _rejectMove(err) {
    this._clearMoveTimeout();
    if (this._moveResolve) {
      // Geçersiz hamle döndür
      const resolve = this._moveResolve;
      this._moveResolve = null;
      resolve({ x: -1, y: -1 });
    }
  }

  kill() {
    this._clearMoveTimeout();
    this.ready = false;
    if (this.process) {
      try { this.process.kill('SIGTERM'); } catch {}
      this.process = null;
    }
  }
}

module.exports = BotRunner;