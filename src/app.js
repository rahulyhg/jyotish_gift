import Match from 'react-router/Match';
import Link from 'react-router/Link';
import Login from './components/Login/Login';
import React from 'react';

import Html from './components/Html';

const ParamsExample = () => {
  return (
      <div>
        <h2>Accounts</h2>
        <ul>
          <li><Link to="/jyotish">Jyotish 201</Link></li>
          <li><Link to="/gift">Gift</Link></li>
          <li><Link to="/Oleg">Oleg</Link></li>
          <li><Link to="/Astrology">Astrology</Link></li>
          <li><Link to="/login">Test Login</Link></li>
        </ul>
        
        
        <Match pattern="/login" component={Login} />
        <Match pattern="/test/:id" component={ Child } />
      </div>
  );
};

const Child = ({ params }) => {
  return (
      <div>
        <h3>ID: {params.id}</h3>
      </div>
  );
};


export default ParamsExample;
