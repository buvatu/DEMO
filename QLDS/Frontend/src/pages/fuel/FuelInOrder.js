import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComboBox,
  ComposedModal,
  DatePicker,
  DatePickerInput,
  Dropdown,
  InlineNotification,
  Loading,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { getCategoryList, getSupplierList, getUserList, saveFuelOrder } from '../../services';

const fuelMaterialList = [{ id: '000050001', label: 'Dầu Diesel' }];

class FuelInOrder extends Component {
  constructor(props) {
    super(props);
    const { auth } = this.props;
    this.state = {
      fuelOrderInfo: {
        fuelOrderType: 'I',
        status: 'created',
        fuelMaterialID: '',
        fuelOrderNote: '',
        realFuelQuantity: '',
        standardFuelQuantity: '',
        requestor: auth.userID,
        requestDate: this.formatDate(new Date()),
        supplier: '',
        tester: '',
        testNote: '',
        approver: '',
        approveNote: '',
        no: '',
        co: '',
        recipeNo: '',
        fuelMaterialName: '',
        amount: '',
        category: '',
        companyID: auth.companyID,
      },
      fuelOrderNoteErrorMessage: '',
      testerErrorMessage: '',
      testerList: [],
      approverErrorMessage: '',
      approverList: [],
      supplierErrorMessage: '',
      supplierList: [],
      categoryList: [],
      amountErrorMessages: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth, setErrorMessage } = this.props;
    setLoading(true);
    try {
      const getTesterListResult = await getUserList('', '', auth.companyID, 'phongkythuat');
      const getApproverListResult = await getUserList('', '', auth.companyID, 'phongketoantaichinh');
      const getSupplierListResult = await getSupplierList();
      const getCategoryListResult = await getCategoryList();

      this.setState({
        supplierList: getSupplierListResult.data
          .sort((a, b) => a.supplierName.localeCompare(b.supplierName))
          .map((e) => {
            return { id: e.supplierID, label: e.supplierID.concat(' - ').concat(e.supplierName) };
          }),
        testerList: getTesterListResult.data.map((e) => {
          return { id: e.userID, label: e.username };
        }),
        approverList: getApproverListResult.data.map((e) => {
          return { id: e.userID, label: e.username };
        }),
        categoryList: [
          { id: '', label: '' },
          ...getCategoryListResult.data.map((e) => {
            return { id: e.categoryID, label: e.categoryName };
          }),
        ],
      });
    } catch {
      setErrorMessage('Không thể tải trang. Vui lòng thử lại.');
    }
    setLoading(false);
  };

  saveFuelOrder = async () => {
    const { fuelOrderInfo } = this.state;
    // const { fuelOrderType, fuelMaterialID, realFuelQuantity, standardFuelQuantity } = fuelOrderInfo;
    const { setErrorMessage, setLoading, setSubmitResult } = this.props;
    let hasError = false;

    // eslint-disable-next-line no-restricted-globals
    if (isNaN(fuelOrderInfo.realFuelQuantity) || (fuelOrderInfo.fuelOrderType === 'I' && isNaN(fuelOrderInfo.standardFuelQuantity))) {
      setErrorMessage('Số lượng nhiên liệu không hợp lệ');
      return;
    }
    // eslint-disable-next-line no-restricted-globals
    if (fuelOrderInfo.amount === '' || isNaN(fuelOrderInfo.amount)) {
      setErrorMessage('Thành tiền không hợp lệ');
      return;
    }
    if (fuelOrderInfo.tester === '') {
      hasError = true;
      this.setState({ testerErrorMessage: 'Người nghiệm thu không thể bỏ trống' });
    }
    if (fuelOrderInfo.approver === '') {
      hasError = true;
      this.setState({ approverErrorMessage: 'Người phê duyệt không thể bỏ trống' });
    }
    if (fuelOrderInfo.supplier === '') {
      hasError = true;
      this.setState({ supplierErrorMessage: 'Nhà cung cấp không thể bỏ trống' });
    }
    if (fuelOrderInfo.fuelOrderNote.trim() === '') {
      hasError = true;
      this.setState({ fuelOrderNoteErrorMessage: 'Lý do không thể bỏ trống' });
    }
    // if (fuelOrderInfo.amount === '') {
    //   hasError = true;
    //   this.setState({ amountErrorMessages: 'Cần nhập vào thành tiền' });
    // }
    // if ((fuelOrderInfo.amount !== '' && !fuelOrderInfo.amount.match(/^\d+$/)) || Number(fuelOrderInfo.amount) < 1) {
    //   hasError = true;
    //   this.setState({ amountErrorMessages: 'Cần nhập vào thành tiềnThành tiền không đúng định dạng' });
    // }
    if (hasError) {
      return;
    }
    // setLoading(true);
    // const getSaveFuelStockResult = await saveFuelStock(fuelOrderType, fuelMaterialID, realFuelQuantity, standardFuelQuantity, auth.companyID, auth.userID);
    // setLoading(false);
    // if (getSaveFuelStockResult.data === -1) {
    //   setErrorMessage('Có lỗi khi tạo đơn');
    //   return;
    // }
    setLoading(true);
    const getSaveFuelOrderResult = await saveFuelOrder(fuelOrderInfo);
    setLoading(false);
    if (getSaveFuelOrderResult.data === -1) {
      setErrorMessage('Có lỗi khi tạo đơn');
      return;
    }
    setSubmitResult('Đơn nhập nhiên liệu được tạo thành công');
  };

