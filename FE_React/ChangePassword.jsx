import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from 'react-bootstrap';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import debug from 'sabio-debug';
import Swal from 'sweetalert2';
import './user.css';
import forgotPasswordResetSchema from '../../schemas/forgotPwResetSchema';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import AccountLayout from './AccountLayout';
import BottomLink from './BottomLink';
import { BiLogInCircle } from 'react-icons/bi';
import userService from '../../services/userService';
import PropTypes from 'prop-types';
import changePwSchema from '../../schemas/changePwSchema';

const _logger = debug.extend('Password');

function ChangePassword(props) {
    const findToken = useLocation().search;
    const navi = useNavigate();
    const userToken = props.userToken;
    const loginUser = props.currentUser;
    const isLoggedIn = loginUser.isLoggedIn;

    const [token] = useState(new URLSearchParams(findToken).get('token'));
    const [pwReset] = useState({
        password: '',
        confirmPassword: '',
        token: token,
    });
    const Id = loginUser.id;
    const [validUser] = useState(isLoggedIn);
    const [changePW] = useState({
        password: '',
        confirmPassword: '',
        email: loginUser.email,
        Id: Id,
        token: userToken,
      });
    const [hidePassword, setHidePassword] = useState(false);

    _logger('props: ', props, isLoggedIn);
    _logger('my props:', loginUser, validUser);


    useEffect(() => {
        if (token !== null) {
            userService.passCheckToken({ token }).then(onTokenSuccess).catch(onTokenFail);
            _logger('Is this the token w/ useEffect', token);
        }
    }, []);

    // useEffect(() => {
    //     if (Id > 0) {
    //         debugger;
    //         userService.checkPasswordId().then(onUserIdSuccess).then(onUserIdFail);
    //     }
    //     _logger('changePasswordId firing?===>', Id);
    // }, []);

    const onPasswordEyeClicked = () => {
        setHidePassword(!hidePassword);
    };

    const onTokenSuccess = () => {
        _logger('you are in=>>>');
        Swal.fire({
            title: 'Resetting?',
            text: 'This is a Secure line',
            icon: 'success',
            button: 'close',
        });
    };
    const onTokenFail = (err) => {
        _logger('Reset error ->>>', err);
        Swal.fire({
            title: 'Reset Failed',
            text: 'Double check passwords match or you have an expired token!',
            icon: 'error',
            button: 'Close',
        });
    };
    // const onUserIdSuccess = () => {
        
    //     Swal.fire({
    //         title: 'Hurry change your password',
    //         text: 'Secure line',
    //         icon: 'success',
    //         button: 'close',
    //     });
    // };

    // const onUserIdFail = () => {
    //     _logger('UserId error ->>>');
    //     Swal.fire({
    //         title: 'UserId Failed',
    //         text: 'Wheres the login',
    //         icon: 'error',
    //         button: 'Close',
    //     });
    // };

    const onHandleSubmit = (values) => {
        _logger('Are we good?', values);
        validUser
            ? userService.changePassword(values).then(onChangeSuccess).catch(onChangeFail)
            : userService.forgotPassReset(values).then(onResetSuccess).catch(onResetFail);
    };

    const onResetSuccess = () => {
        Swal.fire({
            title: 'New Password Confirmed',
            text: 'You can now login!',
            icon: 'success',
            button: 'close',
        });
        navi('/login');
    };
    const onResetFail = () => {
        Swal.fire({
            title: 'Password not accepted or internal error!',
            icon: 'error',
            button: 'close',
        });
    };
    const onChangeSuccess = () => {
        Swal.fire({
            title: 'New Password Confirmed',
            text: 'You can now login!',
            icon: 'success',
            button: 'close',
        });
        navi('/login');
    };
    const onChangeFail = () => {
        Swal.fire({
            title: 'Password not accepted or internal error!',
            icon: 'error',
            button: 'close',
        });
    };

    return (
        <AccountLayout bottomLinks={<BottomLink />}>
            <>
                {validUser ? (
                    <div className="container">
                        <h4 className="mt-0">{'Change Your Password'}</h4>
                        <p className="text-muted mb-4">{'Enter your new password and confirm your new password.'}</p>
                    </div>
                ) : (
                    <div className="container">
                        <h4 className="mt-0">{'Reset Your Password'}</h4>
                        <p className="text-muted mb-4">{'Enter your new password and confirm your new password.'}</p>
                    </div>
                )}

                <Formik
                    onSubmit={(values) => onHandleSubmit(values)}
                    enableReinitialize={true}
                    initialValues={validUser ? changePW : pwReset}
                    validationSchema={validUser ? changePwSchema : forgotPasswordResetSchema}>
                    <Form>
                        <div className="mb-3">
                            <label className="form-label">Password </label>
                            <div className="d-flex">
                                <Field
                                    name="password"
                                    className="form-control"
                                    placeholder="Enter your password"
                                    type={hidePassword ? 'text' : 'password'}
                                />
                                <div
                                    className="show-password input-group-text input-group-password"
                                    data-password={hidePassword ? 'true' : 'false'}>
                                    {!hidePassword ? (
                                        <BsEye onClick={onPasswordEyeClicked} />
                                    ) : (
                                        <BsEyeSlash onClick={onPasswordEyeClicked} />
                                    )}
                                </div>
                            </div>
                            <ErrorMessage name="password" component="div" className="has-error" />
                        </div>
                        <br></br>
                        <div className="mb-3">
                            <label className="form-label">Confirm Password </label>
                            <div className="d-flex">
                                <Field
                                    name="confirmPassword"
                                    className="form-control"
                                    placeholder="Enter your password again"
                                    type={hidePassword ? 'text' : 'password'}
                                />
                                <div
                                    className="show-password input-group-text input-group-password"
                                    data-password={hidePassword ? 'true' : 'false'}>
                                    {!hidePassword ? (
                                        <BsEye onClick={onPasswordEyeClicked} />
                                    ) : (
                                        <BsEyeSlash onClick={onPasswordEyeClicked} />
                                    )}
                                </div>
                            </div>
                            <ErrorMessage name="confirmPassword" component="div" className="has-error" />
                        </div>
                        <div className="d-grid mb-0 text-center mt-2">
                            <Button type="submit" className="user-btn">
                                <BiLogInCircle />
                                {'Change Password'}
                            </Button>
                        </div>
                    </Form>
                </Formik>
            </>
        </AccountLayout>
    );
}
ChangePassword.propTypes = {
    currentUser: PropTypes.shape({
        id: PropTypes.number,
        roles: PropTypes.arrayOf(PropTypes.string),
        email: PropTypes.string,
        isLoggedIn: PropTypes.bool,
    }),
    userToken: PropTypes.shape({
        
    })
};

export default ChangePassword;
