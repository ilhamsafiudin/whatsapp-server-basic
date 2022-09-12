const { Client, MessageMedia, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const { body, validationResult } = require('express-validator');
const qrcode = require('qrcode-terminal');
const http = require('http');
const { phoneNumberFormatter, groupFormatter } = require('./helpers/formatter');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');

const port = process.env.PORT || 7456;

const app = express();
const server = http.createServer(app);

const api_key = '123456789';
var is_ready = false;

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.use(fileUpload({
  debug: false
}));

const client = new Client({
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
  },
  authStrategy: new LocalAuth({ clientId: "device1" })
});

client.initialize();

client.on('message', msg => {
  //console.log('MESSAGE RECEIVED', msg);
});

client.on('qr', (qr) => {
  console.log('Please scan QR Code..')
  qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
  console.log('READY');
  is_ready = true;
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED');
});

client.on('auth_failure', function (session) {
  console.error('AUTHENTICATION FAILURE');
  is_ready = false;
});

client.on('disconnected', (reason) => {
  console.error('DISCONNECTED', reason);
  is_ready = false;
  client.destroy();
  client.initialize();
});

const checkRegisteredNumber = async function (number) {
  const isRegistered = await client.isRegisteredUser(number);
  return isRegistered;
}

const findGroupByName = async function (name) {
  const group = await client.getChats().then(chats => {
    return chats.find(chat =>
      chat.isGroup && chat.name.toLowerCase() == name.toLowerCase()
    );
  });
  return group;
}

// send message
app.post('/send-message', [
  body('number').notEmpty(),
  body('message').notEmpty(),
], async (req, res) => {

  if (!req.header('API-KEY') || req.header('API-KEY') != api_key) {
    return res.status(422).json({
      status: false,
      message: "API Key wrong or not found"
    });
  }

  if (!is_ready) {
    return res.status(422).json({
      status: false,
      message: "Device not ready"
    });
  }

  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  const number = phoneNumberFormatter(req.body.number);
  const message = req.body.message;

  const isRegisteredNumber = await checkRegisteredNumber(number);

  if (!isRegisteredNumber) {
    return res.status(422).json({
      status: false,
      message: 'The number is not registered'
    });
  }

  client.sendMessage(number, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

// send group
app.post('/send-group-message', [
  body('id').custom((value, { req }) => {
    if (!value && !req.body.name) {
      throw new Error('Invalid value, you can use `id` or `name`');
    }
    return true;
  }),
  body('message').notEmpty(),
], async (req, res) => {

  if (!req.header('API-KEY') || req.header('API-KEY') != api_key) {
    return res.status(422).json({
      status: false,
      message: "API Key wrong or not found"
    });
  }

  if (!is_ready) {
    return res.status(422).json({
      status: false,
      message: "Device not ready"
    });
  }

  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }

  let chatId = groupFormatter(req.body.id);
  const groupName = req.body.name;
  const message = req.body.message;

  // Find the group by name
  if (!chatId) {
    const group = await findGroupByName(groupName);
    if (!group) {
      return res.status(422).json({
        status: false,
        message: 'No group found with name: ' + groupName
      });
    }
    chatId = group.id._serialized;
  }

  client.sendMessage(chatId, message).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

// send image
app.post('/send-image', [
  body('number').notEmpty(),
  body('caption').notEmpty(),
  body('file').notEmpty(),
], async (req, res) => {

  if (!req.header('API-KEY') || req.header('API-KEY') != api_key) {
    return res.status(422).json({
      status: false,
      message: "API Key wrong or not found"
    });
  }

  if (!is_ready) {
    return res.status(422).json({
      status: false,
      message: "Device not ready"
    });
  }

  const errors = validationResult(req).formatWith(({
    msg
  }) => {
    return msg;
  });

  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.mapped()
    });
  }
  
  const number = phoneNumberFormatter(req.body.number);
  const caption = req.body.caption;
  const fileUrl = req.body.file;

  let mimetype;
  const attachment = await axios.get(fileUrl, {
    responseType: 'arraybuffer'
  }).then(response => {
    mimetype = response.headers['content-type'];
    return response.data.toString('base64');
  });

  const media = new MessageMedia(mimetype, attachment, 'Media');

  client.sendMessage(number, media, {
    caption: caption
  }).then(response => {
    res.status(200).json({
      status: true,
      response: response
    });
  }).catch(err => {
    res.status(500).json({
      status: false,
      response: err
    });
  });
});

server.listen(port, function () {
  console.log('Whatsapp server running on *: ' + port);
});
