import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <div className='mb-5'>
      <nav className='navbar navbar-dark bg-primary'>
        <div className='container-fluid'>
          <Link className='navbar-brand' to='/'>
            Bank App
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;