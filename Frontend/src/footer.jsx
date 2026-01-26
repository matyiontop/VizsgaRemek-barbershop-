import React from 'react';

function Footer() {
  return (
    <footer>
      <div>
        <div>
          <iframe 
            width="400" 
            height="250" 
            src="https://maps.google.com/maps?q=kiskunhalas &t=&z=13&ie=UTF8&iwloc=&output=embed"
            title="Térkép"
          ></iframe>
        </div>

        <div>
          <h3>Németh Fodrászat</h3>
          <p>Cím: 1234 Budapest, Példa utca 1.</p>
          <p>&copy; 2025 Minden jog fenntartva.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
