import './App.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { useNavigate } from 'react-router-dom';
function Sentiment() {
  const [comment, setComment] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);
  const predictionsArray = feedbacks.map((item) => item.predictions[0]);
  const [refresh, setRefresh] = useState(false);

  // Count the occurrences of each element

  const countOccurrences = (arr, target) => {
    return arr.reduce((count, element) => {
      return count + (element === target ? 1 : 0);
    }, 0);
  };

  const data = [
    {
      name: 'awful',
      awful: countOccurrences(predictionsArray, '2'),
    },
    {
      name: 'poor',
      poor: countOccurrences(predictionsArray, '5'),
    },
    {
      name: 'average',
      average: countOccurrences(predictionsArray, '0'),
    },
    {
      name: 'good',
      good: countOccurrences(predictionsArray, '3'),
    },
    {
      name: 'awesome',
      awesome: countOccurrences(predictionsArray, '1'),
    },
  ];

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  };
  const axiosInstance = axios.create({
    headers,
  });
  useEffect(() => {
    axios
      .get('http://localhost:7000/feedback')
      .then((response) => {
        const feedbacks = response.data.data;
        setFeedbacks(feedbacks);
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
        'http://localhost:7000/feedback',
        {
          tweets: newCommentState,
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
          placeholder='Enter your comment'
          onChange={(event) => handleChange(event)}
          className='textarea'
        />
        <button onClick={handleSubmit}>Confirm</button>
      </div>

      <div>
        <BarChart
          width={600}
          height={400}
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <XAxis dataKey='name' />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey='awful' fill='red' />
          <Bar dataKey='poor' fill='orange' />
          <Bar dataKey='good' fill='#33F249' />
          <Bar dataKey='average' fill='#DBCB34' />
          <Bar dataKey='awesome' fill='green' />
        </BarChart>
      </div>
    </div>
  );
}

export default Sentiment;
