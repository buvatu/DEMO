import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComposedModal,
  Dropdown,
  InlineNotification,
  Loading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  NumberInput,
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
import { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { adjustPrice, getAdjustPriceList } from '../../services';

class PriceAdjust extends Component {
  constructor(props) {
    super(props);
    this.state = {
      priceList: [],
      month: '',
      year: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth, setErrorMessage } = this.props;
    if (auth.role !== 'phongketoantaichinh') {
      setErrorMessage('Bạn không đủ quyền truy cập trang này');
      return;
    }
    let month = '';
    let year = '';
    const currentDate = new Date();
    if (currentDate.getMonth === 0) {
      month = '12';
      year = currentDate.getFullYear() - 1;
    } else {
      month = String(currentDate.getMonth()).padStart(2, '0');
      year = String(currentDate.getFullYear());
    }
    this.setState({ month, year });

    setLoading(true);
    try {
      const getAdjustListResult = await getAdjustPriceList(auth.companyID, month.concat('-').concat(year));
      if (getAdjustListResult.data.length === 0) {
        setErrorMessage('Chưa tới kì cập nhật hoặc chưa có dữ liệu. Vui lòng thử lại sau.');
      } else {
        this.setState({ priceList: getAdjustListResult.data });
      }
    } catch {
      setErrorMessage('Có lỗi khi tải trang. Vui lòng thử lại');
      return;
    }

    setLoading(false);
  };

  savePriceList = async () => {
    const { auth, setErrorMessage, setSubmitResult, setLoading } = this.props;
    const { month, year, priceList } = this.state;
    // eslint-disable-next-line no-restricted-globals
    if (priceList.find((e) => isNaN(e.price) || Number(e.price) <= 0) != null) {
      setErrorMessage('Giá cập nhật không đúng định dạng. Vui lòng thử lại');
      return;
    }
    setLoading(true);
    try {
      await adjustPrice(auth.companyID, month.concat('-').concat(year), priceList);
    } catch {
      setErrorMessage('Cập nhật giá không thành công. Vui lòng thử lại');
      setLoading(false);
      return;
    }
    setLoading(false);
    setSubmitResult('Giá xuất kho được câp nhật thành công');
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const { month, year, priceList } = this.state;

    const monthList = [
      { id: '01', label: 'Tháng 1' },
      { id: '02', label: 'Tháng 2' },
      { id: '03', label: 'Tháng 3' },
      { id: '04', label: 'Tháng 4' },
      { id: '05', label: 'Tháng 5' },
      { id: '06', label: 'Tháng 6' },
      { id: '07', label: 'Tháng 7' },
      { id: '08', label: 'Tháng 8' },
      { id: '09', label: 'Tháng 9' },
      { id: '10', label: 'Tháng 10' },
      { id: '11', label: 'Tháng 11' },
      { id: '12', label: 'Tháng 12' },
    ];

    return (
      <div className="price-list">
        {/* Loading */}
        {isLoading && <Loading description="Loading data. Please wait..." withOverlay />}
        {/* Success Modal */}
        <ComposedModal
          className="btn-success"
          open={submitResult !== ''}
          size="sm"
          onClose={() => {
            setSubmitResult('');
            history.push('/home');
          }}
        >
          <ModalHeader iconDescription="Close" title={<div>Thao tác thành công</div>} />
          <ModalBody aria-label="Modal content">
            <div className="form-icon">
              <CloudUpload32 className="icon-prop" />
              <p className="bx--modal-content__text">{submitResult}</p>
            </div>
          </ModalBody>
          <ModalFooter
            onRequestSubmit={() => {
              setSubmitResult('');
              history.push('/home');
            }}
            primaryButtonText="OK"
            secondaryButtonText=""
          />
        </ComposedModal>
        {/* Error Message */}
        <div className="bx--grid">
          <div className="bx--row">
            {errorMessage !== '' && <InlineNotification lowContrast kind="error" title={errorMessage} onCloseButtonClick={() => setErrorMessage('')} />}
          </div>
        </div>
        <br />
        <div className="view-header--box">
          <h4>Danh sách vật tư cần điều chỉnh giá</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="status-Dropdown"
                titleText="Tháng"
                label=""
                items={monthList}
                selectedItem={monthList.find((e) => e.id === month)}
                onChange={(e) => this.setState({ month: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <NumberInput
                helperText=""
                id="year-NumberInput"
                invalidText="Năm không đúng định dạng"
                label="Năm"
                max={9999}
                min={2022}
                size="sm"
                value={year}
                onChange={(e) => this.setState({ year: e.imaginaryTarget.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.savePriceList()} style={{ marginTop: '1rem' }}>
                Lưu thông tin
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-12">
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Mã vật tư</TableHeader>
                      <TableHeader>Tên vật tư</TableHeader>
                      <TableHeader>Đơn vị</TableHeader>
                      <TableHeader>Giá đề xuất</TableHeader>
                      <TableHeader>Giá gần nhất</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {priceList.map((item, index) => (
                      <TableRow key={`row-${index.toString()}`}>
                        <TableCell>{item.materialID}</TableCell>
                        <TableCell>{item.materialName}</TableCell>
                        <TableCell>{item.unit}</TableCell>
                        <TableCell>
                          <TextInput
                            id={`price-${index.toString()}-TextInput`}
                            placeholder=""
                            labelText=""
                            value={item.price}
                            onChange={(e) => {
                              priceList[index].price = e.target.value;
                              this.setState({ priceList });
                            }}
                          />
                        </TableCell>
                        <TableCell>{item.lastPrice}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </div>
          <br />
          <br />
        </div>
      </div>
    );
  }
}

PriceAdjust.propTypes = {
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
  history: PropTypes.instanceOf(Object).isRequired,
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

export default connect(mapStateToProps, mapDispatchToProps)(PriceAdjust);
