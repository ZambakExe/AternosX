const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const { Vec3 } = require('vec3');
const axios = require('axios');

const WEBHOOK_URL = 'YOUR_DISCORD_WEBHOOK_URL_HERE'; // Discord Webhook URL'nizi buraya ekleyin  | En : Add your Discord Webhook URL here

function sendWebhookMessage(message) {
  axios.post(WEBHOOK_URL, {
    content: message
  }).catch(error => {
    console.error('Discord Webhook hatası:', error);
  });
}

const centerPosition = new Vec3(0, 4, 0); // Merkez noktası (örneğin, (x=0, y=4, z=0) olarak düşünelim)  | En : Center point (for example, let's think of it as (x=0, y=4, z=0))
const squareSize = 3; // Kare boyutu (kenar uzunluğu)  | En : Square size (side length)
const moveInterval = 5000; // Her köşe hareketi arası bekleme süresi (milisaniye cinsinden)  | En : Waiting time between each corner movement (in milliseconds)

let cornerIndex = 0;
const corners = [
  centerPosition.offset(squareSize, 0, squareSize), // Sağ üst köşe  | En : upper right corner
  centerPosition.offset(-squareSize, 0, squareSize), // Sol üst köşe | En : upper left corner
  centerPosition.offset(-squareSize, 0, -squareSize), // Sol alt köşe | En : lower left corner
  centerPosition.offset(squareSize, 0, -squareSize) // Sağ alt köşe | En : Bottom right corner
];

function moveInSquare(bot) {
  const target = corners[cornerIndex];

  
  bot.once('move', () => checkCorner(bot, target));

  bot.pathfinder.setMovements(new Movements(bot, require('minecraft-data')(bot.version)));
  bot.pathfinder.setGoal(new goals.GoalBlock(target.x, target.y, target.z));

  // sendWebhookMessage(`Bot ${bot.username} hedefe doğru hareket ediyor: ${target}`); // Bu kod karakterin gittiği her yeri discorda atıyor (kodu açmak için kodun başındaki 2 slashı silin)  | En : This code sends the character to Discord wherever it goes (delete the 2 slashes at the beginning of the code to unlock the code).

  cornerIndex = (cornerIndex + 1) % corners.length;
}

function checkCorner(bot, target) {
  const pos = bot.entity.position.floored();
  if (pos.equals(target)) {
    
    const block = bot.blockAt(target);
    if (block && !block.boundingBox) {
      
      if (!bot.canDigBlock(block)) {
        console.log(`Köşedeki bloğu kırmaya yetkim yok: ${block.name}`);
        sendWebhookMessage(`Köşedeki bloğu kırmaya yetkim yok: ${block.name}`);
        
      } else {
        
        console.log(`Köşedeki bloğu kırıyorum: ${block.name}`);
        sendWebhookMessage(`Köşedeki bloğu kırıyorum: ${block.name}`);
        bot.dig(block);
      }
    }
  }
}

function createBot() {
  const bot = mineflayer.createBot({
    host: 'Server IP',    // Minecraft sunucusunun IP adresi
    port: 40297,          // Tr : Minecraft sunucusunun portu (varsayılan: 25565)   |   En : Port of the Minecraft server (default: 25565)
    username: 'ZambakExe',      // Tr : Botun kullanıcı adı   |   En : Bot's username
    version: '1.18'       // Tr : Minecraft sunucu sürümü (En fazla 1.20 diğer versiyonlar "Via Version ile çalışır")  |   En : Minecraft server version (Up to 1.20 other versions work with "Via Version")
  });

  
  bot.loadPlugin(pathfinder);

  bot.on('login', () => {
    console.log('Bot sunucuya bağlandı'); // Terminal : Bot connected to server
    sendWebhookMessage('Bot sunucuya bağlandı'); // Discord WebHook : Bot connected to server
  });

  bot.on('spawn', () => {
    console.log('Bot spawn oldu'); // Discord WebHook : Bot spawned
    sendWebhookMessage('Bot spawn oldu'); // Discord WebHook : Bot spawned
    moveInSquare(bot);
    setInterval(() => moveInSquare(bot), moveInterval); 
  });

  bot.on('chat', (username, message) => {
    if (username === bot.username) return;
    console.log(`${username}: ${message}`);
    sendWebhookMessage(`${username} dedi ki: ${message}`);

    if (message === 'selam bot') { // Tr : Mesaj (Bu kodu değiştirenilirsin) |   En : Message (You can change this code)
      bot.chat('Selam!'); // Tr : Dönüt (Bu kodu değiştirenilirsin) |   En : Feedback (You can change this code)
    }
  });

  bot.on('error', err => {
    console.error(`Bot hatası: ${err}`);
    sendWebhookMessage(`Bot hatası: ${err}`);
    setTimeout(createBot, 5000); // Tr : 5 saniye sonra yeniden bağlan  |   En : Reconnect after 5 seconds
  });

  bot.on('end', () => {
    console.log('Bot sunucudan ayrıldı');
    sendWebhookMessage('Bot sunucudan ayrıldı');
    setTimeout(createBot, 5000); // 5 saniye sonra yeniden bağlan  |   En : Reconnect after 5 seconds
  });

  bot.on('kicked', (reason, loggedIn) => {
    console.log(`Bot sunucudan atıldı: ${reason}`); // Terminal : Bot was kicked from the server
    sendWebhookMessage(`Bot sunucudan atıldı: ${reason}`); // Discord WebHook : Bot was kicked from the server
  });

  bot.on('death', () => {
    console.log('Bot öldü'); // Discord WebHook : The bot is dead
    sendWebhookMessage('Bot öldü'); // Discord WebHook : The bot is dead
  });
}

createBot();
