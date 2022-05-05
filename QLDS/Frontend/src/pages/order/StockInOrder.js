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
import { addOrderDetails, addOrderInfo, getMaterialList, getSupplierList, getUserList } from '../../services';

class StockInOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reason: '',
      reasonErrorMessage: '',
      tester: '',
      testerErrorMessage: '',
      approver: '',
      approverErrorMessage: '',
      testerList: [],
      approverList: [],
      materialList: [],
      orderDetails: [],
      selectedLines: [],
      materialIDErrorMessages: [],
      quantityErrorMessages: [],
      amountErrorMessages: [],
      supplier: '',
      supplierList: [],
      no: '',
      co: '',
      recipeNo: '',
      deliver: '',
      requestDate: '',
      attachedDocument: '',
      stockNo: '',
      address: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth } = this.props;
    setLoading(true);
    const getTesterListResult = await getUserList('', '', auth.companyID, 'phongkythuat');
    const getApproverListResult = await getUserList('', '', auth.companyID, 'phongketoan');
    const getMaterialListResult = await getMaterialList('', '', '', '');
    const getSupplierListResult = await getSupplierList();
    setLoading(false);
    this.setState({
      testerList: getTesterListResult.data.map((e) => {
        return { id: e.user_id, label: e.username };
      }),
      approverList: getApproverListResult.data.map((e) => {
        return { id: e.user_id, label: e.username };
      }),
      materialList: getMaterialListResult.data,
      supplierList: getSupplierListResult.data
        .sort((a, b) => a.supplier_name.localeCompare(b.supplier_name))
        .map((e) => {
          return { id: e.supplier_id, label: e.supplier_id.concat(' - ').concat(e.supplier_name) };
        }),
      requestDate: this.formatDate(new Date()),
    });
  };

  save = async () => {
    const { setErrorMessage, setLoading, setSubmitResult, auth } = this.props;
    const {
      reason,
      tester,
      approver,
      orderDetails,
      materialIDErrorMessages,
      quantityErrorMessages,
      amountErrorMessages,
      supplier,
      no,
      co,
      recipeNo,
      deliver,
      requestDate,
      attachedDocument,
      stockNo,
      address,
    } = this.state;

    this.setState({
      reasonErrorMessage: '',
      testerErrorMessage: '',
      approverErrorMessage: '',
      materialIDErrorMessages: Array(orderDetails.length).fill('', 0, orderDetails.length),
      quantityErrorMessages: Array(orderDetails.length).fill('', 0, orderDetails.length),
      amountErrorMessages: Array(orderDetails.length).fill('', 0, orderDetails.length),
    });
    setErrorMessage('');

    let hasError = false;
    if (reason.trim() === '') {
      hasError = true;
      this.setState({ reasonErrorMessage: 'Lý do không thể bỏ trống' });
    }
    if (tester.trim() === '') {
      hasError = true;
      this.setState({ testerErrorMessage: 'Người nghiệm thu không thể bỏ trống' });
    }
    if (approver.trim() === '') {
      hasError = true;
      this.setState({ approverErrorMessage: 'Người phê duyệt không thể bỏ trống' });
    }
    orderDetails.forEach((e, index) => {
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
    if (orderDetails.length === 0) {
      hasError = true;
      setErrorMessage('Mỗi yêu cầu cần ít nhất 1 danh mục vật tư');
    }

    if (
      orderDetails.length > 0 &&
      new Set(
        orderDetails.map((e) => {
          return `${e.material_id}-${e.quality}`;
        })
      ).size !== orderDetails.length
    ) {
      hasError = true;
      setErrorMessage('Có mã vật tư bị trùng. Vui lòng kiểm tra lại');
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    const getAddOrderResult = await addOrderInfo(
      'I',
      'Yêu cầu nhập kho',
      'need test',
      '',
      auth.userID,
      reason,
      tester,
      approver,
      auth.companyID,
      supplier,
      no,
      co,
      recipeNo,
      deliver,
      requestDate,
      attachedDocument,
      stockNo,
      address
    );
    setLoading(false);
    if (getAddOrderResult.data === 'null') {
      setErrorMessage('Có lỗi khi thêm yêu cầu.');
      return;
    }
    setLoading(true);
    await addOrderDetails(getAddOrderResult.data, auth.userID, orderDetails);
    setLoading(false);
    setSubmitResult('Yêu cầu được thêm thành công');
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
    const {
      reason,
      reasonErrorMessage,
      tester,
      approver,
      testerList,
      approverList,
      materialList,
      orderDetails,
      selectedLines,
      testerErrorMessage,
      approverErrorMessage,
      materialIDErrorMessages,
      quantityErrorMessages,
      amountErrorMessages,
      supplier,
      supplierList,
      no,
      co,
      recipeNo,
      deliver,
      requestDate,
      attachedDocument,
      stockNo,
      address,
    } = this.state;

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
      <div className="stock-in">
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
          <h4>Yêu cầu nhập kho</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <TextInput
                id="reason-TextInput"
                placeholder="Vui lòng nhập lý do lập bảng"
                labelText="Lý do"
                value={reason}
                onChange={(e) => this.setState({ reason: e.target.value })}
                invalid={reasonErrorMessage !== ''}
                invalidText={reasonErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="tester-Dropdown"
                titleText="Người nghiệm thu"
                label=""
                items={testerList}
                selectedItem={tester === '' ? null : testerList.find((e) => e.id === tester)}
                onChange={(e) => this.setState({ tester: e.selectedItem.id })}
                invalid={testerErrorMessage !== ''}
                invalidText={testerErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="approver-Dropdown"
                titleText="Người phê duyệt"
                label=""
                items={approverList}
                selectedItem={approver === '' ? null : approverList.find((e) => e.id === approver)}
                onChange={(e) => this.setState({ approver: e.selectedItem.id })}
                invalid={approverErrorMessage !== ''}
                invalidText={approverErrorMessage}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <ComboBox
                id="supplier-Dropdown"
                titleText="Đơn vị cung cấp"
                placeholder="Nhà cung cấp"
                label=""
                items={supplierList}
                selectedItem={supplier === '' ? null : supplierList.find((e) => e.id === supplier)}
                onChange={(e) => this.setState({ supplier: e.selectedItem == null ? '' : e.selectedItem.id })}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="no-TextInput" placeholder="" labelText="Nợ" value={no} onChange={(e) => this.setState({ no: e.target.value })} />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="co-TextInput" placeholder="" labelText="Có" value={co} onChange={(e) => this.setState({ co: e.target.value })} />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <TextInput
                id="recipeNo-TextInput"
                placeholder=""
                labelText="Số hoá đơn"
                value={recipeNo}
                onChange={(e) => this.setState({ recipeNo: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="deliver-TextInput"
                placeholder=""
                labelText="Người giao hàng"
                value={deliver}
                onChange={(e) => this.setState({ deliver: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" onChange={(e) => this.setState({ requestDate: this.formatDate(e[0]) })} value={requestDate}>
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ngày tạo yêu cầu" id="requestDate-datepicker" />
              </DatePicker>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <TextInput
                id="attachedDocument-TextInput"
                placeholder=""
                labelText="Số chứng từ gốc kèm theo"
                value={attachedDocument}
                onChange={(e) => this.setState({ attachedDocument: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="stockNo-TextInput"
                placeholder=""
                labelText="Nhập vào kho"
                value={stockNo}
                onChange={(e) => this.setState({ stockNo: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="address-TextInput"
                placeholder=""
                labelText="Địa điểm"
                value={address}
                onChange={(e) => this.setState({ address: e.target.value })}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                onClick={() => {
                  orderDetails.push({
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
                  this.setState({ orderDetails, materialIDErrorMessages, quantityErrorMessages, amountErrorMessages });
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
                    orderDetails: orderDetails.filter((e, index) => !selectedLines.includes(index)),
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
              <TableContainer title="Chi tiết danh mục nhập kho">
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
                    {orderDetails.map((row, index) => (
                      <TableRow key={row.id}>
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
                            selectedItem={orderDetails[index].material_id === '' ? null : materialIDs.find((e) => e.id === orderDetails[index].material_id)}
                            shouldFilterItem={({ item, inputValue }) => {
                              if (!inputValue) return true;
                              return item.label.toLowerCase().includes(inputValue.toLowerCase());
                            }}
                            onChange={(e) => {
                              const selectedItemID = e.selectedItem === null ? '' : e.selectedItem.id;
                              orderDetails[index].material_id = selectedItemID;
                              orderDetails[index].material_name =
                                selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).material_name;
                              orderDetails[index].unit = selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).unit;
                              materialIDErrorMessages[index] = '';
                              quantityErrorMessages[index] = '';
                              amountErrorMessages[index] = '';
                              this.setState({
                                orderDetails,
                                materialIDErrorMessages,
                                quantityErrorMessages,
                                amountErrorMessages,
                              });
                            }}
                            invalid={materialIDErrorMessages[index] !== ''}
                            invalidText={materialIDErrorMessages[index]}
                          />
                        </TableCell>
                        <TableCell key={`unit-${index.toString()}`}>{orderDetails[index].unit}</TableCell>
                        <TableCell key={`quality-${index.toString()}`}>
                          <Dropdown
                            id={`quality-Dropdown-${index}`}
                            titleText=""
                            label=""
                            items={qualityList}
                            selectedItem={orderDetails[index].quality === '' ? null : qualityList.find((e) => e.id === orderDetails[index].quality)}
                            onChange={(e) => {
                              orderDetails[index].quality = e.selectedItem.id;
                              this.setState({ orderDetails });
                            }}
                          />
                        </TableCell>
                        <TableCell key={`quantity-${index.toString()}`}>
                          <TextInput
                            id={`quantity-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              orderDetails[index].quantity = Number(e.target.value);
                              this.setState({ orderDetails });
                            }}
                            value={orderDetails[index].quantity}
                            invalid={quantityErrorMessages[index] !== ''}
                            invalidText={quantityErrorMessages[index]}
                          />
                        </TableCell>
                        <TableCell key={`amount-${index.toString()}`}>
                          <TextInput
                            id={`amount-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              orderDetails[index].amount = Number(e.target.value);
                              this.setState({ orderDetails });
                            }}
                            value={orderDetails[index].amount}
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

StockInOrder.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(StockInOrder);
