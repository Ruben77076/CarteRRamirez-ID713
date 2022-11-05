import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import debug from 'sabio-debug';
import userProfileService from '../../services/userProfileService';
import profileSchema from '../../schemas/profileSchema';
import FileUploaderContainer from '../FileUploaderContainer';
import toastr from 'toastr';
import './userprofile.css';
import { MdOutlineNavigateNext } from 'react-icons/md';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

import UserPassword from './UserPassword';

const _logger = debug.extend('UserProfileForm');

const UserProfileForm = (props) => {
    
    const [userForm, setUserForm] = useState({
        firstName: '',
        lastName: '',
        mi: '',
        avatarUrl: '',
    });

    const [isCreatingNew, setCreatingNew] = useState(true);
    const [isChangingPw,setIsChangingPw] = useState(false);
    const params = useParams();
    const { state } = useLocation();
    const nav = useNavigate();

    useEffect(() => {
        _logger('useEffect firing');
        _logger('useEffect firing state', state);

        if (state?.type === 'PROFILE_EDIT') {
            setCreatingNew(!isCreatingNew);
            setUserForm((prevState) => {
                const { firstName, lastName, mi, avatarUrl } = state.payload;
                return {
                    ...prevState,
                    firstName: firstName,
                    lastName: lastName,
                    mi: mi,
                    avatarUrl: avatarUrl,
                };
            });
        }
        if (state?.id) {
            setCreatingNew(!isCreatingNew);
            setUserForm((prevState) => {
                const { firstName, lastName, mi, avatarUrl } = state;
                return {
                    ...prevState,
                    firstName: firstName,
                    lastName: lastName,
                    mi: mi,
                    avatarUrl: avatarUrl,
                };
            });
        }
    }, []);

    const onFormClicked = (values) => {
        const payload = {
            firstName: values.firstName,
            lastName: values.lastName,
            mi: values.mi,
            avatarUrl: values.avatarUrl,
            IsDeleted: false,
        };

        if (params.id > 0) {
            userProfileService.Update(params, payload).then(onFormSuccess).catch(onFormError);
        } else {
            userProfileService.Add(payload).then(onFormSuccess).catch(onFormError);
        }
        _logger('onFormClicked', values);
    };

    const onFormSuccess = (response) => {
        if (params.id > 0) {
            toastr.success('Profile has been updated');
        } else {
            if (response) {
                toastr.success('Profile has been Added');
            }
        }
        if (props.currentUser.roles.includes('SysAdmin')) {
            nav('/admin/dashboard/analytics');
        } else {
            if (props.currentUser.roles.includes('Customer')) {
                nav('/dashboard');
            }
        }
    };

    const onFormError = (err) => {
        _logger(err);
        if (params.id > 0) {
            toastr.error('Something Went Wrong!, Update Error');
        } else {
            toastr.error('Something Went Wrong!, Profile Add Error');
        }
    };
    const onHandleUploadUrl = (file, setFieldValue) => {
        setFieldValue('avatarUrl', file[0].url);
    };
    const onChangePassword = () =>{
        _logger("changing password?");
         setIsChangingPw(()=>{
            return !isChangingPw;
         })
    }
    
    return (
        <React.Fragment>
            <div className="m-lg-5 p-sm-3">
                <div className="form-wrapper col-lg-9">
                    <div className="row">
                        <div className="col h1 editor-preview-active">
                            <ol className="profile-breadcrumb m-0">
                                <li>
                                    <h4 className="header-title editor-statusbar">
                                        User Profile <MdOutlineNavigateNext />
                                    </h4>
                                </li>
                                <li>
                                    <h4>{isCreatingNew ? 'Setup your profile' : 'Edit profile, URL or change password'}</h4>
                                </li>
                            </ol>
                        </div>
                    </div>
                    <Formik
                        enableReinitialize={true}
                        initialValues={userForm}
                        on
                        validationSchema={profileSchema}
                        onSubmit={onFormClicked}>
                        {({ setFieldValue }) => (
                            <Form>
                                <div className="mb-3">
                                    <label htmlFor="firstName" className="form-label">
                                        First Name
                                    </label>
                                    <Field name="firstName" id="firstName" type="text" className="form-control" />
                                    <ErrorMessage name="firstName" component="div" className="has-error" />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="lastName" className="form-label">
                                        Last Name
                                    </label>
                                    <Field name="lastName" id="lastName" type="text" className="form-control" />
                                    <ErrorMessage name="lastName" component="div" className="has-error" />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="mi" className="form-label">
                                        M.I.
                                    </label>
                                    <Field name="mi" id="middleInitial" type="text" className="form-control" />
                                    <ErrorMessage name="mi" component="div" className="has-error" />
                                </div>
                                <div className="mb-3">
                                    <label htmlFor="avatarUrl" className="form-label">
                                        Add Photo
                                    </label>
                                    <FileUploaderContainer
                                        name="avatarUrl"
                                        onHandleUploadSuccess={(file) => onHandleUploadUrl(file, setFieldValue)}
                                        className="form-control"
                                    />
                                    <ErrorMessage name="avatarUrl" component="div" className="has-error" />
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <button className="btn btn-primary mb-4">
                                            {isCreatingNew ? 'Save Profile' : 'Edit Profile'}
                                        </button>
                                    </div>
                                </div>
                            </Form>
                        )}
                    </Formik>
                    <div className="row">
                            <div className="col">
                                <Button className="btn btn-primary mb-1" id="changepw" type='button' onClick={onChangePassword}>
                                    Change Password
                                </Button>
                            </div>
                        </div>
                            <div className="col ps-0">
                            {isChangingPw ? <UserPassword props={props}/> : null }
                            </div>

                    </div>
                
            </div>
        </React.Fragment>
    );
};

UserProfileForm.propTypes = {
    currentUser: PropTypes.shape({
        id: PropTypes.number,
        roles: PropTypes.arrayOf(PropTypes.string),
        email: PropTypes.string,
        isLoggedIn: PropTypes.bool,
    }),
};

export default UserProfileForm;
