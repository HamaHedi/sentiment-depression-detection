const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const apiUrl = 'http://127.0.0.1:5000/predict'; // Replace with the correct API URL

// Connect to MongoDB
mongoose.connect('mongodb+srv://*******:******@cluster0.xsb21ko.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// Middleware
app.use(bodyParser.json());
app.use(cors());
// Define Comment schema and model
const commentSchema = new mongoose.Schema({
    comment: String,
    predictions: [String],
    lang: [String]
});
const feedbackSchema = new mongoose.Schema({
    feedback: String,
    predictions: [String],
});
const depressionSchema = new mongoose.Schema({
    text: String,
    predictions: [String],
    responses: String
});
const Comment = mongoose.model('Comment', commentSchema);
const Feedback = mongoose.model('Feedback', feedbackSchema);
const Depression = mongoose.model('Depression', depressionSchema);
const router = express.Router()
// Route to receive comments from the front-end client, send them to the API, and store data in MongoDB



router.route('/depression').post(async (req, res) => {
    const { text } = req.body;
    console.log(text)
    try {
        // Send comments to the API
        const response = await axios.post('http://127.0.0.1:5000/depression', { text });
        const predictions = response.data.prediction;
        const responses = response.data.quote;

        // Save comment and predictions to MongoDB
        const newComment = new Depression({ text: text.join(', '), predictions, responses });
        await newComment.save();

        res.json({ success: true, message: 'depression predictions saved successfully.', data: { text: tweets, predection: predictions, responses: responses } });
    } catch (error) {
        // console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to save comment and predictions.' });
    }
});



router.route('/depression').get(async (req, res) => {
    try {
        // Find all comments in the database
        const depressions = await Depression.find();

        // Extract the comments and predictions from the query result
        const depressionsData = depressions.map(({ text, predictions, responses }) => ({ text, predictions, responses }));

        res.json({ success: true, data: depressionsData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch depressions from the database.' });
    }
});







router.route('/feedback').post(async (req, res) => {
    const { tweets } = req.body;
    console.log(tweets)
    try {
        // Send comments to the API
        const response = await axios.post('http://127.0.0.1:5000/predict_sentiment', { tweets });
        const predictions = response.data.predictions_sentiment;
        // Save comment and predictions to MongoDB
        const newComment = new Feedback({ feedback: tweets.join(', '), predictions });
        await newComment.save();

        res.json({ success: true, message: 'Comment and predictions saved successfully.', data: { comment: tweets, predection: predictions } });
    } catch (error) {
        // console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to save comment and predictions.' });
    }
});
router.route('/feedback').get(async (req, res) => {
    try {
        // Find all comments in the database
        const feedbacks = await Feedback.find();

        // Extract the comments and predictions from the query result
        const feedbacksData = feedbacks.map(({ feedback, predictions }) => ({ feedback, predictions }));

        res.json({ success: true, data: feedbacksData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch feedbacks from the database.' });
    }
});
router.route('/comments').post(async (req, res) => {
    const { tweets } = req.body;
    console.log(tweets)
    try {
        // Send comments to the API
        const response = await axios.post(apiUrl, { tweets });
        const predictions = response.data.predictions;
        const lang = response.data.lang;

        // Save comment and predictions to MongoDB
        const newComment = new Comment({ comment: tweets.join(', '), predictions, lang });
        await newComment.save();

        res.json({ success: true, message: 'Comment and predictions saved successfully.', data: { comment: tweets, predection: predictions, lang: lang } });
    } catch (error) {
        // console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to save comment and predictions.' });
    }
});
router.route('/comments').get(async (req, res) => {
    try {
        // Find all comments in the database
        const comments = await Comment.find();

        // Extract the comments and predictions from the query result
        const commentsData = comments.map(({ comment, predictions, lang }) => ({ comment, predictions, lang }));

        res.json({ success: true, data: commentsData });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch comments from the database.' });
    }
});
app.use(router)
const port = 7000; // Set the desired port number
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});