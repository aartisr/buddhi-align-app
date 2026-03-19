
import React from "react";
import SishubharathiLogo from "./SishubharathiLogo";
import "./site-footer.css";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer__dedication">
        <span style={{ fontWeight: 500, marginRight: 6, color: '#4B0082' }}>Dedicated to</span>
        <a
          href="https://www.shishubharati.net/"
          target="_blank"
          rel="noopener noreferrer"
          className="site-footer__logo-link"
        >
          <SishubharathiLogo />
          <span className="site-footer__logo-text">
            Sishubharathi School
          </span>
        </a>
        <span className="site-footer__dedication-rest">
          , Teachers, Volunteers, and Students
        </span>
      </div>
      <div className="site-footer__copyright">
        &copy; {new Date().getFullYear()} <a href="https://aartisr.netlify.app/" target="_blank" rel="noopener noreferrer" style={{ color: '#C72C6A', fontWeight: 500, textDecoration: 'none' }}>Aarti Sri Ravikumar</a>. All rights reserved.
      </div>
    </footer>
  );
}
