import 'styles/style.css';

import CanvasJSReact from 'assets/canvasjs.react';
import BreadCrumb from 'components/common/forms/BreadCrumb';
import DashBox from 'components/common/forms/DashBox';
import _ from 'lodash';
import React, { Fragment, PureComponent } from 'react';
import * as IonIcons from 'react-icons/io';
import { Col, Row } from 'reactstrap';
import { getJwt } from 'service/authService';
import { getCategoryList, getDeliveryDetails, getToptenValues } from 'service/dashboardService';
import { getAllOrders } from 'service/ordersService';

var CanvasJSChart = CanvasJSReact.CanvasJSChart;
var CanvasJS = CanvasJSReact.CanvasJS;

class Dashboard extends PureComponent {

  state = {
    isAdmin: false,
    data: [],
    categoryName: [],
  }

  componentDidMount = async () => {
    this.checkUserRule();
    this.getCategoryList();
    this.getDeliveryDetails();
    this.getToptenValues();
    this.getOrederDetails();
  }

  checkUserRule = async () => {
    try {
      let res = await getJwt('__info');
      const { userRole } = res;
      switch (userRole) {
        case 'A':
        case 'S':
          await this.setState({ isAdmin: true });
          break
        case 'D':
          await this.setState({ isAdmin: false });
          break
        default:
          await this.setState({ isAdmin: false });
          break
      }
    }
    catch (err) {
    }
  }

  getCategoryList = async () => {
    let res = await getCategoryList(), data = [];
    if (res.data.statusCode === 1) {
      data = res.data.data
      await this.setState({
        categoryName: data
      })
    }
  }

  getDeliveryDetails = async () => {
    let res = await getDeliveryDetails();
    if (res.data) {
      await this.setState({
        deliveredCount: res.data.deliveredCount,
        pendingCount: res.data.pendingCount,
        deliveryCounts: res.data
      })
    }
  }

  getToptenValues = async () => {
    let res = await getToptenValues(), data;
    data = res.data.data
    await this.setState({
      topTenProducts: data,
    })
  }

  getOrederDetails = async () => {
    const res = await getAllOrders();
    const { data: { statusCode, data } } = res;
    if (!statusCode)
      return this.setState({ data: [] })
    let completedProducts = await _.filter(data, v => v["deliveryStatus"] === 'Y');
    let inProgressProducts = await _.filter(data, v => v["deliveryStatus"] === 'N');
    await this.setState({ completedProducts: completedProducts, inProgressProducts: inProgressProducts })
  }

  addSymbols(e) {
    var suffixes = ["", "K", "M", "B"];
    var order = Math.max(Math.floor(Math.log(e.value) / Math.log(1000)), 0);
    if (order > suffixes.length - 1)
      order = suffixes.length - 1;
    var suffix = suffixes[order];
    return CanvasJS.formatNumber(e.value / Math.pow(1000, order)) + suffix;
  }

  render() {
    let dps = []; let price = [];
    const breadCrumbItems = {
      title: 'Dashboard',
      items: [
        { name: 'Home', active: false, link: '/' },
        { name: 'Dashboard', active: true },
      ]
    };
    const { categoryName, deliveredCount, pendingCount, topTenProducts, deliveryCounts, completedProducts, inProgressProducts, isAdmin } = this.state;
    topTenProducts && topTenProducts.map((c) => {
      dps.push({ y: c.productQuantity, label: c.productName })
     return price.push({ y: c.mrp, label: c.productName })
    })
    const Quantityoptions = {
      animationEnabled: true,
      theme: "light2",
      title: {
      },
      axisX: {
        title: "Products",
        reversed: true,
      },
      axisY: {
        title: "Quantity",
        labelFormatter: this.addSymbols
      },
      data: [{
        type: "bar",
        dataPoints: dps
      }]
    }
    const Priceoptions = {
      exportEnabled: true,
      animationEnabled: true,
      title: {
      },
      data: [{
        type: "pie",
        startAngle: 25,
        toolTipContent: "<b>{label}</b>: {y} Rs",
        indexLabelFontSize: 12,
        indexLabel: "{label} - {y} Rs",
        dataPoints: price
      }]
    }
    return (
      <Fragment>
        <BreadCrumb data={breadCrumbItems} />
        {isAdmin && categoryName && <h6>Categories List</h6>}
        {isAdmin && <Row>
          <div className="categoryDiv ">
            {categoryName && categoryName.map((c, i) =>
              <DashBox bgClass="fst-div" topic={c.categoryName} value={c.productCount} icon={<IonIcons.IoMdCube />} props={this.props} id={c.categoryId} cname={c.categoryName} path={`/dashboard/product-details`} name={"product-details"} />
            )}
          </div>
        </Row>
        }
        <br />
        {deliveryCounts && <h6>Orders Statistics</h6>}
        <Row>
          {deliveryCounts &&
            <Col md={4} sm={12}>
              <DashBox bgClass="trd-div" topic="Completed" value={deliveredCount} icon={<IonIcons.IoMdDoneAll />} props={this.props} name={"product-status"} path={`/dashboard/product-status`} data={completedProducts} cname={"Order Delivered"} />
            </Col>}
          {deliveryCounts &&
            <Col md={4} sm={12}>
              <DashBox bgClass="snd-div" topic="Pending" value={pendingCount} icon={<IonIcons.IoIosTime />} props={this.props} name={"product-status"} path={`/dashboard/product-status`} data={inProgressProducts} cname={"Pending Orders"} />
            </Col>}
        </Row>
        <br />
        {isAdmin && topTenProducts && <h6>Product Details</h6>}
        {isAdmin && <Row>
          <Col sm={6}>
            {topTenProducts && <CanvasJSChart options={Quantityoptions} />}
          </Col>
          <Col sm={1}></Col>
          <Col sm={5}>
            {topTenProducts && <CanvasJSChart options={Priceoptions} />}
          </Col>
        </Row>
        }
      </Fragment>
    )
  }
}

export default Dashboard;

