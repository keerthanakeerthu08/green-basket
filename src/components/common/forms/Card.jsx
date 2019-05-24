import 'styles/style.css';

import React, { Fragment, PureComponent } from 'react';
import * as FaIcons from 'react-icons/fa';

class Card extends PureComponent {
  render() {
    const { prodname, fixprice, offerprice, prodcount, imgsource, children } = this.props;
    return (
      <Fragment>
        <div className="text-center">
          <div className="card">
            <img src={imgsource} className="imgsource" alt="prductImage" id="cardimage" />
            <div className="cardcontainerpadding">
              <div className="row text-center">
                <div className="col-md-12">
                  <span className="prodname" id="paragraph2">{prodname}</span>
                </div>
              </div>
              <div className="row text-center rowpadding1">
                <div className="col-md-12">
                  <span id="showrupeecolor" className="fixprice"> <FaIcons.FaRupeeSign /> {fixprice}</span>
                  <span id="hiderupeecolor" className="offerprice"><i class="fa fa-rupee"></i> {offerprice}</span>
                  <span id="gmscolor" className="prodcount"> {prodcount}</span>
                </div>
              </div>
            </div>
            {children}
          </div>
        </div>
      </Fragment>
    )
  }
}

export default Card;