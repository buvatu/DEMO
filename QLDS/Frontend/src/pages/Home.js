import { Button, Tab, Tabs } from 'carbon-components-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';

// eslint-disable-next-line react/prefer-stateless-function
class Home extends Component {
  constructor(props) {
    super(props);
    this.state = { redirect: '' };
  }

  render() {
    const { redirect } = this.state;
    if (redirect !== '') {
      return redirect;
    }
    const { auth } = this.props;
    const { isAuthenticated, username } = auth;

    return (
      <div className="bx--grid bx--grid--full-width landing-page">
        <br />
        <br />
        <br />
        <div className="bx--row landing-page__banner">
          <div className="bx--col-lg-16">
            <br />
            <br />
            <h1 className="landing-page__heading">Chào mừng {username} đến với Cổng thông tin quản lý Đường sắt Việt Nam</h1>
          </div>
        </div>
        <div
          className="bx--row landing-page__r2"
          style={{ backgroundImage: 'url(trains.jpg)', height: '100%', backgroundRepeat: 'no-repeat', backgroundPosition: 'center', backgroundSize: 'cover' }}
        >
          <div className="bx--col bx--no-gutter">
            <Tabs selected={0} aria-label="Tab navigation">
              <Tab label="Tổng quan">
                <div className="bx--grid bx--grid--no-gutter bx--grid--full-width" style={{ height: '50vh' }}>
                  <div className="bx--row landing-page__tab-content">
                    <div className="bx--col-md-4 bx--col-lg-7">
                      <h2 className="landing-page__subheading">Xin chào,</h2>
                      <p className="landing-page__p">
                        Đây là cổng thông tin Quản lý Đường sắt Việt Nam. Cổng thông tin này sẽ cung cấp cho bạn các thông tin cần thiết về nghiệp vụ Quản lý
                        Đường sắt.
                        <br />
                        {!isAuthenticated && 'Để bắt đầu sử dụng, vui lòng đăng nhập vào hệ thống.'}
                      </p>
                      {!isAuthenticated && <Button onClick={() => this.setState({ redirect: <Redirect to="/login" /> })}>Đăng nhập</Button>}
                    </div>
                  </div>
                </div>
              </Tab>
              <Tab label="Thiết kế">
                <div className="bx--grid bx--grid--no-gutter bx--grid--full-width" style={{ height: '50vh' }}>
                  <div className="bx--row landing-page__tab-content">
                    <div className="bx--col-lg-16">
                      <p className="landing-page__p">
                        Cổng thông tin bao gồm các phần mục chính như: <br />
                        - Quản lý chung <br />
                        - Quản lý kỹ thuật <br />
                        - Quản lý vật tư <br />- Báo cáo
                      </p>
                    </div>
                  </div>
                </div>
              </Tab>
              <Tab label="Thông tin">
                <div className="bx--grid bx--grid--no-gutter bx--grid--full-width" style={{ height: '50vh' }}>
                  <div className="bx--row landing-page__tab-content">
                    <div className="bx--col-lg-16">
                      <p className="landing-page__p">Cổng thông tin được thiết kế và xây dựng bởi: Bùi Văn Tùng</p>
                    </div>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}

Home.propTypes = {
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool,
    username: PropTypes.string,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

const mapDispatchToProps = () => ({});

export default connect(mapStateToProps, mapDispatchToProps)(Home);
