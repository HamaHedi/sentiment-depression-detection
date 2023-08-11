import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
function App() {
  const [comment, setComment] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  console.log(feedbacks);
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();
  const predictionsArray = feedbacks.map((item) => item.predictions[0]);

  console.log(predictionsArray);

  // Count the occurrences of each element

  const apiUrl = 'http://localhost:7000/comments';
  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const axiosInstance = axios.create({
    headers,
  });
  useEffect(() => {
    axios
      .get(apiUrl)
      .then((response) => {
        const comments = response.data.data;
        setComments(comments);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    axios
      .get('http://localhost:7000/feedback')
      .then((response) => {
        const feedbacks = response.data.data;
        setFeedbacks(feedbacks);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, []);
  const handleChange = (event) => {
    setComment(event.target.value);
  };
  const handleSubmit = async () => {
    const newCommentState = [comment];
    console.log(newCommentState);

    try {
      const response = await axiosInstance.post(apiUrl, {
        tweets: newCommentState,
      });
      console.log('Response:', response.data);
      setComment([]);
    } catch (error) {
      console.error('Error:', error);
    }
    axios
      .get(apiUrl)
      .then((response) => {
        const comments = response.data.data;
        setComments(comments);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  };
  return (
    <div className='App'>
      <div className='input-button-container'>
        <textarea
          placeholder='Enter your comment'
          onChange={(event) => handleChange(event)}
          className='textarea'
        />
        <button onClick={handleSubmit}>Confirm</button>
      </div>
      <button onClick={() => navigate('/sentiment')}>
        Sentiment classification
      </button>{' '}
      <br />
      <br />
      <button onClick={() => navigate('/depression')}>
        Depression detection
      </button>
      {comments?.map((comment, index) => {
        return (
          <div className='comment-container'>
            <span>Comment : {comment?.comment}</span>
            <span>
              {comment?.predictions[0] === '0' ? (
                <span className='status'>
                  IA predection : All good
                  <img src='./icons8-ok.gif' alt='icon' className='ok-icon' />
                </span>
              ) : (
                <span className='status'>
                  IA predection : Toxic word are detected !!
                  <img src='./icons8-danger.gif' alt='icon' />
                </span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default App;
