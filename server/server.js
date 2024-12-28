// server.js
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const socketIo = require('socket.io');
const http = require('http');
const axios = require('axios');
const {
  Console
} = require('console');
const SibApiV3Sdk = require('sib-api-v3-sdk');
const {
  getPriority
} = require('os');

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
const io = socketIo(server);
const serverAPIURL = 'http://192.168.31.119:5000'

const admin = require('firebase-admin');

// Initialize Firebase Admin with your service account key
const serviceAccount = require('./mytrash-29376-firebase-adminsdk-1mpnm-bcc2249c40.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});


// Middleware
app.use(bodyParser.json());
app.use(cors({
  origin: '*', // Allow requests from any origin
}));

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/mytrashdb', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// User Schema
const UserSchema = new mongoose.Schema({
  name: String,
  number: String,
  state: String,
  houseNumber: String,
  city: String,
  pincode: String,
  dob: String,
  email: String,
  password: String,
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  profilepic: {
    type: String,
    required: [false]
  },
});


const User = mongoose.model('User', UserSchema);

const itemSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: String,
  imageUri: [String],
  latitude: Number,
  longitude: Number,
  sellername: String,
  phone: String,
  email: String
});

const messageSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  sender_email: {
    type: String,
    required: true
  },
  timestamp: {
    type: String,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'location'],
    required: true
  },
  content: {
    type: String,
    required: true
  }
});

// Define the schema for a chat
const chatSchema = new mongoose.Schema({
  item: {
    type: itemSchema,
    required: true
  },
  buyer_email: {
    type: String,
    required: true
  },
  messages: [messageSchema]
});

const buyerListSchema = new mongoose.Schema({
  item: {
    type: itemSchema,
    required: true
  },
  buyer_email: [String],
});

///////////////////////////////////////////////

const dealsSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  currently_dealing: {
    type: [itemSchema],
    required: true
  },
  sold_items: {
    type: [itemSchema],
    required: true
  },
  bought_items: {
    type: [itemSchema],
    required: true
  }
});

const Dealdata = mongoose.model('Dealdata', dealsSchema);

///////////////////////////////////////////////

// Create the model
const Chat = mongoose.model('Chat', chatSchema);
const BuyerList = mongoose.model('BuyerList', buyerListSchema);


const Item = mongoose.model('Item', itemSchema);

const tokenSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  enabled: {
    type: Boolean,
    required: true
  },
  expoPushTokens: {
    type: [String],
    required: true
  },
});

// Create the model
const Token = mongoose.model('Token', tokenSchema);


