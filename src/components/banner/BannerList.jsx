import BreadCrumb from 'components/common/forms/BreadCrumb';
import _ from 'lodash';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import BootstrapTable from 'react-bootstrap-table-next';
import paginationFactory from 'react-bootstrap-table2-paginator';
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit';
import * as InoIcons from 'react-icons/io';
import { Link } from 'react-router-dom';
import { Button, Col, Row } from 'reactstrap';
import { getJwt } from 'service/authService';
import { BannerDetails, deleteBanners, updateBanners } from 'service/bannerService';

const { SearchBar } = Search;

class BannerList extends PureComponent {

  constructor(props) {
    super(props)
    this.notificationDOMRef = React.createRef();
  }

  state = {
    data: [],
    isTableLoading: true
  }


  componentDidMount = async () => {
    await this.getBanners();
    await this.getUserInfo()
  }

  getBanners = async () => {
    const res = await BannerDetails();
    const { data: { statusCode, data } } = res;
    if (!statusCode)
      return this.setState({ data: [], isTableLoading: false });
    await this.setState({ data, isTableLoading: false });
    await this.initTableData()
  }

  getUserInfo = async () => {
    let res = await getJwt('__info');
    if (res) {
      await this.setState({ userName: res.userName });
    }

  }

  initTableData = async () => {
    const { hideColumns } = this.state;
    const columnHeaders = this.getColumnHeaders(this.props.prefixUrl);
    const columns = getColumns(columnHeaders, hideColumns);
    await this.setState({ columns, columnHeaders, hideColumns })
  }


  getColumnHeaders(prefixUrl = "") { //dynamic headers 
    let allKeys = ["Banner Id", "Banner", "Description", "Status", "actions"];
    let excludeKeys = [];
    let keys = _.filter(allKeys, (v) => !_.includes(excludeKeys, v))
    let def = {
      "Banner Id": { dataField: 'imageId', text: 'Banner Id', sort: true },
      "Banner": { dataField: 'imageURL', text: 'Banner', formatter: imageFormater },
      "Description": { dataField: 'imageDescription', text: 'Description', sort: true },
      "Status": { dataField: 'pstatus', isDummyField: true, text: "Status", formatter: this.statusFormatter },
      "actions": { dataField: 'actions', isDummyField: true, text: "Actions", formatter: this.actionsFormatter }
    }
    return { "keys": keys, "def": def }
  }

  statusFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    if (row.imageStatus === 'A') {
      links.push("Active")
      return <div className="actions">{links.concat(" ")}</div>
    } else {
      links.push("In-Active")
      return <div className="actions">{links.concat(" ")}</div>
    }
  }

  actionsFormatter = (cell, row, rowIndex, formatExtraData) => {
    let links = [];
    if (row.imageStatus === 'A') {
      links.push(<InoIcons.IoMdCreate title="Edit" onClick={() => this.editFun(`/banner/edit`, row)} />)
      links.push(<InoIcons.IoMdTrash title="Delete" onClick={() => this.deleteFun(row)} />)
      return <div className="actions">{links.concat(" ")}</div>
    } else {
      links.push(<InoIcons.IoMdCreate title="Edit" onClick={() => this.editFun(`/banner/edit`, row)} />)
      links.push(<InoIcons.IoIosRedo title="View" onClick={() => this.changeStatus(row)} />)
      return <div className="actions">{links.concat(" ")}</div>
    }
  }

  changeStatus = async (row) => {
    const { userName } = this.state
    await this.setState({ isTableLoading: true })
    let postData = {
      "imgDescription": row.imageDescription,
      "imgUrl": row.imageURL,
      "imgStatus": 'A',
      "imgId": row.imageId,
      "updatedBy": userName
    }
    let response = await updateBanners(postData)
    if (response.data.statusCode === 1) {
      await this.getBanners();
      this.addNotification("Status  " + response.data.data)
      await this.setState({ isTableLoading: false })
    }
  }

  deleteFun = async (row) => {
    await this.setState({ isTableLoading: true })
    let params = `imgId=${row.imageId}`
    let response = await deleteBanners(params)
    if (response.data.statusCode !== 1) return this.addNotification(response.data.data, 'danger')
    if (response.data.statusCode === 1) {
      this.addNotification(response.data.data)
      await this.getBanners();
      await this.setState({ isTableLoading: false })
    }
  }

  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }

  editFun = async (url, row) => {
    let path = url;
    this.props.props.history.push({
      pathname: path,
      state: { row },
      formType: "edit"
    })
  }

  render() {
    const { isTableLoading, data, columns } = this.state;
    const breadCrumbItems = {
      title: "Banner List",
      items: [
        { name: "Home", active: false, link: "/dashboard" },
        { name: "Banner list", active: true },
      ]
    };


    return (
      <Fragment>
        <BreadCrumb data={breadCrumbItems} />  

        <div className="clearfix"> </div>
        {data && columns && !isTableLoading && <ToolkitProvider
          keyField="imageId"
          data={data}
          columns={columns}
          search
        >
          {
            props => (
              <div>
                <Row>
                  <Col sm={10}>
                    <div className="d-flex justify-content-end">
                      <Link to="/banner/upload">
                        <Button size={'sm'} color="primary">
                          + Add Banner
                        </Button>
                      </Link>
                    </div>
                  </Col>
                  <Col sm={2}><SearchBar {...props.searchProps} /></Col>
                </Row>
                <Row>
                  <Col>
                    <div className="table-responsive table-div">
                      <BootstrapTable
                        keyField="imageId"
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

export default withSnackbar(BannerList);


function imageFormater(cell, row, rowIndex, formatExtraData) {
  return <img className="img-thumbnail" src={cell} alt="bannerimg" style={{ height: '50px', width: "50px" }} />
}

function getColumns(columnsHeaders, hideColumns) {
  let columns = []
  const { keys, def } = columnsHeaders;

  _.forEach(keys, (key) => {
    columns.push({ ...def[key], hidden: _.includes(hideColumns, key) })
  })
  return columns;
}