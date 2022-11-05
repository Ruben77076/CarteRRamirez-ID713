import React, { useEffect } from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ImQuotesLeft, ImQuotesRight } from 'react-icons/im';
import debug from 'sabio-debug';
import LogoLight from '../../assets/images/carte-logo.png';
import LogoDark from '../../assets/images/carte-logo.png';

const _logger = debug.extend('AccountLayout');

const AccountLayout = ({ children, bottomLinks }) => {
    useEffect(() => {
        if (document.body) document.body.classList.add('authentication-bg');

        return () => {
            if (document.body) document.body.classList.remove('authentication-bg');
        };
    }, []);

    const nav = useNavigate();

    const homeRedirect = () => {
        const state = { type: 'LOGO_CLICKED', payload: true };
        nav('/', { state });
        _logger('act layout', state);
    };

    return (
        <>
            <div className="auth-fluid">
                <div className="auth-fluid-form-box">
                    <div className="align-items-center d-flex h-100">
                        <Card.Body>
                            <div className="auth-brand text-center text-lg-start">
                                <span onClick={homeRedirect} className="logo-dark">
                                    <img src={LogoDark} alt="" height="80" />
                                </span>

                                <span onClick={homeRedirect} className="logo-light">
                                    <img src={LogoLight} alt="" height="80" />
                                </span>
                            </div>
                            {children}
                            {bottomLinks}
                        </Card.Body>
                    </div>
                </div>
                <div className="auth-fluid-right text-center">
                    <div className="auth-user-testimonial">
                        <h2 className="mb-3">{'Menus Your Way'}</h2>
                        <p className="lead">
                            <ImQuotesLeft className="m-1" />
                            {"It's a elegent templete. I love it very much! ."}
                            <ImQuotesRight />
                        </p>
                        <p>{'- Carte Admin User'}</p>
                    </div>
                </div>
            </div>
        </>
    );
};

AccountLayout.propTypes = {
    bottomLinks: PropTypes.element.isRequired,
    children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.element), PropTypes.element]).isRequired,
};

export default AccountLayout;
