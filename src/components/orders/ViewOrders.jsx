import 'rc-datetime-picker/dist/picker.min.css';
import 'styles/table.css';

import BreadCrumb from 'components/common/forms/BreadCrumb';
import { CustomSelect } from 'components/common/forms/custom-select';
import { Input } from 'components/common/forms/Input';
import { Textarea } from 'components/common/forms/textarea';
import { Form } from 'informed';
import moment from 'moment';
import { withSnackbar } from 'notistack';
import { DatetimePickerTrigger } from 'rc-datetime-picker';
import React, { Fragment, PureComponent } from 'react';
import { Col, Row } from 'reactstrap';

import { updateOrders } from '../../service/ordersService';



class ViewOrders extends PureComponent {

    constructor(props) {
        super(props)
        this.notificationDOMRef = React.createRef();
    }

    state = {
        productUrl: '',
        status: [{ id: "Y", name: "Active" }, { id: "N", name: "InActive" }],
        moment: moment(),
        deliveredTime: moment().add(1, 'hours').format('YYYY-MM-DD HH:mm'),
    }

    componentDidMount() {
        const { location: { state } } = this.props.props;
        return this.formStateCheck(state.row);
    }

    formStateCheck = async (data) => {
        await this.setState({ data, productUrl: data.productUrl, productName: data.productName });
        try {
            await this.formApi.setValues(data);
        } catch (err) { }
    }

    setFormApi = formApi => {
        this.formApi = formApi;
    };

    handleChange = async ({ currentTarget: Input }) => {
        const { name, value } = Input;
        const { data } = this.state;
        data[name] = value;
        await this.setState({
            [name]: value
        })
    }

    deliveryDateTime = async (moment) => {
        this.setState({ deliveredTime: moment.format('YYYY-MM-DD HH:mm') });
        await this.formApi.setValue("deliveredTime", moment.format('YYYY-MM-DD HH:mm'))
    }

    onSubmit = async () => {
        let response;
        const data = this.formApi.getState().values;
        const { productUrl } = this.state
        data['productUrl'] = productUrl
        let Data = {
            "deliveryStatus": data.deliveryStatus,
            "deliveredTime": data.deliveredTime,
            "deliveredBy": data.deliveredBy,
            "deliveredTo": data.deliveredTo,
            "userId": data.userId,
            "orderId": data.orderId,
        }
        response = await updateOrders(Data)
        if (response.data.statusCode !== 1) return this.addNotification(response.data.message, "warning")
        if (response.data.statusCode === 1) {
            this.addNotification(response.data.message)
            this.redirectTo()
        }
    }

    redirectTo = async () => {
        let path = `/orders/order-list`
        this.props.props.history.push({
            pathname: path,
        })
    }

    addNotification = (message, variant = "success") => {
        const { enqueueSnackbar } = this.props
        const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
        enqueueSnackbar(message, options)
    }

    render() {
        const { productUrl, productName, deliveredTime } = this.state
        const breadCrumbItems = {
            title: 'Order Views',
            items: [
                { name: 'Home', active: false, link: '/dashboard' },
                { name: 'Order List', active: false, link: '/orders/order-list' },
                { name: 'Order Views', active: true },
            ]
        };

        return (
            <Fragment>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
                    {({ formApi, formState }) => (
                        <div>
                            <BreadCrumb data={breadCrumbItems} />
                             <h5>{productName}</h5>
                            <br />
                            <h6>Update Order</h6>
                            <Row className="form-div">
                                <Col md={2} sm={12} >
                                    <img className="img-thumbnail" id="output_image" src={productUrl} alt="Orders" style={{ height: "100px" }}></img>
                                </Col>
                                <Col md={2} sm={12} >
                                    <Input
                                        field="deliveredBy" label="Delivery By" name="deliveredBy"
                                    />
                                </Col>
                                <Col md={2} sm={12} >
                                    <Input
                                        field="deliveredTo" label="Delivery To" name="deliveredTo"
                                    />
                                </Col>
                                <Col md={2} sm={12} >
                                    <DatetimePickerTrigger
                                        moment={moment(deliveredTime)}
                                        onChange={this.deliveryDateTime}>
                                        <Input field="deliveredTime" label="Delivery Time" name="deliveredTime" />
                                    </DatetimePickerTrigger>
                                </Col>
                                <Col md={2} sm={12} >
                                    <CustomSelect field="deliveryStatus" label="Delivery Status" name="deliveryStatus" getOptionValue={option => option.id} getOptionLabel={option => option.name} options={this.state.status} onChange={this.handleChange}
                                    />
                                </Col>
                                <div style={{ margin: "27px" }}>
                                    <div className="d-flex justify-content-end">
                                        <button type="submit" className="btn btn-primary btn-sm">Submit</button>
                                    </div>
                                </div>

                            </Row>
                            <h6>Order Details</h6>
                            <Row className="form-div">
                                <Col md={3} sm={12}>
                                    <Input
                                        field="categoryId" label="Category Id" name="categoryId" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="categoryName" label="Category Name" name="categoryName" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="productId" label="Product Id" name="productId" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="productName" label="Product Name" name="productName" readOnly
                                    />
                                </Col>

                                <Col md={3} sm={12} >
                                    <Input
                                        field="orderId" label="Order Id" name="orderId" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="noOfOrder" label="NoOf Order" name="noOfOrder" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="orderDate" label="Order Date" name="orderDate" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="quantity" label="Quantity" name="quantity" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="totalAmount" label="Total Amount" name="totalAmount" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="sellingPrice" label="Selling Price" name="sellingPrice" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="gstAmount" label="Gst Amount" name="gstAmount" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="gstPercentage" label="Gst Percentage" name="gstPercentage" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="shippingCharge" label="Shipping Charge" name="shippingCharge" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="netAmount" label="Net Amount" name="netAmount" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="specialOffer" label="Special Offer" name="specialOffer" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="paymentMode" label="Payment Mode" name="paymentMode" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="transactionStatus" label="Transaction Status" name="transactionStatus" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="deliveredDate" label="Delivery Date" name="deliveredDate" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="stdDeliveryTime" label="StdDeliveryTime" name="stdDeliveryTime" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="preferedDeliveryTime" label="PreferedDelivery Time" name="preferedDeliveryTime" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="city" label="City" name="city" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="pincode" label="Pincode" name="pincode" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="cancellation" label="Cancellation" name="cancellation" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="cancellationReason" label="Cancellation Reason" name="cancellationReason" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="failureReason" label="Failure Reason" name="failureReason" readOnly
                                    />
                                </Col>
                                <Col md={12} sm={12} >
                                    <Textarea field="address" label="Address" name="address" readOnly />
                                </Col>
                            </Row>

                        </div>
                    )}
                </Form>
            </Fragment>
        )
    }
}

export default withSnackbar(ViewOrders)