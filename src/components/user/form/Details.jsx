import 'styles/style.css';
import 'styles/userstyle.css';

import BreadCrumb from 'components/common/forms/BreadCrumb';
import { Input } from 'components/common/forms/Input';
import { Textarea } from 'components/common/forms/textarea';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import { Col, Container, Row } from 'reactstrap';
import { getJwt } from 'service/authService';
import { getProfileDetails, updateProfileDetails } from 'service/profileService';

 


class Details extends PureComponent {
	constructor(props) {
		super(props)
		this.notificationDOMRef = React.createRef();
	}

	state = {
		data: {}
	}

	componentDidMount = async () => {
		await this.getUserInfo();
		await this.profileDetails()
	}

	validateProperty = (name, value) => {
		const schema = Joi.reach(Joi.object(this.schema), name)
		const { error } = Joi.validate(value, schema);
		return error ? error.details[0].message : null;
	};

	schema = {
		userName: Joi.string().required().label("Name"),
		email: Joi.string().required().label("Mail"),
		phone: Joi.string().required().label("Mobile"),
		address1: Joi.string().required().label("Primary Address"),
		address2: Joi.string().required().label("Secondary Address"),
	};

	handleChange = async ({ currentTarget: Input }) => {
		const { name, value } = Input;
		const { data } = this.state;
		data[name] = value;

		await this.setState({
			[name]: value
		})
	}

	getUserInfo = async () => {
		let res = await getJwt('__info');
		const { uid } = res;
		await this.setState({ uid: uid, userInfo: res });
	}

	onSubmit = async () => {
		const data = this.formApi.getState().values;
		const { address1, email, userName, phone, address2 } = data
		const { uid } = this.state
		let postData = {
			"address1": address1,
			"city1": "",
			"pincode1": "",
			"address2": address2,
			"city2": "",
			"pincode2": "",
			"state2": "",
			"addType2": "",
			"email": email,
			"defaultAddress": "",
			"state1": "",
			"name": userName,
			"secondaryContactNo": "",
			"primaryContactNo": phone,
			"addType1": "",
			"userId": uid
		}
		let res = await updateProfileDetails(postData)
		if (res.data.statusCode === 1) {
			await this.addNotification(res.data.message)
			this.profileDetails()
		}
		this.addNotification(res.data.message, "warning")
	}

	setFormApi = (formApi) => {
		this.formApi = formApi;
	}

	async profileDetails() {
		const { uid } = this.state
		let params = `userId=${uid}`
		let res = await getProfileDetails(params)
		if (res.data.statusCode === 1) {
			await this.setState({ profileData: res.data.data })
			await this.sampleData()
		} else {
			await this.setState({ profileData: [] })
		}
	}

	async sampleData() {
		const { profileData } = this.state
		if (profileData && profileData.length > 0) {
			this.formApi.setValues(profileData[0])
		}
	}
	
	addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }

	render() {
		const { profileData } = this.state
		const breadCrumbItems = {
			title: 'Details',
			items: [
				{ name: 'Profile', active: false, link: '/' },
				{ name: 'Details', active: true },
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
				<div className="container">
					<div className="row">
						<div className="col-md-9 cartcolumnpadding1">
							<h3 id="h3heading10">Account Information</h3>
						</div>
					</div>
				</div>

				<Container>

					<Row>

						<Col sm={12}>
							{profileData && profileData.length > 0 &&
								<Row>

									<Col sm={5}>
										<Row>
											<Col sm={12}>
												<div className="cartwell" >
													<div className="row text-center myprofilerowpadding1     flex-column">
														<i className="fa fa-user-circle-o" id="myprofileimage1" alt="User"></i>
														<div>
														<Row>
															<Col sm={1}></Col>
															<Col md={5} sm={12} style={{ textAlign: 'left' }}>
																<p id="profileparagraph">
																	<i className="fa fa-user" id="facoloruser"></i> Name : </p>
															</Col>
															<Col md={5} sm={12} style={{ textAlign: 'left' }} >
																<p id="profileparagraph">{profileData[0].userName}</p>
															</Col>
															<Col sm={1}></Col>
														</Row>
														</div>
														<div>
														<Row>
															<Col sm={1}></Col>
															<Col md={5} sm={12} style={{ textAlign: 'left' }}>
															<p id="profileparagraph">
																	<i className="fa fa-envelope-o" id="facoloremail"></i> Email : </p>
															</Col>
															<Col md={5} sm={12} style={{ textAlign: 'left' }} >
															<p id="profileparagraph">{profileData[0].email}</p>
															</Col>
															<Col sm={1}></Col>
														</Row>
														</div>
														<div>
														<Row>
															<Col sm={1}></Col>
															<Col md={5} sm={12} style={{ textAlign: 'left' }}>
															<p id="profileparagraph">
																	<i className="fa fa-phone" id="facolorcontactno"></i>  Contact No : </p>
															</Col>
															<Col md={5} sm={12} style={{ textAlign: 'left' }} >
															<p id="profileparagraph">{profileData[0].phone}</p>
															</Col>
															<Col sm={1}></Col>
														</Row>
													
														</div>
														<div>
														<Row>
															<Col sm={1}></Col>
															<Col md={5} sm={12} style={{ textAlign: 'left' }}>
															<p id="profileparagraph"><i className="fa fa-map-marker" id="facoloraddress"></i> Primary Address :
															</p>
															</Col>
															<Col md={5} sm={12} style={{ textAlign: 'left' }} >
															<p id="profileparagraph">{profileData[0].address1}</p>
															</Col>
															<Col sm={1}></Col>
														</Row>

														</div>
														<div>
														<Row>
															<Col sm={1}></Col>
															<Col md={5} sm={12} style={{ textAlign: 'left' }}>
															<p id="profileparagraph"><i className="fa fa-map-marker" id="facoloraddress"></i> Secondary Address :
															</p>
															</Col>
															<Col md={5} sm={12} style={{ textAlign: 'left' }} >
															<p id="profileparagraph">{profileData[0].address2}</p>
															</Col>
															<Col sm={1}></Col>
														</Row>

														</div>
													 
													</div>
												</div>
											</Col>
										</Row>
									</Col>

									<Col sm={7}>

										<div className="well cartwell">
											<div className="row text-center">
												<div className="col-md-12 " >
													<i className="fa fa-user-circle-o" id="myprofileimage1"></i>
												</div>
											</div>
											<div className="row myprofilerowpadding">
												<Form getApi={this.setFormApi} onSubmit={this.onSubmit} style={{ width: '100%', padding: '10px' }}>
													{({ formApi, formState }) => (
														<div >
															<Row>
																<Col md={6} sm={12} >
																	<Input field="userName" label="Name"
																		name="userName" onChange={this.handleImage} validateOnBlur validate={e => this.validateProperty('userName', e)} readOnly />
																</Col>
																<Col md={6} sm={12} >
																	<Input field="email" name="email" label="Mail" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('email', e)} readOnly />
																</Col>
															</Row>
															<Row>
																<Col md={6} sm={12} >
																	<Input field="phone" name="phone" label="Mobile" onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('phone', e)} readOnly />
																</Col>
															</Row>
															<Textarea field="address1" label="Primary Address" name="address1" validateOnBlur validate={e => this.validateProperty('address1', e)} />


															<Textarea field="address2" label="Secondary Address" name="address2" validateOnBlur validate={e => this.validateProperty('address2', e)} />


															<div className="d-flex justify-content-end">
																<button type="submit" className="btn btn-primary btn-sm">Update</button>
															</div>
														</div>
													)}
												</Form>
											</div>
										</div>

									</Col>

								</Row>

							}

						</Col>


					</Row>



				</Container>



				<div className="container">
					<div className="row">
						<div className="col-md-12">
							{profileData && profileData.length > 0 &&
								<div className="row">
									<div className="col-md-5">

									</div>
									<div className="col-md-7">

									</div>
								</div>
							}
						</div>
					</div>
				</div>
			</Fragment>
		)
	}
}

export default withSnackbar(Details);