import 'styles/forms.css';

import { post } from 'axios';
import BreadCrumb from 'components/common/forms/BreadCrumb';
import { CustomSelect } from 'components/common/forms/custom-select';
import { Input } from 'components/common/forms/Input';
import { Textarea } from 'components/common/forms/textarea';
import img1 from 'images/2.svg';
import { Form } from 'informed';
import Joi from 'joi-browser';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import { Col, Row } from 'reactstrap';
import { getJwt } from 'service/authService';
import { addBanners, updateBanners } from 'service/bannerService';

import { apiUrl } from './../../../config.json';

class AddBanner extends PureComponent {

	constructor(props) {
		super(props)
		this.notificationDOMRef = React.createRef();
	}

	state = {
		data: {},
		img1: img1,
		editVal: false,
		Status: [{ id: "A", name: "Active" }, { id: "D", name: "InActive" }],
		isImage: true,
	}

	validateProperty = (name, value) => {
		const schema = Joi.reach(Joi.object(this.schema), name)
		const { error } = Joi.validate(value, schema);
		return error ? error.details[0].message : null;
	};

	schema = {
		imgUrl: Joi.string().required().label("Banner Image"),
		imageStatus: Joi.string().required().label("Image Status"),
	};

	async componentDidMount() {
		this.getUserInfo()
		const { params: { pageName } } = this.props.props.props.match
		if (pageName === "edit") {
			await this.setState({ editVal: true })
			const { location: { state } } = this.props.props.props;
			return this.formStateCheck(state.row);
		}
	}

	formStateCheck = async (data) => {
		data["imgUrl"] = data.imageURL;
		await this.setState({ data, imageId: data.imageId, imgUrl: data.imageURL, image: data.imageURL });
		try {
			await this.formApi.setValues(data);
		} catch (err) {
		}
	}

	getUserInfo = async () => {
		let res = await getJwt('__info');
		const { uid } = res;
		await this.setState({ uid: uid, userInfo: res, userName: res.userName });
	}

	optionSchema = {
		label: Joi.string().empty('').optional(),
		value: Joi.any().optional()
	}

	handleImage = async (e) => {
		let imgUrl = await this.fileUpload(e.target.files[0]);
		const data = this.formApi.getState().values;
		data['imgUrl'] = imgUrl.data.data;
		await this.formApi.setValues(data);
		await this.setState({ image: imgUrl.data.data, isImage: true })
		// var reader = new FileReader();
		// reader.onload = function () {
		// 	var output = document.getElementById('output_image');
		// 	output.src = reader.result;
		// }
		// reader.readAsDataURL(this.state.image);
	}

	fileUpload(file) {
		const url = `${apiUrl}/uploadImage`;
		const formData = new FormData();
		formData.append('image', file)
		const config = {
			headers: {
				'content-type': 'multipart/form-data'
			}
		}
		return post(url, formData, config)
	}
 
	handleChange = async ({ currentTarget: Input }) => {
		const { name, value } = Input;
		const { data } = this.state;
		data[name] = value;
		await this.setState({
			[name]: value
		})
	}

	onSubmit = async () => {
		const { userName } = this.state;
		let res = ''
		const { params: { pageName } } = this.props.props.props.match
		if (pageName === 'upload') {
			const data = this.formApi.getState().values;
			let postData = {
				"imgDescription": data.imageDescription,
				"imgUrl": data.imgUrl,
				"imgStatus": data.imageStatus,
				"updatedBy": userName
			}
			res = await addBanners(postData)
			if (res.data.statusCode === 1) {
				this.addNotification(res.data.message)
				this.resetForm()
			}

		} else if (pageName === 'edit') {
			const data = this.formApi.getState().values;
			let postData = {
				"imgDescription": data.imageDescription,
				"imgUrl": data.imgUrl,
				"imgStatus": data.imageStatus,
				"imgId": this.state.imageId,
				"updatedBy": userName
			}
			res = await updateBanners(postData)
			if (res.data.statusCode === 1) {
				this.addNotification(res.data.data)
				this.resetForm()
			}
		}
	}

	addNotification = (message, variant = "success") => {
		const { enqueueSnackbar } = this.props
		const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
		enqueueSnackbar(message, options)
	}

	setFormApi = (formApi) => {
		this.formApi = formApi;
	}

	resetForm = async () => {
		const { params: { pageName } } = this.props.props.props.match
		this.formApi.reset();
		this.setState({ isImage: false })
		if (pageName === 'edit') {
			setTimeout(() => {
				this.props.props.props.history.push(`/banner/list`)
			}, 3000);
		}

	}

	render() {
		const { params: { pageName } } = this.props.props.props.match
		const breadCrumbItems = {
			title: " Upload Banner",
			items: [
				{ name: "Home", link: "/dashboard" },
				{ name: "Banner List", link: "/banner/list" },
				{ name: `Upload Banner `, active: true },
			]
		};
		const { isImage, image } = this.state
		return (
			<Fragment>
				<Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
					{({ formApi, formState }) => (
						<div>
							<BreadCrumb data={breadCrumbItems} />
							<Row className="form-div">
								<Col md={3} sm={12} >
									<Input field="img" type="file" multiple label="Banner Image"
										name="img" onChange={this.handleImage} />
								</Col>
								{pageName === 'edit' && <Col md={6} sm={12} >
									<Input field="imgUrl" label="Banner Image Url"
										name="imgUrl" readOnly validateOnBlur validate={e => this.validateProperty('imgUrl', e)}
									/>
								</Col>}
								<Col md={3} sm={12} >
									<CustomSelect field="imageStatus" label="Status" name="imageStatus" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.Status} onChange={this.handleChange} validateOnBlur validate={e => this.validateProperty('imageStatus', e)} />
								</Col>
								<Col md={12} sm={12}>
									<Textarea field="imageDescription" label="Banner Description" name="imgDescription" onChange={this.handleChange} />
								</Col>
								{pageName === "edit" && <Col>
									<h6>Preview Image</h6>
									<img className="img-thumbnail" src={image} alt=""></img>
								</Col>}
								{pageName === "upload" && image && isImage &&
									<Col>
										<h6>Preview Image</h6>
										<img className="img-thumbnail" src={image} alt=""></img>
									</Col>}
							</Row>
							<div className="d-flex justify-content-end">
								<button type="button" className="btn btn-warning btn-sm mr-3" id="cancelbtn" onClick={() => this.resetForm()}>Cancel</button>
								<button type="submit" className="btn btn-primary btn-sm">Submit</button>
							</div>
						</div>
					)}
				</Form>
			</Fragment>
		)
	}
}

export default withSnackbar(AddBanner);