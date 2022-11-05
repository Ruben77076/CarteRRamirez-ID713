import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import userService from '../../services/userService';
import debug from 'sabio-debug';
import './user.css';
import Swal from 'sweetalert2';
import AccountLayout from './AccountLayout';
import { BiLogInCircle } from 'react-icons/bi';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import BottomLink from './BottomLink';
import loginSchema from '../../schemas/loginSchema';
import ReactGa from 'react-ga4';

const _logger = debug.extend('Login');

const Login = () => {
    const [user] = useState({
        email: '',
        password: '',
    });
    const nav = useNavigate();

    const onLoginClicked = (values) => {
        userService.login(values).then(onLoginSuccess).catch(onLoginError);
        ReactGa.event({
            action: 'login_action',
            category: 'login_category',
            label: 'login_label',
            value: 'xxxxx',
        });
    };

    const onLoginError = (err) => {
        _logger('Login Error ->', err.response);
        if (err.response?.data.errors[0].includes('Email')) {
            Swal.fire({
                title: 'Email Not Confirmed/In Database',
                text: 'Comfirm if email is correct, if not create a account',
                icon: 'warning',
                button: 'Close',
            });
        } else {
            Swal.fire({
                title: 'Login Failed',
                text: 'Check if all fields are correct',
                icon: 'error',
                button: 'Close',
            });
        }
    };

    const onLoginSuccess = (response) => {
        _logger('Login Success ->', response);
        userService.currentUser().then(onGetCurrentUserSuccess).catch(onGetCurrentUserErr);
    };

    const onGetCurrentUserErr = (err) => {
        _logger('Current User Err ->', err);
    };

    const onGetCurrentUserSuccess = (response) => {
        _logger('Current User Success ->', response.item);
        const state = { type: 'LOGIN_SUCCESS', payload: response.item };
        _logger('Login State ->', state);

        let roles = response.item.roles;
        if (roles.includes('SysAdmin')) {
            nav('/admin/dashboard/analytics', { state });
        } else if (roles.includes('OrgAdmin')) {
            const orgState = { type: 'LOGIN_SUCCESS', payload: response.item, aRole: 'Org-Admin' };
            nav('/dashboard/organization', { state: orgState });
        } else {
            if (response.item.hasProfile) {
                nav('/dashboard', { state });
            } else {
                nav('/users/profiles/add', { state });
            }
        }
    };

    const [showPassword, setShowPassword] = useState(false);

    const onPasswordEyeClicked = () => {
        setShowPassword(!showPassword);
    };

    return (
        <AccountLayout bottomLinks={<BottomLink />}>
            <>
                <h4 className="mt-0">{'Sign In'}</h4>
                <p className="text-muted mb-4">{'Enter your email address and password to access account.'}</p>

                <Formik
                    onSubmit={onLoginClicked}
                    enableReinitialize={true}
                    initialValues={user}
                    validationSchema={loginSchema}>
                    <Form>
                        <div className="mb-3">
                            <label className="form-label" name="email">
                                Email Address
                            </label>
                            <Field type="text" name="email" className="form-control" placeholder="Enter your email" />
                            <ErrorMessage name="email" component="div" className="has-error" />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Password </label>
                            <Link to="/forgotpassword" className="text-muted float-end">
                                <small>{'Forgot your password?'}</small>
                            </Link>
                            <div className="d-flex">
                                <Field
                                    name="password"
                                    className="form-control"
                                    placeholder="Enter your password"
                                    type={showPassword ? 'text' : 'password'}
                                />
                                <div
                                    className="show-password input-group-text input-group-password"
                                    data-password={showPassword ? 'true' : 'false'}>
                                    {!showPassword ? (
                                        <BsEye onClick={onPasswordEyeClicked} />
                                    ) : (
                                        <BsEyeSlash onClick={onPasswordEyeClicked} />
                                    )}
                                </div>
                            </div>
                            <ErrorMessage name="password" component="div" className="has-error" />
                        </div>
                        <div className="d-grid mb-0 text-center mt-2">
                            <Button type="submit" className="user-btn">
                                <BiLogInCircle />
                                {'Log In'}
                            </Button>
                        </div>
                    </Form>
                </Formik>
            </>
        </AccountLayout>
    );
};

export default Login;
