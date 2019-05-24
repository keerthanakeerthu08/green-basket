import BreadCrumb from 'components/common/forms/BreadCrumb';
import { Input } from 'components/common/forms/Input';
import { Textarea } from 'components/common/forms/textarea';
import { Form } from 'informed';
import React, { Component, Fragment } from 'react';
import { Col, Row } from 'reactstrap';

export default class ViewDetails extends Component {

    componentDidMount() {
        const { location: { state } } = this.props.props;
        return this.formStateCheck(state.row);
    }

    formStateCheck = async (data) => {
        data.delCharges = data.deliveryCharges
        await this.setState({ data, id: data.contactId });
        try {
            await this.formApi.setValues(data);
        } catch (err) { }
    }

    setFormApi = formApi => {
        this.formApi = formApi;
    };

    render() {
        const breadCrumbItems = {
            title: "View Contact",
            items: [
                { name: "Home", link: "/dashboard" },
                { name: "Contact List", link: "/contact/list" },
                { name: `View Contact`, active: true },
            ]
        };
        return (
            <Fragment>
                <BreadCrumb data={breadCrumbItems} />
                <Form getApi={this.setFormApi}  >
                    {({ formApi, formState }) => (
                        <Row className="form-div">
                            <Col md={3} sm={12} >
                                <Input
                                    field="email" label="Email" name="email" readOnly
                                />
                            </Col>
                            <Col md={3} sm={12} >
                                <Input
                                    field="contactNo" label="Contact No" name="contactNo" readOnly
                                />
                            </Col>
                            <Col md={3} sm={12} >
                                <Input
                                    field="facebook" label="Facebook" name="facebook" readOnly
                                />
                            </Col>
                            <Col md={3} sm={12} >
                                <Input
                                    field="whatsapp" label="Whatsapp" name="whatsapp" readOnly
                                />
                            </Col>
                            <Col md={3} sm={12} >
                                <Input
                                    field="twitter" label="Twitter" name="twitter" readOnly
                                />
                            </Col>
                            <Col md={3} sm={12} >
                                <Input
                                    field="youtube" label="Youtube" name="youtube" readOnly
                                />
                            </Col>
                            <Col md={3} sm={12} >
                                <Input
                                    field="minDelChargeLimit" label="Charge Limit" name="minDelChargeLimit" readOnly
                                />
                            </Col>
                            <Col md={3} sm={12} >
                                <Input
                                    field="delCharges" label="Delivery Charges" name="delCharges" readOnly
                                />
                            </Col>
                            <Col md={3} sm={12} >
                                <Input
                                    field="gstPercentage" label="GST Percentage" name="gstPercentage" readOnly
                                />
                            </Col>
                            <Col md={3} sm={12} >
                                <Input
                                    field="contactStatus" label="Status" name="contactStatus" readOnly
                                />
                            </Col>                            
                            <Col md={12} sm={12} >
                                <Textarea field="address1" label="Primary Address" name="address1" readOnly />
                            </Col>
                            <Col md={12} sm={12} >
                                <Textarea field="address2" label="Secondary Address" name="address2" readOnly />
                            </Col>
                            <Col md={12} sm={12} >
                                <Textarea field="aboutus" label="About Us" name="aboutus" readOnly />
                            </Col>
                            <Col md={12} sm={12} >
                                <Textarea field="terms" label="Terms" name="terms" readOnly />
                            </Col>
                            <Col md={12} sm={12} >
                                <Textarea field="policy" label="Policy" name="policy" readOnly />
                            </Col>
                        </Row>
                    )}
                </Form>
            </Fragment>
        )
    }

}