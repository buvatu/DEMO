import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
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
import {
  addOrderChangesHistory,
  exportStockInOrderRecipe,
  exportStockOutOrderRecipe,
  exportTestRecipe,
  getOrderDetails,
  getOrderInfo,
  getStockList,
  stockIn,
  stockOut,
  updateOrderDetails,
  updateOrderInfo,
} from '../../services';

class OrderDetails extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderID: '',
      orderType: '',
      orderName: '',
      requestor: '',
      requestNote: '',
      requestDate: '',
      testNote: '',
      approveNote: '',
      orderDetails: [],
      origninalOrderDetails: [],
      materialIDErrorMessages: [],
      quantityErrorMessages: [],
      amountErrorMessages: [],
      supplier: '',
      no: '',
      co: '',
      recipeNo: '',
      deliver: '',
      testDate: '',
      approveDate: '',
      tester: '',
      approver: '',
      requestorName: '',
      supplierName: '',
      orderStatus: '',
      attachedDocument: '',
      stockNo: '',
      address: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading, setErrorMessage, location, auth } = this.props;
    const params = new URLSearchParams(location.search);
    if (params == null) {
      setErrorMessage('Không có mã yêu cầu!!!');
    } else {
      const orderID = params.get('orderID');
      setLoading(true);
      const getOrderInfoResult = await getOrderInfo(orderID);
      setLoading(false);
      if (getOrderInfoResult.data === 'null') {
        setErrorMessage('Mã yêu cầu không tồn tại!!!');
        return;
      }
      if (
        getOrderInfoResult.data.requestor !== auth.userID &&
        getOrderInfoResult.data.tester !== auth.userID &&
        getOrderInfoResult.data.approver !== auth.userID
      ) {
        setErrorMessage('Bạn không có quyền truy cập vào yêu cầu này!!!');
        return;
      }
      if (getOrderInfoResult.data.status === 'completed') {
        setErrorMessage('Yêu cầu này đã hoàn thành!!!');
      }
      setLoading(true);
      const getOrderDetailsResult = await getOrderDetails(orderID);
      let orderDetails = JSON.parse(JSON.stringify(getOrderDetailsResult.data));
      if (getOrderInfoResult.data.order_type === 'O') {
        const getStockListResult = await getStockList(auth.companyID);
        const stockList = getStockListResult.data;
        orderDetails = orderDetails.map((e) => {
          const stockRecord = stockList.find((item) => item.material_id === e.material_id && item.quality === e.quality);
          if (stockRecord === undefined) {
            setErrorMessage('Dữ liệu kho đã được cập nhật. Vui lòng thử lại sau!!!');
          } else {
            e.stock_quantity = stockRecord.quantity;
            e.minimum_quantity = stockRecord.minimum_quantity;
            e.price = stockRecord.price;
          }
          return e;
        });
      }
      setLoading(false);
      this.setState({
        orderID,
        orderType: getOrderInfoResult.data.order_type,
        orderName: getOrderInfoResult.data.order_name,
        requestor: getOrderInfoResult.data.requestor,
        requestNote: getOrderInfoResult.data.request_note,
        requestDate: getOrderInfoResult.data.request_date,
        consumer: getOrderInfoResult.data.consumer,
        orderStatus: getOrderInfoResult.data.status,

        supplier: getOrderInfoResult.data.supplier,
        no: getOrderInfoResult.data.no,
        co: getOrderInfoResult.data.co,
        recipeNo: getOrderInfoResult.data.recipe_no,
        deliver: getOrderInfoResult.data.deliver,
        tester: getOrderInfoResult.data.tester,
        approver: getOrderInfoResult.data.approver,
        attachedDocument: getOrderInfoResult.data.attached_document,
        stockNo: getOrderInfoResult.data.stock_no,
        address: getOrderInfoResult.data.address,

        orderDetails,
        origninalOrderDetails: JSON.parse(JSON.stringify(getOrderDetailsResult.data)),
        quantityErrorMessages: Array(getOrderDetailsResult.data.length).fill('', 0, getOrderDetailsResult.data.length),
        amountErrorMessages: Array(getOrderDetailsResult.data.length).fill('', 0, getOrderDetailsResult.data.length),

        testDate: this.formatDate(getOrderInfoResult.data.test_date),
        approveDate: this.formatDate(getOrderInfoResult.data.approve_date),
        requestorName: getOrderInfoResult.data.username,
        supplierName: getOrderInfoResult.data.supplier_name,
      });
    }
  };

  adjustAndApprove = async () => {
    const { setErrorMessage, setLoading, setSubmitResult, auth } = this.props;
    const {
      orderID,
      orderType,
      origninalOrderDetails,
      orderDetails,
      materialIDErrorMessages,
      quantityErrorMessages,
      amountErrorMessages,
      testNote,
      approveNote,
      testDate,
      approveDate,
    } = this.state;

    this.setState({
      quantityErrorMessages: Array(orderDetails.length).fill('', 0, orderDetails.length),
      amountErrorMessages: Array(orderDetails.length).fill('', 0, orderDetails.length),
    });
    setErrorMessage('');

    let hasError = false;
    orderDetails.forEach((e, index) => {
      if (e.quantity === '') {
        hasError = true;
        quantityErrorMessages[index] = 'Cần nhập vào số lượng';
      }
      if (!e.quantity.toString().match(/^\d+$/) || Number(e.quantity) < 1) {
        hasError = true;
        quantityErrorMessages[index] = 'Số lượng cần phải là số nguyên dương';
      }
      if (orderType === 'O' && e.quantity > e.stock_quantity - e.minimum_quantity) {
        hasError = true;
        quantityErrorMessages[index] = 'Số lượng vượt quá cho phép';
      }
      if (e.amount === '') {
        hasError = true;
        amountErrorMessages[index] = 'Cần nhập vào thành tiền';
      }
      if (!e.amount.toString().match(/^\d+$/) || Number(e.amount) < 1) {
        hasError = true;
        quantityErrorMessages[index] = 'Thành tiền không đúng định dạng';
      }
    });
    this.setState({ materialIDErrorMessages, quantityErrorMessages, amountErrorMessages });

    if (
      new Set(
        orderDetails.map((e) => {
          return `${e.material_id}-${e.quality}`;
        })
      ).size !== orderDetails.length
    ) {
      hasError = true;
      setErrorMessage('Có mã vật tư bị trùng. Vui lòng kiểm tra lại');
    }
    if (JSON.stringify(origninalOrderDetails) === JSON.stringify(orderDetails)) {
      hasError = true;
      setErrorMessage('Yêu cầu chưa bị thay đổi. Vui lòng kiểm tra lại');
    } else if ((auth.role === 'phongkythuat' && testNote.trim() === '') || (auth.role === 'phongketoan' && approveNote.trim() === '')) {
      hasError = true;
      setErrorMessage('Cần nhập nội dung điều chỉnh. Vui lòng kiểm tra lại');
    }

    if (hasError) {
      return;
    }
    if (orderType === 'O') {
      setLoading(true);
      const getCurrentStockResult = await getStockList(auth.companyID);
      setLoading(false);
      orderDetails.forEach((e) => {
        const currentRecord = getCurrentStockResult.data.find((item) => item.material_id === e.material_id && item.quality === e.quality);
        if (currentRecord == null || e.quantity > currentRecord.stock_quantity - currentRecord.minimum_quantity) {
          hasError = true;
          setErrorMessage('Dữ liệu kho đã bị thay đổi. Vui lòng tải lại trang để có giá trị mới nhất.');
        }
      });
    }
    if (hasError) {
      return;
    }
    const orderChanges = [];
    orderDetails.forEach((e, index) => {
      if (e.quality !== origninalOrderDetails[index].quality) {
        orderChanges.push({
          order_details_id: e.order_details_id,
          changed_field: 'quality',
          old_value: origninalOrderDetails[index].quality,
          new_value: e.quality,
        });
      }
      if (e.quantity !== origninalOrderDetails[index].quantity) {
        orderChanges.push({
          order_details_id: e.order_details_id,
          changed_field: 'quantity',
          old_value: origninalOrderDetails[index].quantity,
          new_value: e.quantity,
        });
      }
      if (e.amount !== origninalOrderDetails[index].amount) {
        orderChanges.push({
          order_details_id: e.order_details_id,
          changed_field: 'amount',
          old_value: origninalOrderDetails[index].amount,
          new_value: e.amount,
        });
      }
    });
    setLoading(true);
    await addOrderChangesHistory(orderChanges, auth.userID);
    const getUpdateOrderDetailsResult = await updateOrderDetails(orderDetails, auth.userID);
    setLoading(false);
    if (getUpdateOrderDetailsResult.data.length !== orderDetails.length) {
      setErrorMessage('Có lỗi khi điều chỉnh yêu cầu.');
      return;
    }
    if (auth.role === 'phongkythuat') {
      setLoading(true);
      const getUpdateOrderInfoResult = await updateOrderInfo(orderID, 'need approve', testNote, approveNote, auth.userID, testDate, '');
      setLoading(false);
      if (getUpdateOrderInfoResult.data === 1) {
        setSubmitResult('Yêu cầu đã được nghiệm thu!');
      } else {
        setErrorMessage('Có lỗi khi nghiệm thu yêu cầu.');
      }
    }
    if (auth.role === 'phongketoan') {
      setLoading(true);
      const getStockInResult =
        orderType === 'I' ? await stockIn(orderDetails, auth.companyID, auth.userID) : await stockOut(orderDetails, auth.companyID, auth.userID);
      setLoading(false);
      if (getStockInResult.data.length !== orderDetails.length) {
        setErrorMessage('Có lỗi khi phê duyệt yêu cầu.');
        return;
      }
      setLoading(true);
      const getUpdateOrderInfoResult = await updateOrderInfo(orderID, 'completed', testNote, approveNote, auth.userID, '', approveDate);
      setLoading(false);
      if (getUpdateOrderInfoResult.data === 1) {
        setSubmitResult('Yêu cầu đã được phê duyệt!');
      } else {
        setErrorMessage('Có lỗi khi phê duyệt yêu cầu.');
      }
    }
  };

  reject = async () => {
    const { setErrorMessage, setLoading, setSubmitResult, auth } = this.props;
    const { orderID, testNote, approveNote } = this.state;
    if ((auth.role === 'phongkythuat' && testNote.trim() === '') || (auth.role === 'phongketoan' && approveNote.trim() === '')) {
      setErrorMessage('Cần nhập nội dung điều chỉnh. Vui lòng kiểm tra lại');
      return;
    }
    setLoading(true);
    const getUpdateOrderInfoResult = await updateOrderInfo(orderID, 'cancel', testNote, approveNote, auth.userID);
    setLoading(false);
    if (getUpdateOrderInfoResult.data === 1) {
      setSubmitResult('Yêu cầu đã bị huỷ thành công!');
    } else {
      setErrorMessage('Có lỗi khi huỷ yêu cầu.');
    }
  };

  approve = async () => {
    const { setErrorMessage, setLoading, setSubmitResult, auth } = this.props;
    const { orderID, orderType, origninalOrderDetails, testNote, approveNote, testDate, approveDate } = this.state;

    if (auth.role === 'phongkythuat') {
      setLoading(true);
      const getUpdateOrderInfoResult = await updateOrderInfo(orderID, 'need approve', testNote, approveNote, auth.userID, testDate, '');
      setLoading(false);
      if (getUpdateOrderInfoResult.data === 1) {
        setSubmitResult('Yêu cầu đã được nghiệm thu!');
      } else {
        setErrorMessage('Có lỗi khi nghiệm thu yêu cầu.');
      }
      return;
    }
    if (auth.role === 'phongketoan') {
      setLoading(true);
      const getStockInResult =
        orderType === 'I'
          ? await stockIn(origninalOrderDetails, auth.companyID, auth.userID)
          : await stockOut(origninalOrderDetails, auth.companyID, auth.userID);
      setLoading(false);
      if (getStockInResult.data.length !== origninalOrderDetails.length) {
        setErrorMessage('Có lỗi khi phê duyệt yêu cầu.');
        return;
      }
      setLoading(true);
      const getUpdateOrderInfoResult = await updateOrderInfo(orderID, 'completed', testNote, approveNote, auth.userID, '', approveDate);
      setLoading(false);
      if (getUpdateOrderInfoResult.data === 1) {
        setSubmitResult('Yêu cầu đã được phê duyệt!');
      } else {
        setErrorMessage('Có lỗi khi phê duyệt yêu cầu.');
      }
    }
  };

  formatDate = (inputDate) => {
    if (typeof inputDate === 'string') {
      return inputDate;
    }
    if (inputDate === undefined) {
      return this.formatDate(new Date());
    }
    const yyyy = inputDate.getFullYear().toString();
    const mm = `0${inputDate.getMonth() + 1}`.slice(-2);
    const dd = `0${inputDate.getDate()}`.slice(-2);
    return `${dd}/${mm}/${yyyy}`;
  };

  downloadStockInRecipe = async () => {
    const { auth, setErrorMessage } = this.props;
    const { orderID } = this.state;
    await exportStockInOrderRecipe(orderID, auth.companyID)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Phieu_nhap_kho.xlsx');
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => {
        setErrorMessage('Có lỗi xảy ra khi xuất file báo cáo. Vui lòng thử lại');
      });
  };

  downloadStockOutRecipe = async () => {
    const { auth, setErrorMessage } = this.props;
    const { orderID } = this.state;
    await exportStockOutOrderRecipe(orderID, auth.companyID)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Phieu_xuat_kho.xlsx');
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => {
        setErrorMessage('Có lỗi xảy ra khi xuất file báo cáo. Vui lòng thử lại');
      });
  };

  downloadTestRecipe = async () => {
    const { auth, setErrorMessage } = this.props;
    const { orderID } = this.state;
    await exportTestRecipe(orderID, auth.companyID)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Bien_ban_kiem_nghiem.xlsx');
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => {
        setErrorMessage('Có lỗi xảy ra khi xuất file báo cáo. Vui lòng thử lại');
      });
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common, auth } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      orderID,
      orderType,
      requestor,
      requestDate,
      requestNote,
      consumer,
      orderName,
      orderDetails,
      quantityErrorMessages,
      amountErrorMessages,
      testNote,
      approveNote,
      supplier,
      no,
      co,
      recipeNo,
      deliver,
      testDate,
      approveDate,
      tester,
      approver,
      requestorName,
      supplierName,
      orderStatus,
      attachedDocument,
      stockNo,
      address,
    } = this.state;

    const qualityList = [
      { id: 'Mới', label: 'Mới' },
      { id: 'Loại I', label: 'Loại I' },
      { id: 'Loại II', label: 'Loại II' },
      { id: 'Phế liệu', label: 'Phế liệu' },
    ];

    return (
      <div className="spec-add">
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
          <h4>Chi tiết yêu cầu {orderID}</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="orderID-TextInput" labelText="Mã yêu cầu" value={orderID} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="orderType-TextInput" labelText="Loại yêu cầu" value={orderName} disabled />
            </div>
            {orderType === 'I' && (
              <div className="bx--col-lg-3 bx--col-md-3">
                <TextInput id="reason-TextInput" labelText="Lí do lập yêu cầu" value={requestNote} disabled />
              </div>
            )}
            {orderType === 'O' && (
              <div className="bx--col-lg-3 bx--col-md-3">
                <TextInput id="consumer-TextInput" labelText="Đối tượng thụ hưởng" value={consumer} disabled />
              </div>
            )}
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="requestor-TextInput" labelText="Người yêu cầu" value={requestorName} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="requestDate-TextInput" labelText="Ngày lập yêu cầu" value={requestDate} disabled />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="no-TextInput" labelText="Nợ" value={no} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="co-TextInput" labelText="Có" value={co} disabled />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              {orderType === 'I' && <TextInput id="supplier-TextInput" labelText="Đơn vị cung cấp" value={supplierName} disabled />}
              {orderType === 'O' && <TextInput id="recipeNo-TextInput" labelText="Khoản mục" value={recipeNo} disabled />}
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              {orderType === 'O' && <TextInput id="supplier-TextInput" labelText="Tổ" value={supplier} disabled />}
              {orderType === 'I' && <TextInput id="recipeNo-TextInput" labelText="Mã hoá đơn" value={recipeNo} disabled />}
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="deliver-TextInput" labelText={orderType === 'I' ? 'Người giao hàng' : 'Cấp sửa chữa'} value={deliver} disabled />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="stockNo-TextInput" labelText={orderType === 'I' ? 'Nhập tại kho' : 'Xuất tại kho (ngăn lô)'} value={stockNo} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="address-TextInput" labelText="Địa điểm" value={address} disabled />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput id="attachedDocument-TextInput" labelText="Số chứng từ gốc kèm theo" value={attachedDocument} disabled />
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          {(auth.role === 'phongkythuat' || auth.role === 'phongkehoach') && (
            <div className="bx--row">
              <div className="bx--col-lg-3 bx--col-md-3">
                <TextInput
                  id="testNote-TextInput"
                  labelText="Nội dung điều chỉnh"
                  value={testNote}
                  onChange={(e) => this.setState({ testNote: e.target.value })}
                  disabled={orderStatus === 'completed'}
                />
              </div>
              <div className="bx--col-lg-4">
                <Button
                  onClick={() => this.adjustAndApprove()}
                  style={{ marginTop: '1rem', marginRight: '1rem' }}
                  disabled={orderID === '' || orderStatus !== 'need test' || tester !== auth.userID}
                >
                  Điều chỉnh và nghiệm thu
                </Button>
                <Button
                  onClick={() => this.approve()}
                  style={{ marginTop: '1rem' }}
                  disabled={orderID === '' || orderStatus !== 'need test' || tester !== auth.userID}
                >
                  Nghiệm thu
                </Button>
              </div>
              <div className="bx--col-lg-2 bx--col-md-2">
                <DatePicker datePickerType="single" dateFormat="d/m/Y" onChange={(e) => this.setState({ testDate: this.formatDate(e[0]) })} value={testDate}>
                  <DatePickerInput
                    datePickerType="single"
                    placeholder={auth.userID === requestor ? '' : 'dd/mm/yyyy'}
                    labelText="Ngày nghiệm thu"
                    id="testDate-datepicker"
                    disabled={orderID === '' || auth.userID === requestor}
                  />
                </DatePicker>
              </div>
              <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
              <div className="bx--col-lg-2 bx--col-md-2">
                <Button
                  onClick={() => this.reject()}
                  style={{ marginTop: '1rem', backgroundColor: '#da1e28' }}
                  disabled={orderID === '' || orderStatus === 'completed'}
                >
                  Huỷ yêu cầu
                </Button>
              </div>
            </div>
          )}
          {auth.role === 'phongketoan' && (
            <div className="bx--row">
              <div className="bx--col-lg-3 bx--col-md-3">
                <TextInput
                  id="approveNote-TextInput"
                  labelText="Nội dung điều chỉnh"
                  value={approveNote}
                  onChange={(e) => this.setState({ approveNote: e.target.value })}
                />
              </div>
              <div className="bx--col-lg-4">
                <Button
                  onClick={() => this.adjustAndApprove()}
                  style={{ marginTop: '1rem', marginRight: '1rem' }}
                  disabled={orderID === '' || approver !== auth.userID || orderStatus !== 'need approve'}
                >
                  Điều chỉnh và phê duyệt
                </Button>
                <Button
                  onClick={() => this.approve()}
                  style={{ marginTop: '1rem' }}
                  disabled={orderID === '' || approver !== auth.userID || orderStatus !== 'need approve'}
                >
                  Phê duyệt
                </Button>
              </div>
              <div className="bx--col-lg-2 bx--col-md-2">
                <DatePicker
                  datePickerType="single"
                  dateFormat="d/m/Y"
                  onChange={(e) => this.setState({ approveDate: this.formatDate(e[0]) })}
                  value={approveDate}
                >
                  <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ngày phê duyệt" id="approveDate-datepicker" />
                </DatePicker>
              </div>
              <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
              <div className="bx--col-lg-2 bx--col-md-2">
                <Button onClick={() => this.reject()} style={{ marginTop: '1rem' }} disabled={orderID === ''}>
                  Huỷ yêu cầu
                </Button>
              </div>
            </div>
          )}
        </div>
        <br />
        <br />
        <div className="bx--grid">
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-6">
              <strong>Chú ý:</strong>
              <br />
              <ul>
                <li> - Nếu cần điều chỉnh, vui lòng nhập lý do điều chỉnh.</li>
                <li> - Nếu phải huỷ bỏ yêu cầu, vui lòng nhập lý do trong phần điều chỉnh.</li>
                <li> - Mọi điều chỉnh sẽ được lưu lại.</li>
              </ul>
            </div>
            <div className="bx--col-lg-6">
              <Button
                onClick={() => this.downloadTestRecipe()}
                style={{ marginTop: '1rem', marginRight: '1rem' }}
                disabled={orderID === '' || auth.userID !== tester}
              >
                Download biên bản nghiệm thu
              </Button>
              <Button
                onClick={() => (orderType === 'I' ? this.downloadStockInRecipe() : this.downloadStockOutRecipe())}
                style={{ marginTop: '1rem' }}
                disabled={orderID === '' || (auth.userID !== requestor && auth.userID !== approver)}
              >
                {orderType === 'I' ? 'Download phiếu nhập kho' : 'Download phiếu xuất kho'}
              </Button>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title="Chi tiết danh mục vật tư">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader key="stt">STT</TableHeader>
                      <TableHeader key="materialID">Mã vật tư</TableHeader>
                      <TableHeader key="materialName">Tên vật tư</TableHeader>
                      <TableHeader key="unit">Đơn vị</TableHeader>
                      <TableHeader key="quality">Chất lượng</TableHeader>
                      <TableHeader key="quantity">Số lượng</TableHeader>
                      {orderType === 'O' && <TableHeader key="stock_quantity">Lượng tồn trong kho</TableHeader>}
                      {orderType === 'O' && <TableHeader key="minimum_quantity">Lượng tồn tối thiểu</TableHeader>}
                      {orderType === 'O' && <TableHeader key="price">Đơn giá tại kho</TableHeader>}
                      <TableHeader key="amount">Thành tiền</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetails.map((row, index) => (
                      <TableRow key={row.id}>
                        <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                        <TableCell key={`material-${index.toString()}`}>{orderDetails[index].material_id}</TableCell>
                        <TableCell key={`materialName-${index.toString()}`}>{orderDetails[index].material_name}</TableCell>
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
                            disabled={orderType === 'O' || orderStatus === 'completed'}
                          />
                        </TableCell>
                        <TableCell key={`quantity-${index.toString()}`}>
                          <TextInput
                            id={`quantity-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              quantityErrorMessages[index] = '';
                              const quantity = e.target.value;
                              if (quantity === '') {
                                return;
                              }
                              if (!quantity.match(/^\d+$/) || Number(quantity) < 1) {
                                quantityErrorMessages[index] = 'Số lượng không hợp lệ';
                                this.setState({ quantityErrorMessages });
                                return;
                              }
                              if (Number(quantity) > orderDetails[index].stock_quantity - orderDetails[index].minimum_quantity) {
                                quantityErrorMessages[index] = 'Số lượng vượt quá cho phép';
                                this.setState({ quantityErrorMessages });
                                return;
                              }
                              orderDetails[index].quantity = Number(e.target.value);
                              this.setState({ orderDetails, quantityErrorMessages });
                            }}
                            value={orderDetails[index].quantity}
                            invalid={quantityErrorMessages[index] !== ''}
                            invalidText={quantityErrorMessages[index]}
                            disabled={orderStatus === 'completed'}
                          />
                        </TableCell>
                        {orderType === 'O' && <TableCell key={`stock-quantity-${index.toString()}`}>{orderDetails[index].stock_quantity}</TableCell>}
                        {orderType === 'O' && <TableCell key={`minimum-quantity-${index.toString()}`}>{orderDetails[index].minimum_quantity}</TableCell>}
                        {orderType === 'O' && <TableCell key={`stock-price-${index.toString()}`}>{orderDetails[index].price}</TableCell>}
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
                            disabled={orderStatus === 'completed'}
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

OrderDetails.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(OrderDetails);
