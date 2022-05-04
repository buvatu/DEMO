import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  Checkbox,
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
import { filterStockList, getMaterialList, stockUpdate } from '../../services';

class StockUpdate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      materialList: [],
      stockList: [],
      selectedLines: [],
      materialIDErrorMessages: [],
      quantityErrorMessages: [],
      amountErrorMessages: [],
      requestDate: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth } = this.props;
    setLoading(true);
    const getStockListResult = await filterStockList('', '', '', '', auth.companyID);
    const getMaterialListResult = await getMaterialList('', '', '', '');
    const stockList = getStockListResult.data;
    setLoading(false);
    this.setState({
      stockList,
      materialList: getMaterialListResult.data,
      requestDate: this.formatDate(new Date()),
      materialIDErrorMessages: Array(stockList.length).fill('', 0, stockList.length),
      quantityErrorMessages: Array(stockList.length).fill('', 0, stockList.length),
      amountErrorMessages: Array(stockList.length).fill('', 0, stockList.length),
    });
  };

  save = async () => {
    const { setErrorMessage, setLoading, setSubmitResult, auth } = this.props;
    const { stockList, materialIDErrorMessages, quantityErrorMessages, amountErrorMessages, requestDate } = this.state;

    this.setState({
      materialIDErrorMessages: Array(stockList.length).fill('', 0, stockList.length),
      quantityErrorMessages: Array(stockList.length).fill('', 0, stockList.length),
      amountErrorMessages: Array(stockList.length).fill('', 0, stockList.length),
    });
    setErrorMessage('');

    let hasError = false;
    stockList.forEach((e, index) => {
      if (e.material_id === '') {
        hasError = true;
        materialIDErrorMessages[index] = 'Mã vật tư không thể bỏ trống';
      }
      if (e.quantity === '') {
        hasError = true;
        quantityErrorMessages[index] = 'Cần nhập vào số lượng';
      }
      if ((e.quantity !== '' && !e.quantity.toString().match(/^\d+$/)) || Number(e.quantity) < 1) {
        hasError = true;
        quantityErrorMessages[index] = 'Số lượng cần phải là số nguyên dương';
      }
      if (e.amount === '') {
        hasError = true;
        amountErrorMessages[index] = 'Cần nhập vào thành tiền';
      }
      if ((e.amount !== '' && !e.amount.toString().match(/^\d+$/)) || Number(e.amount) < 1) {
        hasError = true;
        amountErrorMessages[index] = 'Thành tiền không đúng định dạng';
      }
    });
    this.setState({ materialIDErrorMessages, quantityErrorMessages, amountErrorMessages });

    if (
      stockList.length > 0 &&
      new Set(
        stockList.map((e) => {
          return `${e.material_id}-${e.quality}`;
        })
      ).size !== stockList.length
    ) {
      hasError = true;
      setErrorMessage('Có mã vật tư bị trùng. Vui lòng kiểm tra lại');
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    const getStockUpdateResult = await stockUpdate(stockList, auth.companyID, auth.userID, requestDate);
    setLoading(false);
    if (getStockUpdateResult.data.length !== stockList.length) {
      setErrorMessage('Có lỗi cập nhật danh mục kho.');
      return;
    }
    setSubmitResult('Danh mục kho được câp nhật thành công');
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
    const { orderDetails, selectedLines, materialIDErrorMessages, quantityErrorMessages, amountErrorMessages, requestDate, stockList, materialList } = this.state;

    const materialIDs = materialList
      .map((e) => {
        return { id: e.material_id, label: e.material_id.concat(' - ').concat(e.material_name) };
      })
      .sort((a, b) => a.label.split(' - ')[1].localeCompare(b.label.split(' - ')[1]));

    const qualityList = [
      { id: 'Mới', label: 'Mới' },
      { id: 'Loại I', label: 'Loại I' },
      { id: 'Loại II', label: 'Loại II' },
      { id: 'Phế liệu', label: 'Phế liệu' },
    ];

    return (
      <div className="stock-update">
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
          <h4>Nhập kho đầu kì</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                onClick={() => {
                  stockList.push({
                    material_id: '',
                    material_name: '',
                    unit: '',
                    quality: 'Mới',
                    quantity: '',
                    amount: '',
                  });
                  materialIDErrorMessages.push('');
                  quantityErrorMessages.push('');
                  amountErrorMessages.push('');
                  this.setState({ stockList, materialIDErrorMessages, quantityErrorMessages, amountErrorMessages });
                }}
                style={{ marginTop: '1rem' }}
              >
                Thêm vật tư
              </Button>
            </div>
            <span style={{ maxLength: '3rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                onClick={() => {
                  this.setState({
                    stockList: stockList.filter((e, index) => !selectedLines.includes(index)),
                    materialIDErrorMessages: materialIDErrorMessages.filter((e, index) => !selectedLines.includes(index)),
                    quantityErrorMessages: quantityErrorMessages.filter((e, index) => !selectedLines.includes(index)),
                    amountErrorMessages: amountErrorMessages.filter((e, index) => !selectedLines.includes(index)),
                    selectedLines: [],
                  });
                }}
                style={{ marginTop: '1rem' }}
              >
                Xoá vật tư
              </Button>
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" onChange={(e) => this.setState({ requestDate: this.formatDate(e[0]) })} value={requestDate}>
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ngày tạo yêu cầu" id="requestDate-datepicker" />
              </DatePicker>
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.save()} style={{ marginTop: '1rem' }}>
                Lưu thông tin
              </Button>
            </div>
          </div>
        </div>
        <br />
        <br />
        <div className="bx--grid">
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title="Chi tiết danh mục kho">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader />
                      <TableHeader key="stt">STT</TableHeader>
                      <TableHeader key="materialID" style={{ minWidth: '35%' }}>
                        Mã vật tư - Tên vật tư
                      </TableHeader>
                      <TableHeader key="unit">Đơn vị</TableHeader>
                      <TableHeader key="quality">Chất lượng</TableHeader>
                      <TableHeader key="quantity">Số lượng</TableHeader>
                      <TableHeader key="amount">Thành tiền</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockList.map((row, index) => (
                      <TableRow key={index.toString()}>
                        <TableCell>
                          <Checkbox
                            id={`materialID-checkbox-${index}`}
                            labelText=""
                            value={index}
                            checked={selectedLines.includes(index)}
                            onChange={(target) => {
                              if (target) {
                                selectedLines.push(index);
                                this.setState({ selectedLines });
                              } else {
                                this.setState({ selectedLines: selectedLines.filter((e) => e !== index) });
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                        <TableCell key={`material-${index.toString()}`}>
                          <ComboBox
                            id={`materialID-Dropdown-${index}`}
                            titleText=""
                            placeholder="Mã vật tư"
                            label=""
                            items={materialIDs}
                            selectedItem={stockList[index].material_id === '' ? null : materialIDs.find((e) => e.id === stockList[index].material_id)}
                            shouldFilterItem={({ item, inputValue }) => {
                              if (!inputValue) return true;
                              return item.label.toLowerCase().includes(inputValue.toLowerCase());
                            }}
                            onChange={(e) => {
                              const selectedItemID = e.selectedItem === null ? '' : e.selectedItem.id;
                              stockList[index].material_id = selectedItemID;
                              stockList[index].material_name =
                                selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).material_name;
                              stockList[index].unit = selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).unit;
                              materialIDErrorMessages[index] = '';
                              quantityErrorMessages[index] = '';
                              amountErrorMessages[index] = '';
                              this.setState({
                                stockList,
                                materialIDErrorMessages,
                                quantityErrorMessages,
                                amountErrorMessages,
                              });
                            }}
                            invalid={materialIDErrorMessages[index] !== ''}
                            invalidText={materialIDErrorMessages[index]}
                          />
                        </TableCell>
                        <TableCell key={`unit-${index.toString()}`}>{row.unit}</TableCell>
                        <TableCell key={`quality-${index.toString()}`}>
                          <Dropdown
                            id={`quality-Dropdown-${index}`}
                            titleText=""
                            label=""
                            items={qualityList}
                            selectedItem={stockList[index].quality === '' ? null : qualityList.find((e) => e.id === stockList[index].quality)}
                            onChange={(e) => {
                              stockList[index].quality = e.selectedItem.id;
                              this.setState({ orderDetails });
                            }}
                          />
                        </TableCell>
                        <TableCell key={`quantity-${index.toString()}`}>
                          <TextInput
                            id={`quantity-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              stockList[index].quantity = Number(e.target.value);
                              this.setState({ orderDetails });
                            }}
                            value={stockList[index].quantity}
                            invalid={quantityErrorMessages[index] !== ''}
                            invalidText={quantityErrorMessages[index]}
                          />
                        </TableCell>
                        <TableCell key={`amount-${index.toString()}`}>
                          <TextInput
                            id={`amount-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              stockList[index].amount = Number(e.target.value);
                              this.setState({ stockList });
                            }}
                            value={stockList[index].amount}
                            invalid={amountErrorMessages[index] !== ''}
                            invalidText={amountErrorMessages[index]}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                    <TableRow />
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2" />
          </div>
        </div>
      </div>
    );
  }
}

StockUpdate.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(StockUpdate);
