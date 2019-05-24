import 'styles/table.css';

import BreadCrumb from 'components/common/forms/BreadCrumb';
import _ from 'lodash';
import React, { Fragment, PureComponent } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import * as InoIcons from 'react-icons/io';
import { Col, Row } from 'reactstrap';

import { getCategorybyId } from '../../../service/dashboardService';

const { SearchBar } = Search;

export default class ProductDetails extends PureComponent {

    state = {
        data: [],
        isTableLoading: true
    }

    componentDidMount = async () => {
        const { match: { params: { pageName } } } = this.props.props;
        if (pageName === "product-details") {
            await this.getProductDetails();
        } else {
            await this.productDeliveryStauts();
        }
    }
    productDeliveryStauts = async () => {
        const { location: { state } } = this.props.props;
        await this.setState({ data: state.data, cname: state.cname })
        await this.initTableData()
    }

    getProductDetails = async () => {
        const { location: { state } } = this.props.props;
        let id = state.id, response, params;
        params = `categoryId=${id}`
        response = await getCategorybyId(params)
        const { data: { statusCode, data } } = response;
        if (statusCode === 0)
            return this.setState({ data: [], isTableLoading: false });
        await this.setState({ data, isTableLoading: false, cname: state.cname })
        await this.initTableData()
    }

    initTableData = async () => {
        const { hideColumns } = this.state;
        const columnHeaders = this.getColumnHeaders(this.props.prefixUrl);
        const columns = getColumns(columnHeaders, hideColumns);
        await this.setState({ columns, columnHeaders, hideColumns })
    }

    getColumnHeaders(prefixUrl = "") {
        const { match: { params: { pageName } }, location: { state: { cname } } } = this.props.props;
        let allKeys = ["Order Id", "User Name", "Product Id", "Product Name", "Quantity", "Price", "Address", "OrderDate&Time", "DeliveredDate", "Product Status", "Actions"];
        let excludeKeys = [];
        switch (pageName) {
            case "product-details":
                excludeKeys = ["Order Id", "User Name", "Actions", "OrderId", "Quantity", "Price", "Address", "OrderDate&Time", "DeliveredDate",]
                break;
            case "product-status":
                excludeKeys = ["Product Status", "Product Id"]
                break;
            default:
                break;
        }
        if (pageName === "product-status") {
            if (cname === "Pending Orders") {
                excludeKeys.push("DeliveredDate")
            }
        }
        let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
        let def = {
            "Order Id": { dataField: 'orderId', text: 'Order Id ', sort: true, },
            "User Name": { dataField: 'deliveredTo', text: 'User Name ', sort: true, },
            "Product Id": { dataField: 'productId', text: 'Product Id ', sort: true, },
            "Product Name": { dataField: 'productName', text: 'Product Name ', sort: true, },
            "Quantity": { dataField: 'quantity', text: 'Quantity', sort: true, },
            "Price": { dataField: 'totalAmount', text: 'Price', sort: true, },
            "Address": { dataField: 'address', text: 'Address', sort: true, },
            "OrderDate&Time": { dataField: 'orderDate', text: 'OrderDate&Time', sort: true, },
            "DeliveredDate": { dataField: 'deliveredDate', text: 'DeliveredDate', sort: true, },
            "Product Status": { dataField: 'pstatus', isDummyField: true, text: "Product Status", formatter: this.statusFormatter },
            "Actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
        }
        return { "keys": keys, "def": def }
    }

    statusFormatter = (cell, row, rowIndex, formatExtraData) => {
        let links = [];
        if (row.productStatus === 'A') {
            links.push("Active")
            return <div className="actions">{links.concat(" ")}</div>
        } else {
            links.push("In-Active")
            return <div className="actions">{links.concat(" ")}</div>
        }
    }

    actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
        let links = [];
        links.push(<InoIcons.IoIosEye title="View" onClick={() => this.viewFun(`/dashboard/view-product-status`, row)} />)
        return <div className="actions">{links.concat(" ")}</div>
    }

    viewFun = async (url, row) => {
        const { location: { state } } = this.props.props;
        let path = url;
        this.props.props.history.push({
            pathname: path,
            state: { row, cname: state.cname },
        })
    }

    render() {
        const { data, columns, cname } = this.state;
        const breadCrumbItems = {
            title: `${cname}`,
            items: [
                { name: "Home", active: false, link: "/dashboard" },
                { name: "Dashboard", active: false, link: "/dashboard" },
                { name: `${cname}`, active: true },
            ]
        };

        return (
            <Fragment>
                {cname && <BreadCrumb data={breadCrumbItems} />}
                <Row>
                    <Col>
                    </Col>
                </Row>
                <div className="clearfix"></div>
                {data && columns && <ToolkitProvider
                    keyField="id"
                    data={data}
                    columns={columns}
                    search
                >
                    {
                        props => (
                            <div>
                                <Row>
                                    <Col sm={10}></Col>
                                    <Col sm={2}><SearchBar {...props.searchProps} /></Col>
                                </Row>
                                <Row>
                                    <Col>
                                        <div className="table-responsive table-div">
                                            <BootstrapTable
                                                keyField="id"
                                                data={data}
                                                columns={columns}
                                                {...props.baseProps}
                                                bootstrap4
                                                pagination={paginationFactory()} striped hover condensed
                                                classes="table table-bordered table-hover table-sm"
                                                wrapperClasses="table-responsive"
                                                noDataIndication={'No data to display here'}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        )
                    }
                </ToolkitProvider>
                }
            </Fragment>
        )
    }
}

function getColumns(columnsHeaders, hideColumns) {
    let columns = []
    const { keys, def } = columnsHeaders;

    _.forEach(keys, (key) => {
        columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
    })
    return columns;
}


