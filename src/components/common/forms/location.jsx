import 'styles/nav.css';

import { Form } from 'informed';
import _ from 'lodash';
import React, { Fragment, PureComponent } from 'react';
import Geocode from 'react-geocode';
import { geolocated } from 'react-geolocated';
import * as IonIcons from 'react-icons/io';
import * as MdnIcons from 'react-icons/md';
import Modal from 'react-responsive-modal';
import ToggleDisplay from 'react-toggle-display';
import { Input } from 'reactstrap';

import { getLocation } from '../../../service/location';

Geocode.setApiKey("AIzaSyB6w_WDy6psJ5HPX15Me1-o6CkS5jTYWnE");
// AIzaSyAumbBL5eMbPkJSq9ZgEHKksAk4kGsw_bM
// AIzaSyB6w_WDy6psJ5HPX15Me1-o6CkS5jTYWnE  =-> old
Geocode.enableDebug();


class Location extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      isHidden: true,
      isSubmitted: false,
      locations: [],
      configName: '',
      currentPin: '',
      currentAddress: '',
      errorMsg: ''
    };
  }

  componentDidMount = async () => {
    let res = await getLocation()
    if (res.data.statusCode === 1) {
      const { data } = res.data
      const locations = _.uniq(_.map(data, v => v.configValue))
      await this.setState({ locations })
    }
    await this.addressFinder()
  }

  onOpenModal = () => {
    this.setState({ open: true });
  };

  onCloseModal = () => {
    this.setState({ open: false });
  };

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    await this.setState({ [name]: value })
  }

  setAddress = async () => {
    await this.setState(state => ({ configName: state.currentAddress }))
  }

  onSubmit = async () => {
    await this.setState({ isSubmitted: true })
    await this.fromAddress();
  }

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  addressFinder = async () => {
    const { isGeolocationAvailable, isGeolocationEnabled, coords } = this.props;
    let errorMsg = '';
    if (!isGeolocationAvailable)
      errorMsg = "Your browser does not support Geolocation";
    else if (!isGeolocationEnabled)
      errorMsg = "Geolocation is not enabled";
    else if (coords)
      errorMsg = "Geolocation is not enabled";
    await this.setState({ errorMsg, isHidden: false })
    if (coords) {
      const { latitude, longitude } = coords;
      this.fromLatLng(latitude, longitude)
    }
  }

  fromLatLng = async (lat, lan) => {
    try {
      await Geocode.fromLatLng(lat, lan)
        .then(async response => { 
          const { address_components, formatted_address } = response.results[0];
          const arrlength = address_components.length - 1;
          await this.setState({ currentAddress: formatted_address, currentPin: address_components[arrlength].long_name });
          await this.addressFormater(response.results[0]);
        })
        .catch(async error => {
          await this.setState({ errorMsg: error.message, isHidden: false }); 
        });
    } catch (err) { 
    }

  }

  fromAddress = async () => {
    const { configName } = this.state;
    try {
      await Geocode.fromAddress(configName)
        .then(async response => { 
          await this.addressFormater(response.results[0])
        }).catch(async error => {
          await this.setState({ errorMsg: error.message, isHidden: false }); 
        });
    } catch (err) {
    }
  }

  addressFormater = async (data) => {
    const { isSubmitted } = this.state;
    const { address_components, formatted_address } = data
    const arrlength = address_components.length - 1;
    const configName = formatted_address;
    const currentPin = address_components[arrlength].long_name;
    await this.setState({ configName, currentPin, isHidden: true });
    if (isSubmitted) return this.availabilityCheck();
  }

  availabilityCheck = async () => {
    const { currentPin, locations } = this.state;
    if (!_.includes(locations, currentPin)) return await this.setState({ errorMsg: "Delivery not available at this location", isHidden: false });
    await this.setState({ isHidden: true})
  }


  render() {
    const { open, errorMsg, isHidden, configName } = this.state;
    return (
      <Fragment>
        <div id="mybutton1" >
          <MdnIcons.MdLocationOn onClick={this.onOpenModal} class="chooselocation" />
        </div>
        {/*modal for choose location */}
        <div>
          <Modal open={open} onClose={this.onCloseModal} center>
            <MdnIcons.MdLocationOn style={{ fontSize: "1.5rem" }} className="text-success" /> Choose Location

            <Form name="myForm" getApi={this.setFormApi} onSubmit={this.onSubmit}>
              {({ formApi, formState }) => (
                <div><br />
                  <div class="col-lg-12 col-md-12 col-xs-12">
                    <div class="form-group">
                      <Input type="text" value={configName} name="configName" field="configName" required onChange={this.handleChange} ></Input>
                    </div>

                  </div>
                  <div id="togglediv">
                    <ToggleDisplay show={!isHidden}>  {errorMsg} </ToggleDisplay>
                    {isHidden && configName !== "" && <span className="text-success">Delivery available</span>}
                    <p onClick={this.setAddress} style={{ fontWeight: 500, color: "#007bff", textAlign: "right", cursor: "pointer" }}> <IonIcons.IoMdLocate />  Pick my location</p>
                  </div>
                  <div id="submitbtnpadding">
                    <button type="submit" id="submitbtn" class="btn btn-common btn-form-submit"  >Submit</button>
                  </div>

                </div>)}
            </Form>
          </Modal>
        </div>
      </Fragment >
    )
  }
}


export default geolocated({
  positionOptions: {
    enableHighAccuracy: true,
  },
  userDecisionTimeout: 5000,
})(Location);