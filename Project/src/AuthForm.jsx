import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Modal from './Modal'; 
import './style.css';


const AuthForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telNumber, setNumber] = useState('');
  const [user, setUser] = useState('');
  const [message, setMessage] = useState(''); 
  const [errorMessage, setErrorMessage] = useState(''); 
  const [showModal, setShowModal] = useState(false); 
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    setErrorMessage(''); 
    axios.post('http://127.0.0.1:3000/signup', { firstName, lastName, email, password, telNumber })
      .then(result => {
        console.log(result);
        setMessage('Account created successfully'); 
        setShowModal(true); 
      })
      .catch(err => {
        console.error('Signup error:', err);
        setErrorMessage('Signup failed. Please try again.');
        setShowModal(true);
      });
  };

  const handleLogin = (event) => {
    event.preventDefault();
    setErrorMessage('');
    axios.post('http://127.0.0.1:3000/login', { email, password }, { withCredentials: true })
      .then(response => {
        console.log(response.data);
        setUser(response.data.user);
        localStorage.setItem('userInfo', JSON.stringify(response.data.user));
        setMessage('Logged In successfully');
        setShowModal(true);
        navigate('/mail');
      })
      .catch(error => {
        console.error('Login error:', error);
        setErrorMessage('Login failed. Please check your credentials and try again.'); 
        setShowModal(true); 
      });
  };

  const transform = () => {
    var loginForm = document.getElementById("login-form");
    var btnReverse = document.getElementById("btn-reverse");
    var registrationForm = document.getElementById("signup-form");
    var textReverse = document.getElementById("reverse-text");

    if (parseFloat(getComputedStyle(loginForm).opacity) === 0) {
      loginForm.style.opacity = 1;
      registrationForm.style.opacity = 0;

      textReverse.classList.remove('spin-backwards-text');
      textReverse.classList.add('spin-forwards-text');
      btnReverse.classList.remove('spin-backwards');
      btnReverse.classList.add('spin-forwards');
      textReverse.textContent = "You don't have an account? Click here";
    } else {
      loginForm.style.opacity = 0;
      registrationForm.style.opacity = 1;

      btnReverse.classList.remove('spin-forwards');
      btnReverse.classList.add('spin-backwards');
      textReverse.classList.remove('spin-forwards-text');
      textReverse.classList.add('spin-backwards-text');
      textReverse.textContent = "You already have an account? Click here";
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setMessage('');
    setErrorMessage('');
  };

  return (
    <div>
      {showModal && (
        <Modal message={message || errorMessage} onClose={closeModal} />
      )}
      <div id="login-signup">
        <form className="signUp" onSubmit={handleSignup} id="signup-form">
          <input className="signup-fname" type="text" name="firstName" placeholder="John" onChange={(e) => setFirstName(e.target.value)} /><br /><br />
          <input className="signup-lname" type="text" name="lastName" placeholder="Doe" onChange={(e) => setLastName(e.target.value)} /><br /><br />
          <input className="signup-email" type="email" name="email" placeholder="johndoe@example.com" onChange={(e) => setEmail(e.target.value)} /><br /><br />
          <input className="signup-pass" type="password" name="password" placeholder="*********" onChange={(e) => setPassword(e.target.value)} /><br /><br />
          <input className="signup-tel" type="tel" name="telNumber" placeholder="123-456-7890" onChange={(e) => setNumber(e.target.value)} /><br /><br />
          <button type="submit" className="sign-up" id="sign-up">Sign Up!</button>
        </form>
        <div className="overlay-content">
          <button className="overlay-btn" id="btn-reverse" onClick={transform}>
            <p className="text-button" id="reverse-text">
              <span style={{ fontSize: '1.5em' }}>You already have an account?</span> <br />
              Click here
            </p>
            <img src="logo.png" alt="" className="button-transform" id="logo-image" />
          </button>
        </div>
        <form className="logIn" onSubmit={handleLogin} id="login-form">
          <input type="email" name="email" placeholder="johndoe@example.com" onChange={(e) => setEmail(e.target.value)} /><br /><br />
          <input type="password" name="password" placeholder="*******" onChange={(e) => setPassword(e.target.value)} /><br /><br />
          <button type="submit" className="log-in" id="log-in">Log In</button>
        </form>
      </div>
      <div className="ocean">
        <div className="wave"></div>
        <div className="wave wave2"></div>
      </div>
    </div>
  );
};

export default AuthForm;
