import 'styles/nav.css';

import { Textarea } from 'components/common/forms/textarea';
import { Form } from 'informed';
import { withSnackbar } from 'notistack';
import React, { Fragment, PureComponent } from 'react';
import * as MdnIcons from 'react-icons/md';
import Modal from 'react-responsive-modal';
import StarRatingComponent from 'react-star-rating-component';
import { getJwt } from 'service/authService';

import feedbackimage from '../../../images/newfeedback.svg';
import { addFeedback } from '../../../service/feedback';

class Feedback extends PureComponent {


  state = {
    open: false,
    open1: false,
    userRating: 3,
    info: "Average"
  };

  componentDidMount = async () => {
    await this.getUserInfo();
  }

  getUserInfo = async () => {
    let res = await getJwt('__info');
    if (res) {
      const { uid } = res;
      await this.setState({ uid: uid, });
    }
  }



  onStarClick = async (nextValue, prevValue, name) => {
    await this.starValChange(nextValue)
  }

  starValChange = async (userRating) => {
    let info = 'Average';
    switch (userRating) {
      case 1:
        info = "Poor";
        break;
      case 2:
        info = "Met Expectation";
        break;
      case 4:
        info = "Good";
        break;
      case 5:
        info = "Excelent";
        break;
      default:
        info = "Average";
        break;
    }
    await this.setState({ info, userRating });
  }


  onOpenModal = () => {
    this.setState({ open: true });
  };

  onCloseModal = () => {
    this.setState({ open: false });
  };

  onOpenModal1 = () => {
    this.setState({ open1: true });
  };

  onCloseModal1 = () => {
    this.setState({ open1: false });
  };

  setFormApi = (formApi) => {
    this.formApi = formApi;
  }

  onSubmit = async () => {
    let res;
    const data = this.formApi.getState().values;
    const { userRating, uid } = this.state;
    if (this.state.userRating !== 0 && this.state.uid !== '' && data.comments !== undefined) {
      let postData = {
        "userId": uid,
        "userRating": userRating,
        "comments": data.comments
      }
      res = await addFeedback(postData)
      if (res.data.statusCode === 1) {
        await this.addNotification(res.data.message)
        await this.resetForm()
      }
      else
        await this.addNotification(res.data.message)
    } else {
      await this.addNotification("Please Fill the Details", "danger")
    }

  }

  resetForm = async () => {
    this.formApi.reset()
    this.setState({ userRating: '' })
  }

  handleChange = async ({ currentTarget: Input }) => {
    const { name, value } = Input;
    const { data } = this.state;
    data[name] = value;
    await this.setState({
      [name]: value
    })
  }

  addNotification = (message, variant = "success") => {
    const { enqueueSnackbar } = this.props
    const options = { variant, anchorOrigin: { vertical: "bottom", horizontal: "center", autoHideDuration: 1000 } };
    enqueueSnackbar(message, options)
  }


  render() {
    const { open, userRating, info } = this.state;
    return (
      <Fragment>
        <div id="mybutton">
          <MdnIcons.MdFeedback class="feedback" onClick={this.onOpenModal} />
        </div>
        <div>
          <Modal open={open} onClose={this.onCloseModal} center>
            <img src={feedbackimage} width={20} height={21} alt="Feedback" />  Feedback
          <Form getApi={this.setFormApi} onSubmit={this.onSubmit}>
              {({ formApi, formState }) => (
                <div>
                  <br />
                  <div class="col-lg-12 col-md-12 col-xs-12">
                    <div class="form-group text-center">
                      <label className={info} style={{ fontSize: "1.5rem" }}>{info}</label><br></br>
                      <StarRatingComponent id="starpadding" field="userRating" name="userRating"
                        starCount={5}
                        value={userRating}
                        onStarClick={this.onStarClick}
                        className={info}
                      />
                      <div class="help-block with-errors"></div>
                    </div>
                  </div>
                  <div class="col-lg-12 col-md-12 col-xs-12">
                    <div class="form-group">
                      <Textarea field="comments" label="Comments" name="comments" rows="3" id="comment" autocomplete="off"
                        maxlength="120" placeholder="Type your comments" />
                      <div class="help-block with-errors"></div>
                    </div>
                  </div>
                  <div id="submitbtnpadding">
                    <button type="submit" id="submitbtn" class="btn btn-common btn-form-submit">Submit</button>
                  </div>
                </div>
              )}
            </Form>
          </Modal>
        </div>
      </Fragment >
    )
  }
}

export default withSnackbar(Feedback);

