import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComposedModal,
  DataTable,
  InlineNotification,
  Loading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TextInput,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { adjustScrapPrice, getScrapPriceList } from '../../services';

class ScrapPriceAdjust extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrapPriceList: [],
      copperPrice: '',
      aluminumPrice: '',
      castIronPrice: '',
      steelPrice: '',
      otherPrice: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth } = this.props;
    setLoading(true);
    const getScrapPriceListResult = await getScrapPriceList(auth.companyID);
    setLoading(false);
    const currentPrice = getScrapPriceListResult.data.find((e) => e.active_status === 'Y');
    this.setState({
      scrapPriceList: getScrapPriceListResult.data.map((e, index) => {
        e.id = index.toString();
        return e;
      }),
      copperPrice: currentPrice === undefined ? '' : currentPrice.copper_price,
      aluminumPrice: currentPrice === undefined ? '' : currentPrice.aluminum_price,
      castIronPrice: currentPrice === undefined ? '' : currentPrice.cast_iron_price,
      steelPrice: currentPrice === undefined ? '' : currentPrice.steel_price,
      otherPrice: currentPrice === undefined ? '' : currentPrice.other_price,
    });
  };

  reload = async () => {
    const { setLoading, setSubmitResult, auth } = this.props;
    setSubmitResult('');
    setLoading(true);
    const getScrapPriceListResult = await getScrapPriceList(auth.companyID);
    setLoading(false);
    const currentPrice = getScrapPriceListResult.data.find((e) => e.active_status === 'Y');
    this.setState({
      scrapPriceList: getScrapPriceListResult.data.map((e, index) => {
        e.id = index.toString();
        return e;
      }),
      copperPrice: currentPrice === undefined ? '' : currentPrice.copper_price,
      aluminumPrice: currentPrice === undefined ? '' : currentPrice.aluminum_price,
      castIronPrice: currentPrice === undefined ? '' : currentPrice.cast_iron_price,
      steelPrice: currentPrice === undefined ? '' : currentPrice.steel_price,
      otherPrice: currentPrice === undefined ? '' : currentPrice.other_price,
    });
  };

  adjustPrice = async () => {
    const { setLoading, setSubmitResult, setErrorMessage, auth } = this.props;
    const { scrapPriceList, copperPrice, aluminumPrice, castIronPrice, steelPrice, otherPrice } = this.state;

    if (copperPrice.trim() === '' || aluminumPrice.trim() === '' || castIronPrice.trim() === '' || steelPrice.trim() === '' || otherPrice.trim() === '') {
      setErrorMessage('Giá phế liệu không được bỏ trống');
      return;
    }
    const currentPrice = scrapPriceList.find((e) => e.active_status === 'Y');
    if (
      currentPrice !== undefined &&
      currentPrice.copper_price === copperPrice &&
      currentPrice.aluminum_price === aluminumPrice &&
      currentPrice.cast_iron_price === castIronPrice &&
      currentPrice.steel_price === steelPrice &&
      currentPrice.other_price === otherPrice
    ) {
      setErrorMessage('Giá phế liệu chưa được thay đổi');
      return;
    }
    setLoading(true);
    const getAdjustScrapResult = await adjustScrapPrice(copperPrice, aluminumPrice, castIronPrice, steelPrice, otherPrice, auth.companyID, auth.userID);
    setLoading(false);
    if (getAdjustScrapResult.data === 1) {
      setSubmitResult('Giá phế liệu đã được điều chỉnh thành công!');
    } else {
      setErrorMessage('Chưa cập nhật được giá phế liệu mới. Vui lòng kiểm tra lại.');
    }
  };

  render() {
    // Props first
    const { setErrorMessage, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const { scrapPriceList, copperPrice, aluminumPrice, castIronPrice, steelPrice, otherPrice } = this.state;

    return (
      <div className="scrap">
        {/* Loading */}
        {isLoading && <Loading description="Loading data. Please wait..." withOverlay />}
        {/* Success Modal */}
        <ComposedModal className="btn-success" open={submitResult !== ''} size="sm" onClose={() => this.reload()}>
          <ModalHeader iconDescription="Close" title={<div>Thao tác thành công</div>} />
          <ModalBody aria-label="Modal content">
            <div className="form-icon">
              <CloudUpload32 className="icon-prop" />
              <p className="bx--modal-content__text">{submitResult}</p>
            </div>
          </ModalBody>
          <ModalFooter onRequestSubmit={() => this.reload()} primaryButtonText="OK" secondaryButtonText="" />
        </ComposedModal>
        {/* Error Message */}
        <div className="bx--grid">
          <div className="bx--row">
            {errorMessage !== '' && <InlineNotification lowContrast kind="error" title={errorMessage} onCloseButtonClick={() => setErrorMessage('')} />}
          </div>
        </div>
        <br />
        <div className="view-header--box">
          <h4>Điều chỉnh giá phế liệu</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="copperPrice-TextInput"
                placeholder=""
                labelText="Giá Đồng"
                value={copperPrice}
                onChange={(e) => this.setState({ copperPrice: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="aluminumPrice-TextInput"
                placeholder=""
                labelText="Giá Nhôm"
                value={aluminumPrice}
                onChange={(e) => this.setState({ aluminumPrice: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="castIronPrice-TextInput"
                placeholder=""
                labelText="Giá Gang"
                value={castIronPrice}
                onChange={(e) => this.setState({ castIronPrice: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="steelPrice-TextInput"
                placeholder=""
                labelText="Giá Sắt"
                value={steelPrice}
                onChange={(e) => this.setState({ steelPrice: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="otherPrice -TextInput"
                placeholder=""
                labelText="Giá Vật liệu khác"
                value={otherPrice}
                onChange={(e) => this.setState({ otherPrice: e.target.value })}
              />
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.adjustPrice()} style={{ marginTop: '1rem' }}>
                Cập nhật
              </Button>
            </div>
          </div>
          <br />
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <DataTable
                rows={scrapPriceList}
                headers={[
                  { header: 'Ngày điều chỉnh', key: 'updated_timestamp' },
                  { header: 'Giá Đồng', key: 'copper_price' },
                  { header: 'Giá Nhôm', key: 'aluminum_price' },
                  { header: 'Giá Gang', key: 'cast_iron_price' },
                  { header: 'Giá Sắt', key: 'steel_price' },
                  { header: 'Giá VL khác', key: 'other_price' },
                  { header: 'Người điều chỉnh', key: 'updated_user' },
                ]}
                radio
                render={({ rows, headers }) => (
                  <div>
                    <TableContainer title="Lịch sử điều chỉnh giá">
                      <Table style={{ maxHeigh: '70vh' }}>
                        <TableHead>
                          <TableRow>
                            <TableHeader>STT</TableHeader>
                            {headers.map((header) => (
                              <TableHeader key={header.key}>{header.header}</TableHeader>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row, index) => (
                            <TableRow key={row.id}>
                              <TableCell>{index + 1}</TableCell>
                              {row.cells.map((cell) => (
                                <TableCell key={cell.id}>{cell.value}</TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </div>
                )}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2" />
          </div>
          <br />
          <br />
          <br />
        </div>
      </div>
    );
  }
}

ScrapPriceAdjust.propTypes = {
  setErrorMessage: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  setSubmitResult: PropTypes.func.isRequired,
  common: PropTypes.shape({ submitResult: PropTypes.string, errorMessage: PropTypes.string, isLoading: PropTypes.bool }).isRequired,
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool,
    userID: PropTypes.string,
    username: PropTypes.string,
    role: PropTypes.string,
    roleName: PropTypes.string,
    address: PropTypes.string,
    isActive: PropTypes.bool,
    companyID: PropTypes.string,
    companyName: PropTypes.string,
  }).isRequired,
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }).isRequired,
};

const mapStateToProps = (state) => ({
  common: state.common,
  auth: state.auth,
});

const mapDispatchToProps = (dispatch) => ({
  setErrorMessage: (errorMessage) => dispatch(assignErrorMessage(errorMessage)),
  setLoading: (loading) => dispatch(setLoadingValue(loading)),
  setSubmitResult: (submitResult) => dispatch(setSubmitValue(submitResult)),
});

export default connect(mapStateToProps, mapDispatchToProps)(ScrapPriceAdjust);
