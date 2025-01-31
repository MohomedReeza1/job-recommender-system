import React from "react";
import { Link } from "react-router-dom";
import '../styles/Footer.css';


const Footer = () => {
  return (
    <footer className="footer">
        <div className="footer-container">
            <div className="footer-logo">
                <h3>GlobalHire</h3>
                <p>Helping you find the perfect job since 2025.</p>
            </div>
            <div className="footer-links">
                <h4>Quick Links</h4>
                <ul>
                <li><Link to="/jobs">Jobs</Link></li>
                <li><Link to="/recommendations">Recommendations</Link></li>
                <li><Link to="/applied-jobs">Applied Jobs</Link></li>
                <li><Link to="/profile">Profile</Link></li>
                </ul>
            </div>
            <div className="footer-contact">
                <h4>Contact Us</h4>
                <p>Email: support@globalhire.com</p>
                <p>Phone: +1 555-123-4567</p>
            </div>
            <div className="footer-newsletter">
                <h4>Newsletter</h4>
                <input type="email" placeholder="Enter your email" />
                <button>Subscribe</button>
            </div>
        </div>
        <p className="footer-bottom">© 2025 GlobalHire. All rights reserved.</p>
    </footer>
  );
};

export default Footer;



