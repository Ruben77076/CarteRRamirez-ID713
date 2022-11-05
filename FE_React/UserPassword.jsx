import React,{useState} from 'react'
import { Formik, Form, Field,ErrorMessage} from 'formik';
import { Button} from 'react-bootstrap';
import debug from 'sabio-debug';
import oldPasswordSchema from '../../schemas/oldPasswordSchema';
import { BsEye, BsEyeSlash } from 'react-icons/bs';
import PropTypes from 'prop-types';
import userService from '../../services/userService';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';


const _logger = debug.extend('Password');

function UserPassword(props) {
    const email = props.props.currentUser.email;

    const navi = useNavigate();


    const [oldPw]=useState({
        email: email,
        password:"",
    });
    
    const [hidePassword,setHidePassword]=useState(false);
    
    const onPasswordEyeClicked = () => {
        setHidePassword(!hidePassword);
    };
    const onOldPwSubmit = (values) =>{
        _logger('we got full payload?');
        userService.checkOldPassword(values).then(onOldPwSuccess).catch(onOldPwFail);

    }
    const onOldPwSuccess = () =>{
        
        Swal.fire({
            title: 'Ok I trust you',
            text: 'You can now change password',
            icon: 'success',
            button: 'close',
        });
        navi('/changepassword');
    }
    const onOldPwFail = () =>{
        Swal.fire({
            title: 'Hey! I dont know you.',
            text: 'Enter the correct password',
            icon: 'error',
            button: 'close',
        });
    }
  return (
    <React.Fragment>
        <div className="form-wrapper col-4">
            <div className="col ">
                <h5 className="text-muted mb-2">
                    {
                        "Enter your old password"
                    }
                </h5>
                <Formik 
                    enableReinitialize={true}
                    validationSchema={oldPasswordSchema}
                    initialValues={oldPw}
                    onSubmit={(values) => onOldPwSubmit(values)}>
                    {
                        <Form>
                            <div className="d-flex">
                                <Field 
                                    type={hidePassword ? 'text' : 'password'} 
                                    name="password" className="form-control col-5" 
                                    placeholder="¿Old Password?" 
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
                            <br></br>
                            <div className="row">
                                <div className="col">
                                <Button variant="primary" type="submit">
                                    {'Submit'}
                                </Button>
                                </div>
                            </div>
                        </Form>

                    }
                    

                </Formik>

            </div>
                    
        </div>

    </React.Fragment>
  )
}
UserPassword.propTypes = {
    props: PropTypes.shape({
        currentUser: PropTypes.shape({
            id: PropTypes.number,
            roles: PropTypes.arrayOf(PropTypes.string),
            email: PropTypes.string,
            isLoggedIn: PropTypes.bool,
        }),

    })
}

export default UserPassword