  formatDate = (inputDate) => {
    const yyyy = inputDate.getFullYear().toString();
    const mm = `0${inputDate.getMonth() + 1}`.slice(-2);
    const dd = `0${inputDate.getDate()}`.slice(-2);
    return `${dd}/${mm}/${yyyy}`;
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const { supplierErrorMessage, supplierList, amountErrorMessages, fuelOrderNoteErrorMessage } = this.state;
    const { fuelOrderInfo, testerErrorMessage, testerList, approverErrorMessage, approverList, categoryList } = this.state;
    const { fuelOrderType, fuelMaterialID, fuelOrderNote, realFuelQuantity, standardFuelQuantity, requestDate, supplier, amount } = fuelOrderInfo;

    const fuelStockInReasonList = [
      { id: 'Nhập mới', label: 'Nhập mới' },
      { id: 'Nhập xả máy các cấp sửa chữa', label: 'Nhập xả máy các cấp sửa chữa' },
      { id: 'Nhập nhiên liệu xuất chạy tàu chưa hết', label: 'Nhập nhiên liệu xuất chạy tàu chưa hết' },
      { id: 'Nhập vay từ đơn vị khác', label: 'Nhập vay từ đơn vị khác' },
    ];

    return (
      <div className="fuel-report">
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
          <h4>Yêu cầu nhập nhiên liệu</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-3 bx--col-md-3" />
            <div className="bx--col-lg-4" />
          </div>
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="fuelMaterialID-Dropdown"
                titleText="Loại nhiên liệu"
                label=""
                items={fuelMaterialList}
                onChange={(e) =>
                  this.setState((prevState) => ({
                    fuelOrderInfo: { ...prevState.fuelOrderInfo, fuelMaterialID: e.selectedItem.id, fuelMaterialName: e.selectedItem.label },
                  }))
                }
              />
            </div>
            <div className="bx--col-lg-4">
              <Dropdown
                id="reason-Dropdown"
                titleText="Lý do"
                label=""
                items={fuelStockInReasonList}
                selectedItem={
                  // eslint-disable-next-line no-nested-ternary
                  fuelOrderNote === '' ? null : fuelStockInReasonList.find((e) => e.id === fuelOrderNote)
                }
                onChange={(e) =>
                  this.setState((prevState) => ({
                    fuelOrderInfo: { ...prevState.fuelOrderInfo, fuelOrderNote: e.selectedItem.id, supplier: '' },
                  }))
                }
                disabled={fuelOrderType === ''}
                invalid={fuelOrderNoteErrorMessage !== ''}
                invalidText={fuelOrderNoteErrorMessage}
              />
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="recipeNo-TextInput"
                placeholder=""
                labelText="Số hoá đơn"
                onChange={(e) =>
                  this.setState((prevState) => ({
                    fuelOrderInfo: { ...prevState.fuelOrderInfo, recipeNo: e.target.value },
                  }))
                }
                disabled={fuelOrderType === ''}
              />
            </div>
            <div className="bx--col-lg-5">
              <ComboBox
                id="supplier-ComboBox"
                titleText="Đơn vị cung cấp"
                placeholder=""
                label=""
                items={supplierList}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                onChange={(e) =>
                  this.setState((prevState) => ({
                    fuelOrderInfo: { ...prevState.fuelOrderInfo, supplier: e.selectedItem == null ? '' : e.selectedItem.id },
                  }))
                }
                selectedItem={
                  // eslint-disable-next-line no-nested-ternary
                  supplier === '' ? null : supplierList.find((e) => e.id === supplier)
                }
                invalid={supplierErrorMessage !== ''}
                invalidText={supplierErrorMessage}
                disabled={
                  fuelOrderType === '' ||
                  (fuelOrderType === 'I' && (fuelOrderNote === 'Nhập xả máy các cấp sửa chữa' || fuelOrderNote === 'Nhập nhiên liệu xuất chạy tàu chưa hết'))
                }
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="real-amount-TextInput"
                placeholder="Vui lòng nhập số lượng"
                labelText="Số lượng (lít thực tế)"
                onChange={(e) =>
                  this.setState((prevState) => ({
                    fuelOrderInfo: { ...prevState.fuelOrderInfo, realFuelQuantity: e.target.value },
                  }))
                }
                disabled={fuelOrderType === ''}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="standard-amount-TextInput"
                placeholder="Vui lòng nhập số lượng"
                labelText="Số lượng (lít tại 15°C)"
                onChange={(e) =>
                  this.setState((prevState) => ({
                    fuelOrderInfo: { ...prevState.fuelOrderInfo, standardFuelQuantity: e.target.value },
                  }))
                }
                disabled={fuelOrderType === ''}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="amount-TextInput"
                placeholder="Vui lòng nhập thành tiền"
                labelText="Thành tiền"
                onChange={(e) =>
                  this.setState((prevState) => ({
                    fuelOrderInfo: { ...prevState.fuelOrderInfo, amount: e.target.value },
                  }))
                }
                disabled={fuelOrderType === ''}
                invalid={amountErrorMessages !== ''}
                invalidText={amountErrorMessages}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="tester-Dropdown"
                titleText="Người nghiệm thu"
                label=""
                items={testerList}
                selectedItem={fuelOrderInfo.tester === '' ? null : testerList.find((e) => e.id === fuelOrderInfo.tester)}
                onChange={(e) => this.setState((prevState) => ({ fuelOrderInfo: { ...prevState.fuelOrderInfo, tester: e.selectedItem.id } }))}
                invalid={testerErrorMessage !== ''}
                invalidText={testerErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="approver-Dropdown"
                titleText="Người phê duyệt"
                label=""
                items={approverList}
                selectedItem={fuelOrderInfo.approver === '' ? null : approverList.find((e) => e.id === fuelOrderInfo.approver)}
                onChange={(e) => this.setState((prevState) => ({ fuelOrderInfo: { ...prevState.fuelOrderInfo, approver: e.selectedItem.id } }))}
                invalid={approverErrorMessage !== ''}
                invalidText={approverErrorMessage}
              />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="no-ComboBox"
                titleText="Nợ"
                placeholder=""
                label=""
                items={categoryList}
                selectedItem={fuelOrderInfo.no === '' ? null : categoryList.find((e) => e.id === fuelOrderInfo.no)}
                onChange={(e) =>
                  this.setState((prevState) => ({ fuelOrderInfo: { ...prevState.fuelOrderInfo, no: e.selectedItem == null ? '' : e.selectedItem.id } }))
                }
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
              />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="co-ComboBox"
                titleText="Có"
                placeholder=""
                label=""
                items={categoryList}
                selectedItem={fuelOrderInfo.co === '' ? null : categoryList.find((e) => e.id === fuelOrderInfo.co)}
                onChange={(e) =>
                  this.setState((prevState) => ({ fuelOrderInfo: { ...prevState.fuelOrderInfo, co: e.selectedItem == null ? '' : e.selectedItem.id } }))
                }
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="category-ComboBox"
                titleText="Khoản mục"
                placeholder=""
                label=""
                items={categoryList}
                selectedItem={fuelOrderInfo.category === '' ? null : categoryList.find((e) => e.id === fuelOrderInfo.category)}
                onChange={(e) =>
                  this.setState((prevState) => ({ fuelOrderInfo: { ...prevState.fuelOrderInfo, category: e.selectedItem == null ? '' : e.selectedItem.id } }))
                }
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker
                datePickerType="single"
                dateFormat="d/m/Y"
                onChange={(e) => this.setState((prevState) => ({ fuelOrderInfo: { ...prevState.fuelOrderInfo, requestDate: this.formatDate(e[0]) } }))}
                value={requestDate}
              >
                <DatePickerInput
                  datePickerType="single"
                  placeholder="dd/mm/yyyy"
                  labelText="Ngày tạo yêu cầu"
                  id="requestDate-datepicker"
                  disabled={fuelOrderType === ''}
                />
              </DatePicker>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                disabled={
                  fuelOrderType === '' ||
                  fuelMaterialID === '' ||
                  fuelOrderNote === '' ||
                  realFuelQuantity === '' ||
                  standardFuelQuantity === '' ||
                  supplier === '' ||
                  amount === ''
                }
                onClick={() => this.saveFuelOrder()}
                style={{ marginTop: '1rem' }}
              >
                {fuelOrderType === 'I' && 'Tạo đơn nhập'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

FuelInOrder.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(FuelInOrder);