/////////////////////////////////////////////////////////////////////

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Destination folder for storing uploads
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${file.originalname}`); // Unique filename
  },
});


/////////////////////////////////////////////////////////////////////


// Initialize multer upload with the configured storage
const upload = multer({
  storage
});

// Middleware to parse JSON bodies
app.use(express.json());

// Serve the uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


function haversineDistance(lat1, lon1, lat2, lon2) {
  // console.log(lat1, lon1, lat2, lon2)

  function toRadians(degrees) {
    return degrees * Math.PI / 180;
  }

  const R = 6371; // Radius of the Earth in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon1 - lon2);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance); // Return distance rounded to the nearest integer
}


//server.js 
// Register User
app.post('/api/register', async (req, res) => {
  const {
    name,
    number,
    state,
    houseNumber,
    city,
    pincode,
    dob,
    email,
    password,
    latitude,
    longitude
  } = req.body;

  try {
    const user = await User.findOne({
      email
    });
    if (user) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    // const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      number,
      state,
      houseNumber,
      city,
      pincode,
      dob,
      email,
      password,
      latitude,
      longitude
    });

    await newUser.save();

    res.status(200).json({
      message: 'User registered successfully'
    });
  } catch (err) {
    res.status(500).json({
      message: 'Server error'
    });
  }
});

app.post('/api/upload', upload.array('images'), async (req, res) => {
  const {
    name,
    description,
    category,
    latitude,
    longitude,
    sellername,
    phone,
    email
  } = req.body;
  const imageUri = req.files.map(file => file.path);

  const newItem = new Item({
    name: name,
    description: description,
    category: category,
    imageUri: imageUri,
    latitude: Number(latitude),
    longitude: Number(longitude),
    sellername: sellername,
    phone: phone,
    email: email
  });

  // console.log(newItem);

  try {
    await newItem.save();
    res.status(200).json({
      message: 'Item uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Error uploading item',
      error
    });
  }
});

app.post('/api/profilepic', upload.single('image'), async (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded'
    });
  }
  const {
    email
  } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    const updated_profilepic = await User.findOneAndUpdate({
      email: email
    }, {
      profilepic: imageUrl
    }, {
      new: true
    });
  } catch (error) {
    console.log(error);
  } finally {
    res.status(200).json({
      message: 'updated',
      url: imageUrl
    });
  }
});

app.post('/api/updateuser', async (req, res) => {
  const {
    name,
    number,
    state,
    houseNumber,
    city,
    pincode,
    dob,
    email,
    latitude,
    longitude
  } = req.body;

  try {
    // Find user by email and update fields
    let user = await User.findOneAndUpdate({
      email: email
    }, {
      $set: {
        name,
        number,
        state,
        houseNumber,
        city,
        pincode,
        dob,
        latitude,
        longitude,
      }
    }, {
      new: true
    });

    await Item.updateMany({
      email: email
    }, {
      $set: {
        latitude: latitude,
        longitude: longitude,
        sellername: name,
        phone: number
      }
    });

    await Chat.updateMany({
      'item.email': email
    }, {
      $set: {
        'item.latitude': latitude,
        'item.longitude': longitude,
        'item.sellername': name,
        'item.phone': number
      }
    });

    await BuyerList.updateMany({
      'item.email': email
    }, {
      $set: {
        'item.latitude': latitude,
        'item.longitude': longitude,
        'item.sellername': name,
        'item.phone': number
      }
    });


    const update = {
      $set: {
        'currently_dealing.$[elem].latitude': latitude,
        'currently_dealing.$[elem].longitude': longitude,
        'currently_dealing.$[elem].sellername': name,
        'currently_dealing.$[elem].phone': number,
        'sold_items.$[elem].latitude': latitude,
        'sold_items.$[elem].longitude': longitude,
        'sold_items.$[elem].sellername': name,
        'sold_items.$[elem].phone': number,
        'bought_items.$[elem].latitude': latitude,
        'bought_items.$[elem].longitude': longitude,
        'bought_items.$[elem].sellername': name,
        'bought_items.$[elem].phone': number
      }
    };

    // Define the array filters
    const arrayFilters = [{
      'elem.email': email
    }];

    // Use updateMany to update all matching documents
    const result = await Dealdata.updateMany({
        $or: [{
            currently_dealing: {
              $elemMatch: {
                email: email
              }
            }
          },
          {
            sold_items: {
              $elemMatch: {
                mail: email
              }
            }
          },
          {
            bought_items: {
              $elemMatch: {
                email: email
              }
            }
          }
        ]
      },
      update, {
        arrayFilters: arrayFilters
      }
    );

    if (!user) {
      return res.status(404).json({
        msg: 'User not found'
      });
    }

    res.json(user); // Return updated user data
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});




let defaultClient = SibApiV3Sdk.ApiClient.instance;
let apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = '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';


app.post('/api/login', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;
    const user = await User.findOne({
      email,
      password
    });
    if (user) {
      res.status(200).send({
        message: 'login successful'
      });
    } else {
      res.status(200).send({
        message: 'Incorrect Username or Password'
      });
    }
  } catch (err) {
    res.status(500).send(err);
  }
});


app.post('/api/getuser', async (req, res) => {

  const {
    email
  } = req.body;


  try {
    const userdata = await User.findOne({
      email: email
    });
    res.status(200).json(userdata);
    // console.log("defrghjmgfdsadfghjgfdsfghjgfdsdfbgdsafgbnfd");
  } catch (error) {
    res.status(500).json({
      message: 'user doesnt exist'
    });
  }
});

app.post('/api/getitem', async (req, res) => {
  const categories = req.body.categories;
  const distances = req.body.distances;
  const searchbox = req.body.searchbox;
  const buyerlatitude = req.body.latitude;
  const buyerlongitude = req.body.longitude;

  let Items = [];

  // console.log(categories);

  let isFirstFilterApplied = false;
  let isAnyFilterApplied = false;

  try {

    try {
      //category filter
      for (let j = 0; j < categories.length; j++) {
        if (categories[j].checked) {
          isFirstFilterApplied = true;
          isAnyFilterApplied = true;

          const list = await Item.find({
            category: categories[j].value
          });

          Items = Items.concat(list);

        }
      }
    } catch (error) {
      console.log(error);
      res.status(501).json({
        message: 'Error ',
        error
      });
    }




    try {
      if (isFirstFilterApplied) {

        for (let j = 0; j < distances.length; j++) {
          if (distances[j].checked) {

            isAnyFilterApplied = true;
            for (let index = 0; index < Items.length; index++) {
              const element = Items[index];
              dist = haversineDistance(buyerlatitude, buyerlongitude, element.latitude, element.longitude);
              if (distances[j].key == '1' && !(dist < 3)) {

                Items.splice(Items.indexOf(element), 1);

              }
              if (distances[j].key == '2' && !(dist >= 3 && dist < 10)) {

                Items.splice(Items.indexOf(element), 1);

              }
              if (distances[j].key == '3' && !(dist >= 10 && dist < 20)) {

                Items.splice(Items.indexOf(element), 1);

              }
              if (distances[j].key == '4' && !(dist >= 20 && dist < 40)) {

                Items.splice(Items.indexOf(element), 1);

              }
              if (distances[j].key == '5' && !(dist >= 40)) {

                Items.splice(Items.indexOf(element), 1);

              }
            }
          }
        }

      } else {

        let itemdata = await Item.find({});
        for (let j = 0; j < distances.length; j++) {
          if (distances[j].checked) {
            isAnyFilterApplied = true;
            for (let index = 0; index < itemdata.length; index++) {
              const element = itemdata[index];
              dist = haversineDistance(buyerlatitude, buyerlongitude, element.latitude, element.longitude);
              if (distances[j].key == '1' && dist < 3) {
                if (!Items.includes(element)) {
                  Items.push(element);
                }
              }
              if (distances[j].key == '2' && dist >= 3 && dist < 10) {
                if (!Items.includes(element)) {
                  Items.push(element);
                }
              }
              if (distances[j].key == '3' && dist >= 10 && dist < 20) {
                if (!Items.includes(element)) {
                  Items.push(element);
                }
              }
              if (distances[j].key == '4' && dist >= 20 && dist < 40) {
                if (!Items.includes(element)) {
                  Items.push(element);
                }
              }
              if (distances[j].key == '5' && dist >= 40) {
                if (!Items.includes(element)) {
                  Items.push(element);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.log(error);
      res.status(502).json({
        message: 'Error ',
        error
      });
    }

    try {
      if (isAnyFilterApplied) {
        r = [];
        for (let index = 0; index < Items.length; index++) {
          const element = Items[index];
          if (element.name.toLowerCase().includes(searchbox.toLowerCase()) || element.sellername.toLowerCase().includes(searchbox.toLowerCase())) {
            r.push(element);
          }
        }
        Items = r
      } else {
        let itemdata = await Item.find({});
        for (let index = 0; index < itemdata.length; index++) {
          const element = itemdata[index];
          if (element.name.toLowerCase().includes(searchbox.toLowerCase()) || element.sellername.toLowerCase().includes(searchbox.toLowerCase())) {
            if (!Items.includes(element)) {
              Items.push(element);
            }
          }
        }
      }
    } catch (error) {
      res.status(503).json({
        message: 'Error ',
        error
      });
    }



    try {
      let Radius = [];

      for (let index = 0; index < Items.length; index++) {
        const element = Items[index];
        Radius.push(haversineDistance(buyerlatitude, buyerlongitude, element.latitude, element.longitude));
      }

      res.status(200).json({
        Items: Items,
        Radius: Radius
      });
    } catch (error) {
      res.status(504).json({
        message: 'Error ',
        error
      });
    }


  } catch (error) {
    console.log(error)
    res.status(500).json({
      message: 'Error ',
      error
    });
  }

});

app.post('/api/getfirstitems', async (req, res) => {
  const buyerlatitude = req.body.latitude;
  const buyerlongitude = req.body.longitude;
  try {
    // Find the last 50 items or fewer if there aren't 50 items
    const items = await Item.find({})
      .sort({
        _id: -1
      }) // Sort by ObjectId in descending order
      .limit(50); // Limit to 50 items or fewer if less are available


    let Radius = [];

    for (let index = 0; index < items.length; index++) {
      const element = items[index];
      Radius.push(haversineDistance(buyerlatitude, buyerlongitude, element.latitude, element.longitude));
    }

    res.status(200).json({
      Items: items,
      Radius: Radius
    });
  } catch (error) {
    console.error('Error retrieving items:', error);
    res.status(500).send('Server Error');
  }
});



app.post('/api/send-email', async (req, res) => {

  const {
    email2
  } = req.body;

  let email = email2;
  const user = await User.findOne({
    email
  });


  if (user) {

    const msg = {
      to: email2,
      from: 'projectyofficial2024@gmail.com',
      subject: "MyTrash Recovery Email",
      text: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>MyTrash - Recover password</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    border: 1px solid #ccc;
                }
                h1 {
                    font-size: 24px;
                    margin-bottom: 20px;
                }
                p {
                    margin-bottom: 10px;
                }
                .credential {
                    background-color: #f0f0f0;
                    padding: 10px;
                    border: 1px solid #ccc;
                    border-radius: 4px;
                    margin-bottom: 10px;
                }
                .label {
                    font-weight: bold;
                    margin-right: 10px;
                }
                .value {
                    font-family: monospace;
                    color: #0066cc;
                }
              
            </style>
        </head>
        <body>
            <h1>MyTrash🗑️</h1>
            <h2>Password Recovery</h2>
            
            <p>Hi ${user.name}👋,</p>
            
            <p>Forgot your password?<br>
            We received a request to recover the password for your account.</p>
            
            <p>Please Try Logging in to the App with the credentials below:</p>
          
            <div class="credential">
                <span class="label">Your Email:</span>
                <span class="value">${email2}</span>
            </div>
            
            <div class="credential">
                <span class="label">Your Password:</span>
                <span class="value">${user.password}</span>
            </div>
            
        </body>
        </html>`,
    };



    let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

    let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    sendSmtpEmail.subject = msg.subject;
    sendSmtpEmail.htmlContent = `${msg.text}`;
    sendSmtpEmail.sender = {
      name: 'My Trash',
      email: msg.from
    };
    sendSmtpEmail.to = [{
      email: msg.to,
      name: user.name
    }];

    apiInstance.sendTransacEmail(sendSmtpEmail).then((data) => {
      res.status(200).json({
        message: 'Recovery Email sent. Please check Your Mail Inbox',
        data
      });
    }, (error) => {
      // res.status(500).json({ error: error.message, message: 'An Error Occured. Please try again.' }); // WITH ERROR CODE 500
      res.status(200).json({
        error: error.message,
        message: 'An Error Occured. Please try again.'
      });
    });



  } else {
    res.status(200).send({
      message: 'User doesnt Exist. Please Enter your registered Email ID'
    });
  }


});


