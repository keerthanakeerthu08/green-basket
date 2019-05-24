import 'styles/userstyle.css';

import Feedback from 'components/common/forms/feedlocation';
import Location from 'components/common/forms/location';
import React, { Fragment, PureComponent } from 'react';
import { Link } from 'react-router-dom';
import { getCurrentUser, getJwt } from 'service/authService';
import { getCategories } from 'service/catalogService';
import { getContactList } from 'service/contactService';

import logo from './../../../images/userimages/EFV-Logo.png';

class Footers extends PureComponent {

  state = {
    data: [],
    allCategories: '',
    isLogedIn: false
  }

  componentDidMount = async () => {
    await this.getContactList()
    await this.getCategories();
    await this.getUserInfo();
  }

  getUserInfo = async () => {
    try {
      if (this.stateCheck()) {
        let res = await getJwt('__info');
        const { userRole } = res;
        await this.setState({ isLogedIn: true, userRole });
      }
    }
    catch (err) {
    }
  }

  stateCheck = async () => {
    try {
      let isLogedIn = getCurrentUser();
      return isLogedIn;
    } catch (err) {
      return false;
    }
  }

  getContactList = async () => {
    const res = await getContactList();
    const { data: { statusCode, data } } = res;
    if (!statusCode)
      return this.setState({ data: [], isTableLoading: false });
    await this.setState({ data, isTableLoading: false })
  }

  displaycategories = []
  getCategories = async () => {
    let res = await getCategories()
    if (res.data.statusCode === 1) {
      await this.setState({ allCategories: res.data.data.slice(0, 5) })
    } else {
    }
  }



  render() {
    const { onClick } = this.props;
    const { data, allCategories, isLogedIn } = this.state;
    return (
      <Fragment>
        {data && data.length > 0 &&

          <div style={{ marginTop: '80px' }}>
            <div className="container">
              <div className="row text-center cartrowpadding2">
                <div className="col-md-4 footercolumnpadding">
                  <img src={logo} className="img-responsive" style={{ width: '100%' }} alt='' />
                </div>
                <div className="col-md-8 text-left">
                  <p id="footerparagraph"> {data[0].aboutus}</p><br />
                </div>
              </div>
            </div>

            <footer id="fooerpadding2" >
              <div className="parallax">
                <div className="container-fluid">

                  <div className="row p-3">
                    <div className="col-sm-3 col-xs-12"><br />
                      <div className="footer-title">
                        <h3 id="h3heading8">Address</h3>
                      </div>
                      <div className="footer-text">
                        <p>Address : {data[0].address1}</p>
                        <p>{data[0].address2}</p>
                        <p>Phone : {data[0].contactNo}</p>
                        <p>Email : <Link to='' id="alinkcolor2" ><u>{data[0].email}</u></Link>
                        </p>
                      </div>
                    </div>
                    <div className="col-sm-2 col-xs-12"><br />
                      <div className="footer-title">
                        <h3 id="h3heading8">Quick Links</h3>
                      </div>
                      <div className="footer-text" style={{ display: 'inline-grid', lineHeight: '2' }}>
                        {allCategories && allCategories.map((pageName) =>
                          <Link to={`/user/${pageName.categoryName.toLowerCase().replace(" ", "-")} `} id="alinkcolor1" onClick={() => onClick(pageName['categoryId'])} exact="true">{pageName.categoryName} </Link>
                        )}
                      </div>
                    </div>
                    <div className="col-sm-2 col-xs-12"><br />
                      <div className="footer-title">
                        <h3 id="h3heading8">Follow Us On</h3>
                      </div>
                      <a href={data[0].facebook}  ><button className="btn btn-default" id="facebookbtn"><i className="fa fa-facebook"></i> Facebook</button></a>
                      <br />
                      <a href={data[0].twitter}><button className="btn btn-default" id="twitterbtn"><i className="fa fa-twitter"></i> Twitter</button></a>
                      <br />
                      <a href={data[0].youtube}  >
                        <button className="btn btn-default" id="youtubebtn"><i className="fa fa-youtube"></i> Youtube</button></a>
                      <br />

                      <a href={data[0].whatsapp} > <button className="btn btn-default" id="whatsappbtn"><i className="fa fa-whatsapp"></i> Whatsapp</button></a>
                    </div>

                    <div className="col-sm-5">
                      <iframe title="google map ds" src="https://www.google.com/maps/d/u/0/embed?mid=1j9RW9uP2DgykH15H9J9sKwRU_5T2BtLA" frameborder="0" allowfullscreen style={{ width: "100%", height: "100%" }} ></iframe>
                    </div>
                  </div>

                  <div className="row text-center">
                    <div className="col-md-12">
                      <p id="paragraph5">&copy; 2019, Designed And Maintained by <a href="http://www.prematix.com" rel="noopener norefferrer" > Prematix Software Solution Pvt. Ltd.</a></p>
                    </div>
                  </div>
                </div>

              </div>
            </footer>
          </div>
        }
        {isLogedIn && <Feedback />}
        <Location />
      </Fragment>
    )
  }
}

export default Footers;