import BreadCrumb from 'components/common/forms/BreadCrumb';
import { Input } from 'components/common/forms/Input';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import ReactNotification from 'react-notifications-component';
import { Button, Col, Container, FormGroup, Row } from 'reactstrap';
import { getJwt } from 'service/authService';
import { editPassword } from 'service/profileService';

class ChangePassword extends PureComponent {

  state = {
    data: {},
    passmatch: false
  }

  constructor(props) {
    super(props);

    this.notificationDOMRef = React.createRef();
  }



  componentDidMount = async () => {
    await this.getUserInfo();
  }

  validateProperty = (name, value) => {
    const schema = Joi.reach(Joi.object(this.schema), name)
    const { error } = Joi.validate(value, schema);
    return error ? error.details[0].message : null;
  };

  schema = {
    oldpassword: Joi.string().required().label("Old Password"),
    newpassword: Joi.string().required().label("New Password"),
    confirmpassword: Joi.string().required().label("Confirm Password"),
  };

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;

    await this.setState({ [name]: value })

  }

  getUserInfo = async () => {
    let res = await getJwt('__info');
    const { uid } = res;
    await this.setState({ uid: uid, userInfo: res, mail: res.email });
  }


  onSubmit = async () => {

    const data = this.formApi.getState().values;
    const { oldpassword, newpassword } = data
    const { mail, passmatch } = this.state

    if (data.newpassword !== data.confirmpassword) {
      this.setState({ passmatch: false })

      this.addNotification("Password Mismatch", "warning")
      this.formApi.setValue('newpassword', '')
      this.formApi.setValue('confirmpassword', '')

    } else {
      this.setState({ passmatch: true })
    }

    if (passmatch) {
      let payload = {
        "email": mail,
        "oldPassword": oldpassword,
        "newPassword": newpassword
      }
      let res = await editPassword(payload)
      if (res.data.statusCode !== 1) {
        this.addNotification(res.data.message, "warning")
        this.formApi.reset();
      }
      if (res.data.statusCode === 1) {
        this.addNotification(res.data.message);
        this.formApi.reset();
      }
    }

  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }

  render() {

    const breadCrumbItems = {
      title: 'Change Password',
      items: [
        { name: 'Profile', active: false, link: '/' },
        { name: 'Change Password', active: true },
      ]
    };



    return (
      <Fragment>
        <Container>
          <Row>
            <Col>
              <div style={{ marginTop: '50px' }}>
                <BreadCrumb data={breadCrumbItems} />

              </div>
            </Col>
          </Row>

        </Container>
        <ReactNotification ref={this.notificationDOMRef} />
        <div className="container">
          <div className="row">
            <div className="col-md-9 cartcolumnpadding1">
              <h3 id="h3heading10">Change Password</h3>
            </div>
          </div>
        </div>
        <Container className="table-div p-3">

          <Row>
            <Col>
              <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
                {({ formApi, formState }) => (
                  <div>

                    <Row>
                      <Col sm={4}>
                        <Input field="oldpassword" label="Old Password" type="password" name="oldpassword" maxLength="10" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('oldpassword', e)} />

                      </Col>
                      <Col sm={4}>
                        <Input field="newpassword" label="New Password" type="password" name="newpassword" maxLength="10" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('newpassword', e)} />
                      </Col>
                      <Col sm={4}>
                        <Input field="confirmpassword" label="Confirm Password" type="password" name="confirmpassword" maxLength="10" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('confirmpassword', e)} />
                      </Col>
                    </Row>
                    <FormGroup className="text-right">
                      <Button type="submit" value="Submit" color="success" size={"sm"}  >Submit</Button>
                    </FormGroup>

                  </div>
                )}
              </Form>
            </Col>
          </Row>
        </Container>
      </Fragment>
    )
  }
}

export default withSnackbar(ChangePassword);