app.post('/api/imagemessage', upload.single('image'), async (req, res) => {

  if (!req.file) {
    return res.status(400).json({
      error: 'No file uploaded'
    });
  }
  const {
    id,
    sender_email,
    timestamp,
    type,
    content,
    item,
    buyer_email,
    chatRoomId
  } = req.body;
  const imageUrl = `/uploads/${req.file.filename}`;

  let parseditem = JSON.parse(item);

  if (sender_email === buyer_email) {
    const user = await axios.post(`${serverAPIURL}/api/getuser`, {
      email: sender_email
    });
    const username = user.data.name;
    const message2 = {
      title: `A New Message from ${username}`,
      body: `For ${parseditem.name}`,
      email: parseditem.email,
      data: {
        item: parseditem,
        isUserSeller: true,
        buyer_email: buyer_email
      }
    };

    try {
      await axios.post(`${serverAPIURL}/send-expo-notification`, message2);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  } else {
    const user = await axios.post(`${serverAPIURL}/api/getuser`, {
      email: sender_email
    });
    const username = user.data.name;
    const message2 = {
      title: `A New Message from ${username}`,
      body: `For ${parseditem.name}`,
      email: buyer_email,
      data: {
        item: parseditem,
        isUserSeller: false,
        buyer_email: " "
      }
    };

    try {
      await axios.post(`${serverAPIURL}/send-expo-notification`, message2);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  // console.log(req.body);

  try {
    const updated_chat = await Chat.findOneAndUpdate({
        item: parseditem,
        buyer_email: buyer_email
      }, //////////////CHAN
      {
        $push: {
          messages: {
            id: id,
            sender_email: sender_email,
            timestamp: timestamp,
            type: type,
            content: imageUrl
          }
        }
      }
    );
  } catch (error) {
    console.log(error);
  } finally {
    io.to(chatRoomId).emit('newMessage', {
      chatRoomId
    });
    res.status(200).json({
      message: 'sent'
    });
  }
});


app.post('/api/message', async (req, res) => {

  const {
    message,
    item,
    buyer_email,
    chatRoomId
  } = req.body;


  if (message.sender_email === buyer_email) {
    const user = await axios.post(`${serverAPIURL}/api/getuser`, {
      email: message.sender_email
    });
    const username = user.data.name;
    const message2 = {
      title: `A New Message from ${username}`,
      body: `For ${item.name}`,
      email: item.email,
      data: {
        item: item,
        isUserSeller: true,
        buyer_email: buyer_email
      }
    };

    try {
      await axios.post(`${serverAPIURL}/send-expo-notification`, message2);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  } else {
    const user = await axios.post(`${serverAPIURL}/api/getuser`, {
      email: message.sender_email
    });
    const username = user.data.name;
    const message2 = {
      title: `A New Message from ${username}`,
      body: `For ${item.name}`,
      email: buyer_email,
      data: {
        item: item,
        isUserSeller: false,
        buyer_email: ""
      }
    };
    try {
      await axios.post(`${serverAPIURL}/send-expo-notification`, message2);
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }


  const updated_chat = await Chat.findOneAndUpdate({
    item: item,
    buyer_email: buyer_email
  }, {
    $push: {
      messages: {
        id: message.id,
        sender_email: message.sender_email,
        timestamp: message.timestamp,
        type: message.type,
        content: message.content
      }
    }
  });
  io.to(chatRoomId).emit('newMessage', {
    chatRoomId
  });
  res.status(200).json({
    message: 'sent'
  });
});


app.post('/api/getbuyerlist', async (req, res) => {
  const {
    item
  } = req.body;
  try {
    const buyerlist = await BuyerList.findOne({
      item: item
    });
    if (buyerlist) {
      res.status(200).json({
        buyer_list: buyerlist.buyer_email
      });
    } else {
      res.status(200).json({
        buyer_list: []
      });
    }
  } catch (err) {
    console.log("BUYER LIST ERROR", err);
  }
});

app.post('/api/getchat', async (req, res) => {

  // console.log("getchatcalled");

  const {
    item,
    buyer_email
  } = req.body;
  const chat = await Chat.findOne({
    item: item,
    buyer_email: buyer_email
  });
  const user = await axios.post(`${serverAPIURL}/api/getuser`, {
    email: buyer_email
  });


  const username = user.data.name;
  if (chat) {
    res.status(200).json({
      messages: chat.messages
    });
  } else {
    const newChat = new Chat({
      item: item,
      buyer_email: buyer_email,
      messages: []
    });

    const buyerlist = await BuyerList.findOne({
      item: item
    });

    if (buyerlist) {
      if (!buyerlist.buyer_email.includes(buyer_email)) {
        const updated_data = await BuyerList.findOneAndUpdate({
            item: item
          }, // Find the document by a specific field
          {
            buyer_email: buyerlist.buyer_email.concat([buyer_email])
          }, {
            new: true
          }
        );
        const message2 = {
          title: `A New Offer is made for ${item.name}`,
          body: `From ${username}`,
          email: item.email,
          data: {
            item: item,
            isUserSeller: true,
            buyer_email: buyer_email
          }
        };

        try {
          // console.log(message2);
          await axios.post(`${serverAPIURL}/send-expo-notification`, message2);
        } catch (error) {
          console.error('Error sending notification:', error);
        }
      }
    } else {
      const newBuyerList = new BuyerList({
        item: item,
        buyer_email: [buyer_email]
      });
      const message2 = {
        title: `A New Offer is made for ${item.name}`,
        body: `From ${username}`,
        email: item.email,
        data: {
          item: item,
          isUserSeller: true,
          buyer_email: buyer_email
        }
      };

      try {
        // console.log(message2);
        await axios.post(`${serverAPIURL}/send-expo-notification`, message2);
      } catch (error) {
        console.error('Error sending notification:', error);
      }
      await newBuyerList.save();
    }

    await newChat.save();

    const dealerdata = await Dealdata.findOne({
      email: buyer_email
    });

    if (dealerdata) {
      const updatedDeal = await Dealdata.findOneAndUpdate({
        email: buyer_email
      }, {
        $push: {
          currently_dealing: item
        }
      }, {
        new: true,
        useFindAndModify: false
      });
    } else {
      const newdealerdata = new Dealdata({
        email: buyer_email,
        currently_dealing: [item],
        sold_items: [],
        bought_items: []
      });

      await newdealerdata.save();
    }

    res.status(200).json({
      messages: newChat.messages
    });
  }

  // res.status(200).json({ imageUrl });
});


app.post('/api/deleteitem', async (req, res) => {
  try {
    const {
      item,
      buyerlist
    } = req.body;
    await Item.deleteOne({
      _id: item._id
    });
    await BuyerList.deleteOne({
      'item._id': item._id
    });
    await Chat.deleteMany({
      'item._id': item._id
    });

    for (let index = 0; index < buyerlist.length; index++) {
      const element = buyerlist[index];
      const updatedDeal = await Dealdata.findOneAndUpdate({
        email: element
      }, {
        $pull: {
          currently_dealing: {
            _id: item._id
          }
        }
      }, {
        new: true,
        useFindAndModify: false
      });
    }

    res.status(200).json({});
  } catch (error) {
    console.log(error);
    res.status(200).json({});
  }

});


app.post('/api/itemsold', async (req, res) => {
  // console.log("itemsoldcalled");
  try {
    const {
      item,
      buyeremail,
      buyerlist
    } = req.body;
    await Item.deleteOne({
      _id: item._id
    });
    await BuyerList.deleteOne({
      'item._id': item._id
    });
    await Chat.deleteMany({
      'item._id': item._id
    });

    for (let index = 0; index < buyerlist.length; index++) {
      const element = buyerlist[index];
      const updatedDeal = await Dealdata.findOneAndUpdate({
        email: element
      }, {
        $pull: {
          currently_dealing: {
            _id: item._id
          }
        }
      }, {
        new: true,
        useFindAndModify: false
      });
    }

    const dealerdata = await Dealdata.findOneAndUpdate({
      email: buyeremail
    }, {
      $push: {
        bought_items: item
      }
    }, {
      new: true,
      useFindAndModify: false
    });

    const dealerdata2 = await Dealdata.findOne({
      email: item.email
    });

    if (dealerdata2) {
      // console.log(item, dealerdata2.bought_items[0])
      await Dealdata.findOneAndUpdate({
        email: item.email
      }, {
        $push: {
          sold_items: item
        }
      }, {
        new: true,
        useFindAndModify: false
      });
    } else {
      const newdealerdata = new Dealdata({
        email: item.email,
        currently_dealing: [],
        sold_items: [item],
        bought_items: []
      });

      await newdealerdata.save();
    }

    res.status(200).json({});
  } catch (error) {
    console.log(error);
    res.status(200).json({});
  }

});

// Endpoint to register a new token for a user
app.post('/register-token', async (req, res) => {
  const {
    token,
    email
  } = req.body;

  if (!token || !email) {
    return res.status(400).send('Token and email are required');
  }

  try {
    // Add the new token to the list of tokens for the user's email
    await Token.findOneAndUpdate({
        email
      }, {
        $addToSet: {
          expoPushTokens: token
        }, // Add the token only if it's not already in the array
        $set: {
          enabled: true
        } // Set enabled to true
      }, {
        upsert: true,
        new: true
      } // Create a new document if it doesn’t exist
    );
    res.status(200).send('Token registered successfully');
  } catch (error) {
    res.status(500).send('Error registering token');
  }
});


app.post('/update-enabled', async (req, res) => {
  const {
    email,
    enabled
  } = req.body;

  // if (typeof email !== 'string' || typeof enabled !== 'boolean') {
  //   return res.status(400).send('Email and enabled (boolean) are required');
  // }

  try {
    const updatedToken = await Token.findOneAndUpdate({
      email
    }, {
      $set: {
        enabled
      }
    }, {
      new: true
    }).exec();

    if (!updatedToken) {
      return res.status(404).send('Email not found');
    }

    res.status(200).send(`Enabled status updated to ${enabled} for email ${email}`);
  } catch (error) {
    res.status(500).send('Error updating enabled status');
  }
});


app.post('/removetoken', async (req, res) => {
  const {
    email,
    token
  } = req.body;

  if (!email || !token) {
    return res.status(400).json({
      error: 'Email and token are required'
    });
  }

  try {
    const updatedDocument = await Token.findOneAndUpdate({
      email
    }, {
      $pull: {
        expoPushTokens: token
      }
    }, {
      new: true
    });

    if (!updatedDocument) {
      return res.status(404).json({
        error: 'Email not found'
      });
    }

    return res.status(200).json({
      message: 'Token removed successfully',
      updatedDocument,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Internal server error'
    });
  }
});


// Endpoint to send Expo notification
app.post('/send-expo-notification', async (req, res) => {
  const {
    email,
    title,
    body,
    data
  } = req.body;

  if (!email || !title || !body || !data) {
    return res.status(400).send('Email, title, body and data are required');
  }

  // Retrieve all tokens for the user's email
  const userTokens = await Token.findOne({
    email
  }).exec();

  if (!userTokens || userTokens.expoPushTokens.length === 0) {
    return res.status(400).send('No tokens found for the specified email');
  }

  // Create a notification message
  const message = {
    notification: {
      title: title,
      body: body,
    },
    data: {},
    android: {
      priority: 'high',
      notification: {
        sound: 'default',
        channelId: 'default', // Make sure this channel is created in your Android app
      },
    }
  };


  try {
    if (userTokens.enabled) {
      // Send notifications to all tokens
      const sendPromises = userTokens.expoPushTokens.map(token =>
        admin.messaging().send({
          ...message,
          token
        })
      );

      await Promise.all(sendPromises);
    }

    res.status(200).send('Notifications sent successfully');
  } catch (error) {
    // console.error('ONE OR MORE TOKENS REGISTERED WITH THE USER ACCOUNT IS NOT VALID ANYMORE. NOTIFICATIONS HAS BEEN SENT TO ALL OTHER DEVICES UNDER THE ACCCOUNT', error);
    res.status(200).send('ONE OR MORE TOKENS REGISTERED WITH THE USER ACCOUNT IS NOT VALID ANYMORE. NOTIFICATIONS HAS BEEN SENT TO ALL OTHER DEVICES UNDER THE ACCCOUNT');
  }
});

//getlistings api

app.post('/api/getlistings', async (req, res) => {

  const {
    email
  } = req.body;

  const itemdata = await Item.find({
    email: email
  });

  try {
    res.status(200).json(itemdata);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: 'item doesnt exist'
    });
  }

});


// get deals api
app.post('/api/getdeals', async (req, res) => {
  try {
    const {
      email
    } = req.body;

    const dealerdata = await Dealdata.findOne({
      email: email
    });

    if (dealerdata) {
      res.status(200).json(dealerdata);
    } else {
      const newdealerdata = new Dealdata({
        email: email,
        currently_dealing: [],
        sold_items: [],
        bought_items: []
      });

      await newdealerdata.save();
      res.status(200).json(newdealerdata);
    }


  } catch (error) {
    console.log(error);
    res.status(200).json({});
  }

});


//helpnsupport api  

app.post('/api/helpandsupport', async (req, res) => {

  const {
    email,
    content
  } = req.body;


  const msg = {
    to: 'projectyofficial2024@gmail.com',
    from: 'projectyofficial2024@gmail.com',
    subject: "Query Raised by MyTrash User",
    text: `<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Help And Support Query</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 0;
                        background-color: #f6f6f6;
                    }
                    .container {
                        width: 100%;
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border: 1px solid #e1e1e1;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    .header {
                        font-size: 24px;
                        font-weight: bold;
                        margin-bottom: 20px;
                    }
                    .from {
                        font-size: 16px;
                        color: #333333;
                        margin-bottom: 20px;
                    }
                    .content {
                        font-size: 14px;
                        line-height: 1.6;
                        color: #333333;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        Help And Support Query
                    </div>
                    <div class="from">
                        From: <span id="fromEmail">${email}</span>
                    </div>
                    <div class="content" id="content">
                    ${content}
                    </div>
                </div>
            </body>
            </html>
            `,
  };



  let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = msg.subject;
  sendSmtpEmail.htmlContent = `${msg.text}`;
  sendSmtpEmail.sender = {
    name: 'My Trash User',
    email: msg.from
  };
  sendSmtpEmail.to = [{
    email: msg.to,
    name: "Project YOfficial"
  }];

  apiInstance.sendTransacEmail(sendSmtpEmail).then((data) => {
    res.status(200).json({
      message: 'Query Sent. You Will Recieve an Email from Us Soon',
      data
    });
  }, (error) => {
    res.status(200).json({
      error: error.message,
      message: 'An Error Occured. Please try again.'
    });
  });

});



app.post('/api/feedback', async (req, res) => {

  const {
    email,
    content
  } = req.body;


  const msg = {
    to: 'projectyofficial2024@gmail.com',
    from: 'projectyofficial2024@gmail.com',
    subject: "Feedback by MyTrash User",
    text: `<!DOCTYPE html>
              <html>
              <head>
                  <meta charset="UTF-8">
                  <title>Feedback</title>
                  <style>
                      body {
                          font-family: Arial, sans-serif;
                          margin: 0;
                          padding: 0;
                          background-color: #f6f6f6;
                      }
                      .container {
                          width: 100%;
                          max-width: 600px;
                          margin: 0 auto;
                          background-color: #ffffff;
                          padding: 20px;
                          border: 1px solid #e1e1e1;
                          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                      }
                      .header {
                          font-size: 24px;
                          font-weight: bold;
                          margin-bottom: 20px;
                      }
                      .from {
                          font-size: 16px;
                          color: #333333;
                          margin-bottom: 20px;
                      }
                      .content {
                          font-size: 14px;
                          line-height: 1.6;
                          color: #333333;
                      }
                  </style>
              </head>
              <body>
                  <div class="container">
                      <div class="header">
                          Feedback
                      </div>
                      <div class="from">
                          From: <span id="fromEmail">${email}</span>
                      </div>
                      <div class="content" id="content">
                      ${content}
                      </div>
                  </div>
              </body>
              </html>
              `,
  };



  let apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  let sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = msg.subject;
  sendSmtpEmail.htmlContent = `${msg.text}`;
  sendSmtpEmail.sender = {
    name: 'My Trash User',
    email: msg.from
  };
  sendSmtpEmail.to = [{
    email: msg.to,
    name: "Project YOfficial"
  }];

  apiInstance.sendTransacEmail(sendSmtpEmail).then((data) => {
    res.status(200).json({
      message: 'Feedback Sent. Thanks For helping us improve the App',
      data
    });
  }, (error) => {
    res.status(200).json({
      error: error.message,
      message: 'An Error Occured. Please try again.'
    });
  });

});




io.on('connection', (socket) => {
  // console.log('A user connected');

  socket.on('joinRoom', ({
    chatRoomId
  }) => {
    socket.join(chatRoomId);
    // console.log(`User joined room: ${chatRoomId}`);
  });

  socket.on('disconnect', () => {
    // console.log('User disconnected');
  });

  socket.on('leaveRoom', ({
    chatRoomId
  }) => {
    socket.leave(chatRoomId);
    // console.log(`User left room: ${chatRoomId}`);
  });
});


server.listen(PORT, () => console.log(`Server running on port ${PORT}`));