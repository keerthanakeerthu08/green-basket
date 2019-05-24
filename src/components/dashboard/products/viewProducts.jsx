import 'styles/forms.css';

import BreadCrumb from 'components/common/forms/BreadCrumb';
import { Input } from 'components/common/forms/Input';
import { Textarea } from 'components/common/forms/textarea';
import { Form } from 'informed';
import React, { Fragment, PureComponent } from 'react';
import { Col, Row } from 'reactstrap';

class ViewProductDetails extends PureComponent {
    state = {
        data: {},
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

    render() {
        const { location: { state } } = this.props.props;
        const { productUrl, productName } = this.state
        const breadCrumbItems = {
            title: `${state.cname}`,
            items: [
                { name: 'Home', active: false, link: '/dashboard' },
                { name: "Dashboard", active: false, link: "/dashboard" },
                { name: `${state.cname}`, active: true },

            ]
        };
        return (
            <Fragment>
                <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
                    {({ formApi, formState }) => (
                        <div>
                            <BreadCrumb data={breadCrumbItems} />
                            <h6>{productName}</h6>
                            <Row className="form-div">
                                <Col md={12} sm={12} >
                                    <img className="img-thumbnail" id="output_image" src={productUrl} alt="Orders" style={{ height: "100px" }}></img>
                                </Col>
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
                                        field="deliveredBy" label="Delivery By" name="deliveredBy" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="deliveredTo" label="Delivery To" name="deliveredTo" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="deliveredTime" label="Delivery Time" name="deliveredTime" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="deliveryStatus" label="Delivery Status" name="deliveryStatus" readOnly
                                    />
                                </Col>

                                <Col md={3} sm={12} >
                                    <Input
                                        field="deliveredDate" label="Delivery Date" name="deliveredDate" readOnly
                                    />
                                </Col>
                                <Col md={3} sm={12} >
                                    <Input
                                        field="transactionStatus" label="Transaction Status" name="transactionStatus" readOnly
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

export default ViewProductDetails;