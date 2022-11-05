import React,{ useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Formik, Form, Field,ErrorMessage} from 'formik';
import AccountLayout from './AccountLayout';
import Swal from 'sweetalert2';
import forgotPasswordSchema from '../../schemas/forgotPwSchema';
import userService from '../../services/userService';

/* bottom link */
const BottomLink = () => {
    return (
        <Row className="mt-3">
            <Col className="text-center">
                <p className="text-muted">
                    {'Back to:'}{' '}
                    <Link to={'/login'} className="text-muted ms-1">
                        <b>{'Log In'}</b>
                    </Link>
                    {" "}
                    <Link to={'/'} className="text-muted ms-1">
                        <b>{'Home'}</b>
                    </Link>
                </p>
            </Col>
        </Row>
    );
};

const ForgetPassword = () => {
    const nav = useNavigate();
    
    const [emailReset] = useState({
        email:''
    });
    const onForgotPassEmailSuccess = () =>{
        
        Swal.fire({
            title: 'Email Sent',
            text: 'Please check your email to reset password!',
            icon: 'success',
            button: 'close',
        }).then(nav("/login"));

    }
    const onForgotPassEmailErr = () =>{
        
        Swal.fire({
            title: 'Whoops,No account exists or you have not confirmed your account!',
            icon: 'error',
            button: 'close',
        });
    }
    
    const onForgotSubmit = (values) => {
        
        userService.forgotPassword(values).then(onForgotPassEmailSuccess).catch(onForgotPassEmailErr)
    };
    return (
        <AccountLayout bottomLinks={<BottomLink />}>
            <>
                <div className="m-auto">
                    <h4 className="text-dark-50 mt-0 font-weight-bold">{'Reset Password'}</h4>
                    <p className="text-muted mb-4">
                        {
                            "Enter your email address and we'll send you an email with instructions to reset your password"
                            
                        }
                    </p>
                    
                </div>

                <Formik 
                    enableReinitialize={true}
                    validationSchema={forgotPasswordSchema}
                    initialValues={emailReset}
                    onSubmit={onForgotSubmit}>
                    {
                        <Form>
                            <label className="form-label" name="email">
                                Email Address
                            </label>
                            <Field type="email" name="email" className="form-control" placeholder="Enter your email" />
                            <ErrorMessage name="email" component="div" className="has-error" />
                            <br></br>
                            <div className="mb-3 mb-0 text-center">
                                <Button variant="primary" type="submit">
                                    {'Submit'}
                                </Button>
                            </div>
                        </Form>

                    }
                

                </Formik>
            </>
        </AccountLayout>
    );
};

export default ForgetPassword;
