import _ from 'lodash';
import React, { Fragment, PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { Breadcrumb, BreadcrumbItem, Col, Row } from 'reactstrap';

class BreadCrumb extends PureComponent {

  state = {
    data: {}
  }

  componentDidMount = async () => {
    await this.init();
  }
  componentWillReceiveProps = async () => {
    await this.init();
  }

  init = async () => {
    const { data } = this.props;
    await this.setState({ data })
  }

  itemsForm = () => {
    const { data: { items } } = this.state;
    return _.map(items, (v, i) => {
      if (!v['active'])
        return <BreadcrumbItem key={i} ><Link to={v['link']}>{v["name"]}</Link></BreadcrumbItem>
      return <BreadcrumbItem active key={i}>{v['name']}</BreadcrumbItem>
    })
  }

  render() {
    const { data: { title } } = this.state;
    return (
      <Fragment>
        <Row>
          <Col className=" p-0">
            <div className="breadcrumb-set">
              <p className="page-title">{title}</p>
              <Breadcrumb className="title-bar"> {this.itemsForm()} </Breadcrumb>
            </div>
          </Col>
        </Row>
      </Fragment>
    )
  }
}

export default BreadCrumb;

