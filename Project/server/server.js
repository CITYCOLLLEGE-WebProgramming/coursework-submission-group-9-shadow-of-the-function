require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const multer = require('multer');
const path = require('path');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const fs = require('fs'); // Import fs module

const app = express();

const corsOptions = {
    origin: 'http://127.0.0.1:3001',
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://127.0.0.1:27017/email-service', { useNewUrlParser: true, useUnifiedTopology: true });


// models/User.js

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    telNumber: String,
    imgURL: { type: String, default: "../src/assets/Pictures/account.png" },
    colorPicker: {
        rectangle1: { type: String, default: "#f6f8fc" },
        rectangle2: { type: String, default: "#213458" },
    }
});

const User = mongoose.model('User', userSchema);

module.exports = User;

const messageSchema = new mongoose.Schema({
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    date: { type: Date, default: Date.now },
    sent: { type: Boolean, default: false },
    flagged: { type: Boolean, default: false }// Add this line
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../src/assets/Pictures'));
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/email-service' }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day
}));

function isLoggedIn(req, res, next) {
    if (req.session.userId) {
        next();
    } else {
        res.status(401).json({ message: 'Unauthorized' });
    }
}

app.post('/signup', async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const newUser = await User.create({ ...req.body, password: hashedPassword });
        req.session.userId = newUser._id;

        // Create a directory named after the user's email
        const userDirectory = path.join(__dirname, `../src/${newUser.email}`);
        const picturesDirectory = path.join(userDirectory, 'Pictures');
        if (!fs.existsSync(userDirectory)) {
            fs.mkdirSync(userDirectory);
        }
        if (!fs.existsSync(picturesDirectory)) {
            fs.mkdirSync(picturesDirectory);
        }

        res.status(201).json({ user: newUser });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user', error });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        console.log('Login request received:', email, password);
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log('Invalid password');
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        req.session.userId = user._id;
        console.log('Login successful, userId:', user._id);
        res.status(200).json({ user });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).json({ message: 'Error logging out' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Logged out' });
    });
});

app.post('/upload-profile-pic', upload.single('profilePic'), async (req, res) => {
    try {
        const user = await User.findById(req.body.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Define the source and destination paths
        const srcPath = path.join(__dirname, `../src/assets/Pictures/${req.file.filename}`);
        const destDir = path.join(__dirname, `../src/${user.email}/Pictures`);
        const destPath = path.join(destDir, req.file.filename);

        // Ensure the destination directory exists
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }

        // Copy the file to the destination directory
        fs.copyFileSync(srcPath, destPath);

        // Update the user's imgURL
        user.imgURL = `../src/${user.email}/Pictures/${req.file.filename}`;
        await user.save();

        res.status(200).json({ message: 'Profile picture updated', user });
    } catch (error) {
        console.error('Profile picture upload error:', error);
        res.status(500).json({ message: 'Error uploading profile picture', error });
    }
});

app.post('/change-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
    // Validate userId, currentPassword, and newPassword
    // Implement logic to change password in your database
    try {
        // Example MongoDB/Mongoose update query
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        // Validate current password (compare with hashed stored password)
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }
        // Update user's password with newPassword (after hashing)
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


app.post('/send-email', async (req, res) => {
    const { to, subject } = req.body;

    try {
        const from = req.session.userId;
        const recipient = await User.findOne({ email: to });

        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        const newMessage = new Message({
            from: from,
            to: recipient._id,
            subject,
            message,
            sent: true // Set the sent flag to true
        });

        await newMessage.save();

        res.status(200).json({ message: 'Message sent', message: newMessage });
    } catch (error) {
        console.error('Message sending error:', error);
        res.status(500).json({ message: 'Error sending message', error });
    }
});

app.post('/send-message', isLoggedIn, async (req, res) => {
    const { to, subject, message } = req.body;

    try {
        const from = req.session.userId;
        const recipient = await User.findOne({ email: to });

        if (!recipient) {
            return res.status(404).json({ message: 'Recipient not found' });
        }

        const newMessage = new Message({
            from: from,
            to: recipient._id,
            subject,
            message,
            sent: true // Set the sent flag to true
        });

        await newMessage.save();

        res.status(200).json({ message: 'Message sent', message: newMessage });
    } catch (error) {
        console.error('Message sending error:', error);
        res.status(500).json({ message: 'Error sending message', error });
    }
});

app.get('/messages', isLoggedIn, async (req, res) => {
    const userId = req.session.userId;
    const { sort = 'date', order = 'asc' } = req.query;
    const sortCriteria = {};
    sortCriteria[sort] = order === 'asc' ? 1 : -1;

    try {
        const receivedMessages = await Message.find({ to: userId })
            .populate('from', 'email')
            .sort(sortCriteria);
        const sentMessages = await Message.find({ from: userId, sent: true })
            .populate('to', 'email')
            .sort(sortCriteria);

        res.status(200).json({ receivedMessages, sentMessages });
    } catch (error) {
        console.error('Error retrieving messages:', error);
        res.status(500).json({ message: 'Error retrieving messages', error });
    }
});



app.post('/update-colors', isLoggedIn, async (req, res) => {
    const { userId, rectangle1, rectangle2 } = req.body;
    console.log('Updating colors for user:', userId);
    console.log('Session userId:', req.session.userId);

    try {
        const user = await User.findByIdAndUpdate(userId, {
            $set: {
                'colorPicker.rectangle1': rectangle1,
                'colorPicker.rectangle2': rectangle2,
            }
        }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'Colors updated successfully', user });
    } catch (error) {
        console.error('Error updating colors:', error);
        res.status(500).json({ message: 'Error updating colors', error });
    }
});

app.post('/flag-message', isLoggedIn, async (req, res) => {
    const { messageId } = req.body;

    try {
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }

        message.flagged = !message.flagged; // Toggle flag status
        await message.save();

        res.status(200).json({ message: 'Message flagged status updated', flagged: message.flagged });
    } catch (error) {
        console.error('Error updating flagged status:', error);
        res.status(500).json({ message: 'Error updating flagged status', error });
    }
});

// Endpoint to fetch flagged messages
app.get('/flagged-messages', isLoggedIn, async (req, res) => {
    const { sort = 'date', order = 'asc' } = req.query;
    const sortCriteria = {};
    sortCriteria[sort] = order === 'asc' ? 1 : -1;

    try {
        const messages = await Message.find({ flagged: true })
            .populate('from to', 'email')
            .sort(sortCriteria);
        res.status(200).json({ flaggedMessages: messages });
    } catch (error) {
        console.error('Error fetching flagged messages:', error);
        res.status(500).json({ message: 'Error fetching flagged messages', error });
    }
});

app.delete('/delete-message/:id', isLoggedIn, async (req, res) => {
    const { id } = req.params;
  
    try {
      const message = await Message.findByIdAndDelete(id);
      if (!message) {
        return res.status(404).json({ message: 'Message not found' });
      }
      res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ message: 'Error deleting message', error });
    }
  });

const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});