import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';
import { useNavigate } from 'react-router-dom';
function Depression() {
  const [comment, setComment] = useState([]);
  const [comments, setComments] = useState([]);
  const navigate = useNavigate();
  const [refresh, setRefresh] = useState(false);

  // Count the occurrences of each element

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const axiosInstance = axios.create({
    headers,
  });
  useEffect(() => {
    axios
      .get('http://localhost:7000/depression')
      .then((response) => {
        const depressions = response.data.data;
        setComments(depressions);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }, [refresh]);
  const handleChange = (event) => {
    setComment(event.target.value);
  };
  const handleSubmit = async () => {
    const newCommentState = [comment];
    console.log(newCommentState);

    try {
      const response = await axiosInstance.post(
        'http://localhost:7000/depression',
        {
          text: newCommentState,
        }
      );
      console.log('Response:', response.data);
      setComment([]);
    } catch (error) {
      console.error('Error:', error);
    }
    setRefresh(!refresh);
  };
  return (
    <div className='App'>
      <div className='input-button-container'>
        <textarea
          placeholder='Tell me your feelings'
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
      {comments?.map((comment, index) => {
        return (
          <div className='comment-container'>
            <span>Text : {comment?.text}</span>
            <span>
              {comment?.predictions[0] === '0' ? (
                <span className='status'>
                  IA predection : All good
                  <img src='./icons8-ok.gif' alt='icon' className='ok-icon' />
                </span>
              ) : (
                <span className='status'>
                  IA predection : Depression detected !!
                  <img src='./icons8-danger.gif' alt='icon' />
                </span>
              )}
            </span>
            <span>
              {comment?.predictions[0] === '0' ? (
                <span className='status'></span>
              ) : (
                <span className='status'>Quote : {comment?.responses}</span>
              )}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default Depression;
