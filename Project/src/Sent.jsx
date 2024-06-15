import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './mail.css';
import { useNavigate } from 'react-router-dom';
import '@fortawesome/fontawesome-free/css/all.css';

const Sent = () => {
  const [sentMessages, setSentMessages] = useState([]);
  const [user, setUser] = useState(null);
  const [successPopupVisible, setSuccessPopupVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [sortCriteria, setSortCriteria] = useState("date");
  const [sortOrder, setSortOrder] = useState("asc");
  const [recipient, setRecipient] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleAccountSettingsClick = () => {
    navigate('/account_settings');
  };

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem('userInfo'));
    setUser(userInfo);

    fetchMessages(sortCriteria, sortOrder);

    const mainBarButtons = document.querySelectorAll('.main-bar');
    mainBarButtons.forEach(button => {
      button.addEventListener('click', function () {
        if (this.classList) {
          this.classList.toggle('active');
        }
      });
    });

    const profileBtn = document.getElementById('profileBtn');
    const profileOptions = document.getElementById('profileOptions');
    if (profileBtn && profileOptions) {
      profileBtn.addEventListener('click', function () {
        profileOptions.style.display = profileOptions.style.display === 'block' ? 'none' : 'block';
      });
    }

    document.addEventListener('click', function (event) {
      if (profileOptions && !profileOptions.contains(event.target) && event.target !== profileBtn) {
        profileOptions.style.display = 'none';
      }
    });

    const composeButton = document.getElementById('composeButton');
    if (composeButton) {
      composeButton.addEventListener('click', openEmailPopup);
    }

    flatpickr("#fromDate", { dateFormat: "Y-m-d" });
    flatpickr("#toDate", { dateFormat: "Y-m-d" });

    return () => {
      mainBarButtons.forEach(button => {
        button.removeEventListener('click', () => {
          if (this.classList) {
            this.classList.toggle('active');
          }
        });
      });
    };
  }, []);

  useEffect(() => {
    fetchMessages(sortCriteria, sortOrder);
  }, [sortCriteria, sortOrder]);

  const fetchMessages = (criteria, order) => {
    axios.get(`http://127.0.0.1:3000/messages?sort=${criteria}&order=${order}`, { withCredentials: true })
      .then(response => {
        setSentMessages(response.data.sentMessages);
      })
      .catch(error => {
        console.error('Error fetching sent messages:', error);
      });
  };

  const handleLogOut = () => {
    axios.post('http://127.0.0.1:3000/logout', {}, { withCredentials: true })
      .then(response => {
        if (response.status === 200) {
          setUser(null);
          localStorage.removeItem('userInfo');
          navigate('/');
        }
      })
      .catch(error => {
        console.error('Logout error:', error);
      });
  };

  const openEmailPopup = () => {
    setRecipient("");
    setSubject("");
    setMessage("");
    const emailPopup = document.getElementById('emailPopup');
    if (emailPopup) {
      emailPopup.style.display = 'block';
    }
  };

  const closeEmailPopup = () => {
    const emailPopup = document.getElementById('emailPopup');
    if (emailPopup) {
      emailPopup.style.display = 'none';
    }
  };

  const sendMessage = () => {
    axios.post('http://127.0.0.1:3000/send-message', {
      to: recipient,
      subject,
      message
    }, { withCredentials: true })
      .then(response => {
        console.log('Message sent successfully:', response.data);
        closeEmailPopup();
        setSuccessPopupVisible(true);
        setTimeout(() => setSuccessPopupVisible(false), 3000); // Hide after 3 seconds
      })
      .catch(error => {
        console.error('Error sending message:', error);
      });
  };

  const sortEmails = (criteria) => {
    setSortCriteria(criteria);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc'); // Toggle sort order between 'asc' and 'desc'
  };

  const handleMessageClick = (message) => {
    setSelectedMessage(message);
  };

  const handleStarClick = (event, message) => {
    event.stopPropagation();
    console.log('Star clicked for message:', message);
  };

  const handleCheckboxClick = (event) => {
    event.stopPropagation();
  };

  return (
    <div>
      <main>
        {/* LEFT SIDE BAR SECTION */}
        <section>
          <div className="rectangle2" style={{ background: user ? user.colorPicker.rectangle2 : "#fff" }}>
            <span className="main-bar-box">
              <button className="main-bar" onClick={() => navigate("/account_settings")}>
                <img src="src/assets/Pictures/account.png" alt="account" width="28" height="25" />Acc
              </button>
              <button className="main-bar" onClick={() => navigate("/Mail")}><img src="src/assets/Pictures/email2.png" alt="account" width="28" height="25" />Mail</button>
              <button className="main-bar" onClick={() => navigate('/settings')}><img src="src/assets/Pictures/settings.png" alt="account" width="28" height="25" />Set</button>
            </span>
          </div>

          <div className="rectangle1" style={{ background: user ? user.colorPicker.rectangle1 : "#fff" }}>
            <button id="main-logo" onClick={() => navigate("/Mail")}><img src="src/assets/Pictures/MainLogo.png" alt="Main company Logo" width="125" height="45" /></button>
            <button className="compose no-bullets" id="composeButton"><i className="fa-solid fa-pen"></i><span>Write</span></button>
            <div
              className="email-popup"
              id="emailPopup"
              style={{ display: "none" }}
            >
              <div className="email-popup-content">
                <span className="close" onClick={closeEmailPopup}>
                  &times;
                </span>
                <input
                  className="recipient"
                  type="text"
                  placeholder="Recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
                <input
                  className="subject"
                  type="text"
                  placeholder="Subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
                <textarea
                  placeholder="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                ></textarea>
                <button id="send-button" onClick={sendMessage}>
                  Send
                </button>
              </div>
            </div>
            <button className="main-bar-second-part no-bullets" onClick={() => navigate('/Mail')}><i className="fa-solid fa-inbox fa-lg" style={{ color: '#213458' }}></i>Inbox</button>
            <button className="main-bar-second-part no-bullets" onClick={() => navigate("/Flagged")}><i className="fa-solid fa-star fa-lg" style={{ color: '#ffd43b' }}></i>Flagged</button>
            <button className="main-bar-second-part no-bullets" onClick={() => navigate('/Sent')} ><i className="fa-solid fa-square-arrow-up-right fa-lg" style={{ color: '#213458' }}></i>Sent</button>
            <button className="main-bar-second-part no-bullets"><i className="fa-solid fa-comment-slash fa-lg" style={{ color: '#213458' }}></i>Spam</button>
            <button className="main-bar-second-part no-bullets"><i className="fa-solid fa-paperclip fa-lg" style={{ color: '#213458' }}></i>Draft</button>
            <button className="main-bar-second-part no-bullets"><i className="fa-solid fa-floppy-disk fa-lg" style={{ color: '#213458' }}></i>Files</button>
          </div>
        </section>
        {/* LEFT SIDE BAR SECTION END */}
        <section className="upside-bar">
          <div className="navbar-left">
            <div id="checkbox">
              <input className="checkbox" type="checkbox" />
            </div>


            <div className="dropdown">
              <button className="sort-by">Sort<span>&#9662;</span></button>
              <div className="dropdown-content">
                <a href="#" id="sortDate" onClick={() => sortEmails('date')}>Date</a>
                <a href="#" id="sortSender" onClick={() => sortEmails('sender')}>Sender</a>
                <a href="#" id="sortSubject" onClick={() => sortEmails('subject')}>Subject</a>
              </div>
            </div>

            <div className="popup" id="popupDate">
              <label htmlFor="fromDate">From:</label>
              <input type="text" id="fromDate" placeholder="Select start date" />
              <label htmlFor="toDate">To:</label>
              <input type="text" id="toDate" placeholder="Select end date" />
              <button className="close-btn" onClick={() => closePopup('popupDate')}>X</button>
            </div>

            <div className="popup" id="popupSender">
              <label htmlFor="senderName">Sender Name:</label>
              <input type="text" id="senderName" placeholder="Enter sender name" />
              <button className="close-btn" onClick={() => closePopup('popupSender')}>X</button>
            </div>

            <div className="popup" id="popupSubject">
              <label htmlFor="subjectText">Subject:</label>
              <input type="text" id="subjectText" placeholder="Enter subject" />
              <button className="close-btn" onClick={() => closePopup('popupSubject')}>X</button>
            </div>
          </div>

          <div className="search-bar">
            <input className="search-in-mail" type="text" name="Search" placeholder="Search in mails" />
          </div>

          <div className="profile-right-bar">
            <div className="profile-options" id="profileOptions">
              <img src={user ? user.imgURL : ""} alt="User Picture" />
              <p className="lala">
                Hi, {user ? `${user.firstName} ${user.lastName}` : "Ляля"}!
              </p>
              <button
                className="account-settings-btn"
                type="button"
                onClick={handleAccountSettingsClick}
              >
                Account Settings
              </button>
              <button type="button" id="logoutBtn" onClick={handleLogOut}>
                Log out
              </button>
              <button type="button" id="changeAccountBtn">
                Change Account
              </button>
            </div>

            <div className="profile-bar-right">
              <button type="button" id="profileBtn">Profile</button>
              <button id="faq">?</button>
            </div>
          </div>
        </section>
        {/* SENT MESSAGES SECTION */}
        <section className="inbox-section">
          {selectedMessage ? (
            <div className="message-details">
              <button onClick={() => setSelectedMessage(null)}>Back</button>
              <div className="message-details-content">
                <h2>{selectedMessage.subject}</h2>
                <p><strong>From:</strong> {selectedMessage.from.email}</p>
                <p><strong>To:</strong> {selectedMessage.to.email}</p>
                <p><strong>Date:</strong> {new Date(selectedMessage.date).toLocaleString()}</p>
                <p>{selectedMessage.message}</p>
              </div>
            </div>
          ) : (
            sentMessages.map(message => (
              <div className="email-item" key={message._id} onClick={() => handleMessageClick(message)}>
                <div className="email-header">
                  <div className="email-actions" onClick={(e) => e.stopPropagation()}>
                    <button className="star-btn" onClick={(e) => handleStarClick(e, message)}>
                      <i className="fa-solid fa-star"></i>
                    </button>
                    <input type="checkbox" className="select-checkbox" onClick={handleCheckboxClick} />
                  </div>
                  <div className="email-sender">{message.to.email}</div>
                  <div className="email-subject">{message.subject}</div>
                  <div className="email-content">{message.message}</div>
                  <div className="email-date">{new Date(message.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          )}
        </section>
      </main>

      <footer>
      </footer>
    </div>
  );
};

export default Sent;