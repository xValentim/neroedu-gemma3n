import pickle
from pydantic import BaseModel
import pandas as pd
import numpy as np
import re
import nltk
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer

nltk.download('stopwords')

class Output(BaseModel):
    content: str
    relevance: float

class Retriever:
    def __init__(self, 
                 path_csv, 
                 path_model):
        
        self.language = None
        if "sat" in path_csv:
            self.language = 'english'
        elif "icfes" in path_csv:
            self.language = 'spanish'
        elif "exani" in path_csv:
            self.language = 'spanish'
        elif "exames_nacionais" in path_csv:
            self.language = 'portuguese'
        elif "cuet" in path_csv:
            self.language = 'english'
        elif "enem" in path_csv:
            self.language = 'portuguese'
        else:
            self.language = 'portuguese'
        
        self.df = pd.read_csv(path_csv)
        self.df['content'] = self.df['content'].apply(self.preprocess_text)
        
        try:
            with open(path_model, 'rb') as f_in:
                self.vectorizer = pickle.load(f_in)
            self.X = self.vectorizer.transform(self.df['content'])    
            
        except:
            print('Model not found. Creating a new one...')
            self.vectorizer = TfidfVectorizer()
            self.X = self.vectorizer.fit_transform(self.df['content'])
            print('Model created.')
            print('Saving model...')
            self.save_model(filename=path_model)
            
    def invoke(self, query, k=3):
        Q = self.vectorizer.transform([query])
        R = self.X.dot(Q.T)
        
        # Get score with np.argsort
        scores = np.array(R.toarray()).flatten()
        idxs = np.argsort(scores)[::-1]
        idxs_and_scores = np.array([[idx, scores[idx]] for idx in idxs])
        
        retrieved = np.array(idxs_and_scores[:k])
        idxs = np.array(retrieved)[:, 0].astype(int)
        output_content = self.df.iloc[idxs][['content']].values
        output_relevance = retrieved[:, 1].reshape(-1, 1)
        output = np.concatenate([output_content, output_relevance], axis=1)
        return output
    
    def query(self, query, k=3):
        output = self.invoke(query, k)
        output = [Output(content=x[0], relevance=x[1]) for x in output]
        return output
    
    def preprocess_text(self, 
                        text):
        
        if self.language == 'portuguese':
            stop_words = set(stopwords.words('portuguese'))
        elif self.language == 'english':
            stop_words = set(stopwords.words('english'))
        elif self.language == 'spanish':
            stop_words = set(stopwords.words('spanish'))
        else:
            stop_words = set()
        
        text = text.lower()
        text = re.sub(r'\d+', '', text)
        text = re.sub(r'\b\w{1,2}\b', '', text)  
        text = re.sub(r'[^\w\s]', '', text) 
        text = ' '.join(word for word in text.split() if word not in stop_words)
        return text
    
    def save_model(self, filename='../vectorstore/tfidf_model.pkl'):
        # Salvar o modelo TF-IDF em um arquivo .pkl
        with open(filename, 'wb') as f_out:
            pickle.dump(self.vectorizer, f_out)