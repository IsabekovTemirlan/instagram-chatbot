import axios from 'axios';
import bodyParser from 'body-parser';
import express from 'express';

const app = express();
app.use(bodyParser.json());

const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
const PAGE_ACCESS_TOKEN = process.env.YOUR_PAGE_ACCESS_TOKEN;

// Endpoint для верификации вебхука
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('WEBHOOK_VERIFIED');
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  }
});

// Endpoint для получения сообщений
app.post('/webhook', (req, res) => {
  const body = req.body;

  if (body.object === 'instagram') {
    body.entry.forEach(function(entry) {
      const messaging = entry.messaging;

      messaging.forEach(function(event) {
        if (event.message && event.message.text) {
          const senderId = event.sender.id;
          const receivedMessage = event.message.text;

          // Отправляем ответ пользователю
          sendTextMessage(senderId, `Вы сказали: ${receivedMessage}`);
        }
      });
    });

    res.status(200).send('EVENT_RECEIVED');
  } else {
    res.sendStatus(404);
  }
});

// Функция для отправки сообщения пользователю
function sendTextMessage(senderId, text) {
  const messageData = {
    recipient: {
      id: senderId,
    },
    message: {
      text: text,
    },
  };

  axios.post(`https://graph.facebook.com/v13.0/me/messages?access_token=${PAGE_ACCESS_TOKEN}`, messageData)
    .then(response => {
      console.log('Message sent!');
    })
    .catch(error => {
      console.error('Error sending message:', error.response.data);
    });
}

app.listen(5050, () => {
  console.log('Server is running on port 5050');
});