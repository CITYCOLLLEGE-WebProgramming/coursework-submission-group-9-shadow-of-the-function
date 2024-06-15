import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Settings.css';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import { useNavigate } from 'react-router-dom';

const App = () => {
    const [user, setUser] = useState(null);
    const [rectangle1Color, setRectangle1Color] = useState('#f6f8fc');
    const [rectangle2Color, setRectangle2Color] = useState('#213458');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [telNumber, setNumber] = useState('');
    const [recipient, setRecipient] = useState("");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleAccountSettingsClick = () => {
        navigate('/account_settings');
    };

    const handleSettingsClick = () => {
        navigate('/settings');
    };

    useEffect(() => {
        // Load user data from localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        setUser(userInfo);

        // Add event listeners for main-bar buttons
        const mainBarButtons = document.querySelectorAll('.main-bar');
        mainBarButtons.forEach(button => {
            button.addEventListener('click', function () {
                if (this.classList) {
                    this.classList.toggle('active');
                }
            });
        });

        // Add event listener for profile button if it exists
        const profileBtn = document.getElementById('profileBtn');
        const profileOptions = document.getElementById('profileOptions');
        if (profileBtn && profileOptions) {
            profileBtn.addEventListener('click', function () {
                profileOptions.style.display = profileOptions.style.display === 'block' ? 'none' : 'block';
            });
        }

        // Close profile options when clicking outside
        document.addEventListener('click', function (event) {
            if (profileOptions && !profileOptions.contains(event.target) && event.target !== profileBtn) {
                profileOptions.style.display = 'none';
            }
        });

        // Add event listener for compose button if it exists
        const composeButton = document.getElementById('composeButton');
        if (composeButton) {
            composeButton.addEventListener('click', openEmailPopup);
        }

        // Clean up event listeners when component unmounts
        return () => {
            mainBarButtons.forEach(button => {
                button.removeEventListener('click', function () {
                    if (this.classList) {
                        this.classList.toggle('active');
                    }
                });
            });
            if (profileBtn && profileOptions) {
                profileBtn.removeEventListener('click', function () {
                    profileOptions.style.display = profileOptions.style.display === 'block' ? 'none' : 'block';
                });
            }
            if (composeButton) {
                composeButton.removeEventListener('click', openEmailPopup);
            }
        };
    }, []); // Empty dependency array ensures this effect runs only once on mount

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
        const recipient = document.querySelector('.email-popup-content input:nth-of-type(1)').value;
        const subject = document.querySelector('.email-popup-content input:nth-of-type(2)').value;
        const message = document.querySelector('.email-popup-content textarea').value;
    
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
    const updateFileName = () => {
        const fileInput = document.getElementById('fileInput');
        const fileNameDisplay = document.getElementById('fileNameDisplay');
        const deleteFileButton = document.getElementById('deleteFileButton');

        if (fileInput.files.length > 0) {
            fileNameDisplay.textContent = fileInput.files[0].name;
            deleteFileButton.style.display = 'inline-block';
        } else {
            fileNameDisplay.textContent = '';
            deleteFileButton.style.display = 'none';
        }
    };

    const deleteFile = () => {
        const fileInput = document.getElementById('fileInput');
        fileInput.value = ''; // Clear the file input
        updateFileName(); // Update the display
    };

    const openPopup = (type) => {
        const popups = document.querySelectorAll('.popup');
        popups.forEach(popup => popup.style.display = 'none');

        const popup = document.getElementById(type);
        if (popup) {
            popup.style.display = 'block';
        }
    };

    const closePopup = (popupId) => {
        const popup = document.getElementById(popupId);
        if (popup) {
            popup.style.display = 'none';
        }
    };

    const handleApplyColors = async () => {
        if (!user) {
            console.error('User is not set');
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:3000/update-colors', {
                userId: user._id,
                rectangle1: rectangle1Color,
                rectangle2: rectangle2Color,
            }, {
                withCredentials: true
            });

            if (response.status === 200) {
                const updatedUser = {
                    ...user,
                    colorPicker: {
                        rectangle1: rectangle1Color,
                        rectangle2: rectangle2Color,
                    },
                };
                setUser(updatedUser);
                localStorage.setItem('userInfo', JSON.stringify(updatedUser));
                console.log('Colors applied successfully:', updatedUser.colorPicker);
            }
        } catch (error) {
            console.error('Error applying colors:', error);
        }
    };

    return (

        <div className="settings-user">
            <main className="main-user">
                <section>
                    <div className="rectangle2" style={{ background: user ? user.colorPicker.rectangle2 : "#fff" }}>
                        <span className="main-bar-box">
                            <button className="main-bar">
                                <img src="src/assets/Pictures/account.png" alt="account" width="28" height="25" onClick={() => navigate("/account_settings")}/>Acc
                            </button>
                            <button className="main-bar" onClick={() => navigate("/Mail")}><img src="src/assets/Pictures/email2.png" alt="account" width="28" height="25" />Mail</button>
                            <button className="main-bar" onClick={handleSettingsClick}><img src="src/assets/Pictures/settings.png" alt="account" width="28" height="25" />Set</button>
                        </span>
                    </div>

                    <div className="rectangle1" style={{ background: user ? user.colorPicker.rectangle1 : "#fff" }}>
                        <button id="main-logo" onClick={() => navigate("/Main")}><img src="src/assets/Pictures/MainLogo.png" alt="Main company Logo" width="125" height="45" /></button>
                        <button className="compose no-bullets" id="composeButton" onClick={openEmailPopup}><i className="fa-solid fa-pen"></i><span>Write</span></button>
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

                        <button className="main-bar-second-part no-bullets" onClick={() => navigate('/Mail')}>
                            <i className="fa-solid fa-inbox fa-lg" style={{ color: '#213458' }}></i>Inbox
                        </button>
                        <button className="main-bar-second-part no-bullets" onClick={() => navigate("/Flagged")}><i className="fa-solid fa-star fa-lg" style={{ color: '#ffd43b' }}></i>Flagged</button>
                        <button className="main-bar-second-part no-bullets" onClick={() => navigate("/Sent")}><i className="fa-solid fa-square-arrow-up-right fa-lg" style={{ color: '#213458' }}></i>Sent</button>
                        <button className="main-bar-second-part no-bullets"><i className="fa-solid fa-comment-slash fa-lg" style={{ color: '#213458' }}></i>Spam</button>
                        <button className="main-bar-second-part no-bullets"><i className="fa-solid fa-paperclip fa-lg" style={{ color: '#213458' }}></i>Draft</button>
                        <button className="main-bar-second-part no-bullets"><i className="fa-solid fa-floppy-disk fa-lg" style={{ color: '#213458' }}></i>Files</button>
                    </div>
                </section>
                <section className="upside-bar">
                    <div className="navbar-left">
                        <div id="checkbox">
                            <input className="checkbox" type="checkbox" />
                        </div>

                        <div className="dropdown">
                            <button className="sort-by">Sort<span>&#9662;</span></button>
                            <div className="dropdown-content">
                                <a href="#" id="sortDate">Date</a>
                                <a href="#" id="sortSender">Sender</a>
                                <a href="#" id="sortSubject">Subject</a>
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
                <section>
                    <div className="color-picker">
                        <label htmlFor="rectangle1Color">Rectangle 1 Color:</label>
                        <input
                            type="color"
                            id="rectangle1Color"
                            value={rectangle1Color}
                            onChange={(e) => setRectangle1Color(e.target.value)}
                        />
                        <label htmlFor="rectangle2Color">Rectangle 2 Color:</label>
                        <input
                            type="color"
                            id="rectangle2Color"
                            value={rectangle2Color}
                            onChange={(e) => setRectangle2Color(e.target.value)}
                        />
                        <button onClick={handleApplyColors}>Apply Colors</button>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default App;
