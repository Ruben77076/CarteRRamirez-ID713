import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import debug from 'sabio-debug';

const _logger = debug.extend('Login');

const BottomLink = () => {
    const search = useLocation().pathname;
    _logger('search', search);

    return (
        <footer className="footer footer-alt">
            {search === '/login' ? (
                <p className="text-muted">
                    <span>{"Don't have account?"}</span>
                    <Link to={'/register'} className="text-muted ms-1">
                        <b>{'Register'}</b>
                    </Link>
                </p>
            ) : (
                <p className="text-muted">
                    <span>{'Already have account?'}</span>
                    <Link to={'/login'} className="text-muted ms-1">
                        <b>{'Login'}</b>
                    </Link>
                </p>
            )}
        </footer>
    );
};

export default BottomLink;
