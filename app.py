import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import classification_report, confusion_matrix
from flask import Flask, request, jsonify
import joblib
from langdetect import detect
import langid
import random

class NeuralNetwork(nn.Module):
    def __init__(self, input_dim, hidden_dim, output_dim):
        super(NeuralNetwork, self).__init__()
        self.fc1 = nn.Linear(input_dim, hidden_dim)
        self.relu = nn.ReLU()
        self.fc2 = nn.Linear(hidden_dim, output_dim)

    def forward(self, x):
        out = self.fc1(x)
        out = self.relu(out)
        out = self.fc2(out)
        return out

app = Flask(__name__)

input_dim = 94399
hidden_dim = 20
output_dim = 3
english_model_filename = 'best_mlp_model'
english_model = NeuralNetwork(input_dim, hidden_dim, output_dim)
english_model.load_state_dict(torch.load(english_model_filename))
english_model.eval()

arabic_input_dim = 33172
arabic_hidden_dim = 40
arabic_output_dim = 2
arabic_model_filename = 'best_mlp_model_arabic'
arabic_model = NeuralNetwork(arabic_input_dim, arabic_hidden_dim, arabic_output_dim)
arabic_model.load_state_dict(torch.load(arabic_model_filename))
arabic_model.eval()

english_tfidf_vectorizer = joblib.load('tfidf_vectorizer.joblib')
arabic_tfidf_vectorizer = joblib.load('tfidf_vectorizer.joblib_arabic')

sentiment_input_dim = 33036  
sentiment_hidden_dim = 20  
sentiment_output_dim = 6  
sentiment_model_filename = 'sentiment_classification'
sentiment_model = NeuralNetwork(sentiment_input_dim, sentiment_hidden_dim, sentiment_output_dim)
sentiment_model.load_state_dict(torch.load(sentiment_model_filename))
sentiment_model.eval()

sentiment_tfidf_vectorizer = joblib.load('sentiment_tfidf_vectorizer.joblib')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    new_data = data['tweets']
    languages, confidence = langid.classify(new_data[0])
    
    english_tweets = [tweet for i, tweet in enumerate(new_data) if languages == 'en' ]
    arabic_tweets = [tweet for i, tweet in enumerate(new_data) if languages != 'en']
    print(english_tweets)
    print(arabic_tweets)

    if len(english_tweets) > 0:
        english_new_features = english_tfidf_vectorizer.transform(english_tweets).toarray()
        X_english = torch.tensor(english_new_features, dtype=torch.float32)
    else:
        X_english = None

    # Convert Arabic text data to TF-IDF features if there are any Arabic tweets
    if len(arabic_tweets) > 0:
        arabic_new_features = arabic_tfidf_vectorizer.transform(arabic_tweets).toarray()
        X_arabic = torch.tensor(arabic_new_features, dtype=torch.float32)
    else:
        X_arabic = None

    with torch.no_grad():
        if X_english is not None:
            y_pred_english = english_model(X_english).argmax(dim=1)
            english_predicted_classes = y_pred_english.tolist()
        else:
            english_predicted_classes = []

        if X_arabic is not None:
            y_pred_arabic = arabic_model(X_arabic).argmax(dim=1)
            arabic_predicted_classes = y_pred_arabic.tolist()
        else:
            arabic_predicted_classes = []

    print(english_predicted_classes)
    print(arabic_predicted_classes)



     
    return jsonify({'predictions': english_predicted_classes, "lang": languages})
@app.route('/predict_sentiment', methods=['POST'])
def predict_sentiment():
    data = request.get_json()
    new_data = data['tweets']
    
    # Process the input text for sentiment prediction
    processed_data = [(text) for text in new_data]
    
    # Convert the processed data to TF-IDF features
    sentiment_features = sentiment_tfidf_vectorizer.transform(processed_data).toarray()
    X_sentiment = torch.tensor(sentiment_features, dtype=torch.float32)

    with torch.no_grad():
        y_pred_sentiment = sentiment_model(X_sentiment).argmax(dim=1)
        predicted_classes_sentiment = y_pred_sentiment.tolist()
        print(predicted_classes_sentiment)
    return jsonify({'predictions_sentiment': predicted_classes_sentiment})





model = NeuralNetwork(72899, 20, 2)
model.load_state_dict(torch.load('depression_modal'))
model.eval()

tfidf_vectorizer = joblib.load('depression_tfidf_vectorizer.joblib')

quote_collections = {
    '1': [
        "You are not alone. Reach out to someone you trust.",
        "Every day may not be good, but there's something good in every day.",
        "Just because you’re going through a rough patch, it doesn’t mean you always will be. Recovery is possible. We promise you",
        "Healing is a process, not an event. Give it time. Good things happen to those who never give up",
        "Don’t be upset or caught up with things or people you cannot change. Instead, move on, let go, and concentrate on what you can change",
        "Today, do one little thing to take better care of yourself. Then, do it again tomorrow",
        "When something goes wrong, take a moment to be thankful for all the things in your life that are going right",
        "Never forget that you are worthy of love and respect",
        "Sometimes you have to fight through your worst days in order to earn the best days of your life",
        "It's okay to ask for help. Seeking support is a sign of courage, not weakness.",
        "It's okay to not be okay. Your worth is not defined by your struggles.",
        "You are stronger than you know. One step at a time, you can overcome this darkness."
        "Rainbows can only come after the rain. Your storm will pass, and brighter days will come."
    ],
     '0': [
        ""
    ],
}

@app.route('/depression', methods=['POST'])
def predict_depression():
    data = request.get_json()
    text = data['text']
    processed_data = [(data) for data in text]
    print(processed_data)
    # Preprocess input text
    features =tfidf_vectorizer.transform(processed_data)
 
    input_tensor = torch.tensor(features.toarray(), dtype=torch.float32)

    # Make prediction
    with torch.no_grad():
        output = model(input_tensor)
        predicted_class = output.argmax().item()
        predicted_label = str(predicted_class)

    # Retrieve a random quote/advice from the selected category
    print(predicted_label)
    selected_quote = random.choice(quote_collections.get(predicted_label, []))

    return jsonify({'prediction': predicted_label, 'quote': selected_quote})



if __name__ == '__main__':
    app.run()




