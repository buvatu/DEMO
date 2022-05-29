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
  Select,
  SelectItem,
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
import { CurrencyFormatter } from '../../constants';
import { addOrder, addOrderDetails, getEngineListByCompany, getStockList, getUserList } from '../../services';

class StockOutOrder extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reason: '',
      reasonErrorMessage: '',
      engineID: '',
      engineList: [],
      consumer: '',
      consumerErrorMessage: '',
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
      qualityErrorMessages: [],
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
    const getEngineListResult = await getEngineListByCompany(auth.companyID);
    const getMaterialListResult = await getStockList(auth.companyID);
    setLoading(false);
    const engineList = getEngineListResult.data.map((e) => {
      return { id: e.engine_id, label: e.engine_id };
    });
    engineList.push({ id: 'other', label: 'Đối tượng khác' });
    this.setState({
      testerList: getTesterListResult.data.map((e) => {
        return { id: e.user_id, label: e.username };
      }),
      approverList: getApproverListResult.data.map((e) => {
        return { id: e.user_id, label: e.username };
      }),
      engineList,
      materialList: getMaterialListResult.data,
      supplierList: [
        { id: 'Tổ Điện', label: 'Tổ Điện' },
        { id: 'Tổ Khung Gầm', label: 'Tổ Khung Gầm' },
        { id: 'Tổ Động cơ', label: 'Tổ Động cơ' },
        { id: 'Tổ Hãm', label: 'Tổ Hãm' },
        { id: 'Tổ Cơ khí', label: 'Tổ Cơ khí' },
        { id: 'Tổ Truyền động', label: 'Tổ Truyền động' },
      ],
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
      qualityErrorMessages,
      engineID,
      consumer,
      materialList,
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

    let hasError = false;
    this.setState({
      reasonErrorMessage: '',
      testerErrorMessage: '',
      approverErrorMessage: '',
      consumerErrorMessage: '',
      materialIDErrorMessages: Array(orderDetails.length).fill('', 0, orderDetails.length),
      qualityErrorMessages: Array(orderDetails.length).fill('', 0, orderDetails.length),
      quantityErrorMessages: Array(orderDetails.length).fill('', 0, orderDetails.length),
      amountErrorMessages: Array(orderDetails.length).fill('', 0, orderDetails.length),
    });
    setErrorMessage('');

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
    if (engineID.trim() === '') {
      hasError = true;
      this.setState({ consumerErrorMessage: 'Đầu máy không thể bỏ trống' });
    }
    if (engineID === 'other' && consumer === '') {
      hasError = true;
      this.setState({ consumerErrorMessage: 'Cần chọn đối tượng tiêu thụ khác' });
    }
    orderDetails.forEach((e, index) => {
      if (e.material_id === '') {
        hasError = true;
        materialIDErrorMessages[index] = 'Mã vật tư không thể bỏ trống';
      }
      if (e.quality === '') {
        hasError = true;
        qualityErrorMessages[index] = 'Cần chọn chất lượng sản phẩm';
      }
      if (e.quantity === '') {
        hasError = true;
        quantityErrorMessages[index] = 'Cần nhập vào số lượng';
      }
      if (!e.quantity.toString().match(/^\d+$/) || Number(e.quantity) < 1) {
        hasError = true;
        quantityErrorMessages[index] = 'Số lượng cần phải là số nguyên dương';
      }
      if (e.quantity > e.stock_quantity - e.minimum_quantity) {
        hasError = true;
        quantityErrorMessages[index] = 'Số lượng vượt quá cho phép';
      }
      if (e.amount === '') {
        hasError = true;
        amountErrorMessages[index] = 'Cần nhập vào thành tiền';
      }
      // eslint-disable-next-line no-restricted-globals
      if (isNaN(e.amount) || Number(e.amount) < 1) {
        hasError = true;
        amountErrorMessages[index] = 'Thành tiền không đúng định dạng';
      }
      const stockRecord = materialList.find((item) => item.material_id === e.material_id && item.quality === e.quality);
      if (stockRecord == null) {
        hasError = true;
        materialIDErrorMessages[index] = 'Trong kho không có loại vật tư tương ứng';
      }
    });
    this.setState({ materialIDErrorMessages, qualityErrorMessages, quantityErrorMessages, amountErrorMessages });
    if (orderDetails.length === 0) {
      hasError = true;
      setErrorMessage('Mỗi yêu cầu cần ít nhất 1 danh mục vật tư');
    }

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
    if (hasError) {
      return;
    }
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
    if (hasError) {
      return;
    }
    setLoading(true);
    const getAddOrderResult = await addOrder(
      'O',
      'Yêu cầu xuất kho',
      'need test',
      engineID === 'other' ? consumer : engineID,
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
      engineID,
      engineList,
      consumer,
      consumerErrorMessage,
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
      qualityErrorMessages,
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

    const materialIDs = [
      ...new Set(
        materialList
          .map((e) => {
            return { id: e.material_id, label: e.material_id.concat(' - ').concat(e.material_name) };
          })
          .sort((a, b) => a.label.split(' - ')[1].localeCompare(b.label.split(' - ')[1]))
      ),
    ];

    const qualityList = [
      { id: 'Mới', label: 'Mới' },
      { id: 'Loại I', label: 'Loại I' },
      { id: 'Loại II', label: 'Loại II' },
      { id: 'Phế liệu', label: 'Phế liệu' },
    ];

    const deliverList = [
      { id: 'Đột xuất', label: 'Đột xuất' },
      { id: 'Ro', label: 'Ro' },
      { id: 'Rt', label: 'Rt' },
      { id: 'R1', label: 'R1' },
      { id: 'R2', label: 'R2' },
      { id: 'Đại tu', label: 'Đại tu' },
    ];

    return (
      <div className="stock-out">
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
          <h4>Yêu cầu xuất kho</h4>
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
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="engineID-Dropdown"
                titleText="Đầu máy tiêu thụ"
                label=""
                items={engineList}
                selectedItem={engineID === '' ? null : engineList.find((e) => e.id === engineID)}
                onChange={(e) => this.setState({ engineID: e.selectedItem.id, consumer: '', consumerErrorMessage: '' })}
                invalid={consumerErrorMessage !== '' && engineID === ''}
                invalidText={consumerErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="consumer-TextInput"
                labelText="Đối tượng tiêu thụ khác"
                value={consumer}
                onChange={(e) => this.setState({ consumer: e.target.value })}
                disabled={engineID !== 'other'}
                invalid={consumerErrorMessage !== '' && engineID === 'other'}
                invalidText={consumerErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="supplier-Dropdown"
                titleText="Tổ"
                label=""
                items={supplierList}
                selectedItem={supplier === '' ? null : supplierList.find((e) => e.id === supplier)}
                onChange={(e) => this.setState({ supplier: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="deliver-Dropdown"
                titleText="Cấp sửa chữa"
                label=""
                items={deliverList}
                selectedItem={deliver === '' ? null : deliverList.find((e) => e.id === deliver)}
                onChange={(e) => this.setState({ deliver: e.selectedItem.id })}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="no-TextInput" placeholder="" labelText="Nợ" value={no} onChange={(e) => this.setState({ no: e.target.value })} />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="co-TextInput" placeholder="" labelText="Có" value={co} onChange={(e) => this.setState({ co: e.target.value })} />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <Select id="recipeNo-select" labelText="Khoản mục" onChange={(e) => this.setState({ recipeNo: e.target.value })} defaultValue={recipeNo}>
                <SelectItem value="" text="" />
                <SelectItem value="Công tác đón gửi tàu ở ga" text="Công tác đón gửi tàu ở ga" />
                <SelectItem value="Công tác dồn tàu ở ga" text="Công tác dồn tàu ở ga" />
                <SelectItem value="Công tác hàng hóa ở ga" text="Công tác hàng hóa ở ga" />
                <SelectItem value="Công tác HK,HL ở ga" text="Công tác HK,HL ở ga" />
                <SelectItem value="Công tác tiếp thị - phát triển thị trường" text="Công tác tiếp thị - phát triển thị trường" />
                <SelectItem value="Công tác kiểm tra kỹ thuật chỉnh bị toa xe khách" text="Công tác kiểm tra kỹ thuật chỉnh bị toa xe khách" />
                <SelectItem value="Công tác kiểm tra kỹ thuật chỉnh bị toa xe khách" text="Công tác kiểm tra kỹ thuật chỉnh bị toa xe khách" />
                <SelectItem value="Công tác kiểm tra và tu bổ toa xe hàng" text="Công tác kiểm tra và tu bổ toa xe hàng" />
                <SelectItem value="Công tác làm dầu, bơm mỡ, khám và sửa bộ phận hãm" text="Công tác làm dầu, bơm mỡ, khám và sửa bộ phận hãm" />
                <SelectItem value="Công tác cấp nước bổ xung lên tàu" text="Công tác cấp nước bổ xung lên tàu" />
                <SelectItem value="Công tác chạy máy phát điện trên tàu" text="Công tác chạy máy phát điện trên tàu" />
                <SelectItem value="Công tác phục vụ chạy tàu hàng, tàu khách" text="Công tác phục vụ chạy tàu hàng, tàu khách" />
                <SelectItem value="Phục vụ ăn, uống trên tàu khách" text="Phục vụ ăn, uống trên tàu khách" />
                <SelectItem value="Công tác cứu viện" text="Công tác cứu viện" />
                <SelectItem value="Sửa chữa nhỏ toa xe" text="Sửa chữa nhỏ toa xe" />
                <SelectItem
                  value="Công tác chuẩn bị kiểm tra giữa kỳ, cấp nhiên liệu, nước ĐM"
                  text="Công tác chuẩn bị kiểm tra giữa kỳ, cấp nhiên liệu, nước ĐM"
                />
                <SelectItem value="Công tác lái máy" text="Công tác lái máy" />
                <SelectItem value="Nhiên liệu chạy tàu" text="Nhiên liệu chạy tàu" />
                <SelectItem value="Nhiên liệu phụ của đầu máy" text="Nhiên liệu phụ của đầu máy" />
                <SelectItem value="Công tác bảo dưỡng, sửa chữa dưới cấp 3" text="Công tác bảo dưỡng, sửa chữa dưới cấp 3" />
                <SelectItem value="Công tác sửa chữa cấp 3" text="Công tác sửa chữa cấp 3" />
                <SelectItem value="Công tác sửa chữa cấp KY đầu máy" text="Công tác sửa chữa cấp KY đầu máy" />
                <SelectItem value="Chi phí phát sinh khác - Phần A" text="Chi phí phát sinh khác - Phần A" />
                <SelectItem value="Duy tu MMTB, nhà xưởng, công trình kiến trúc" text="Duy tu MMTB, nhà xưởng, công trình kiến trúc" />
                <SelectItem value="Phương tiện vận chuyển nội bộ" text="Phương tiện vận chuyển nội bộ" />
                <SelectItem value="Nhiên liệu phục vụ sản xuất" text="Nhiên liệu phục vụ sản xuất" />
                <SelectItem value="Điện phục vụ sản xuất" text="Điện phục vụ sản xuất" />
                <SelectItem value="Bổ trợ và phục vụ sản xuất" text="Bổ trợ và phục vụ sản xuất" />
                <SelectItem value="Gián tiếp của công nhân trực tiếp" text="Gián tiếp của công nhân trực tiếp" />
                <SelectItem value="Công tác quản lý sản xuất" text="Công tác quản lý sản xuất" />
                <SelectItem value="Công tác y tế" text="Công tác y tế" />
                <SelectItem value="Bảo hiểm y tế" text="Bảo hiểm y tế" />
                <SelectItem value="Bảo hiểm xã hội" text="Bảo hiểm xã hội" />
                <SelectItem value="Kinh phí công đoàn" text="Kinh phí công đoàn" />
                <SelectItem value="Chi chế độ cho CBCNV" text="Chi chế độ cho CBCNV" />
                <SelectItem value="Đào tạo,BD N/vụ, tuyển dụng và quân sự" text="Đào tạo,BD N/vụ, tuyển dụng và quân sự" />
                <SelectItem value="Thông tin tuyên truyền, quảng cáo" text="Thông tin tuyên truyền, quảng cáo" />
                <SelectItem value="Phòng bão, lũ và hỏa hoạn" text="Phòng bão, lũ và hỏa hoạn" />
                <SelectItem value="Cải thiện điều kiện làm việc cho CBCNV" text="Cải thiện điều kiện làm việc cho CBCNV" />
                <SelectItem value="Sáng kiến cải tiến, chế thử và NC KHKT" text="Sáng kiến cải tiến, chế thử và NC KHKT" />
                <SelectItem value="Thuê trông coi, bảo quản ĐMTX" text="Thuê trông coi, bảo quản ĐMTX" />
                <SelectItem value="Chi trả sử dụng đầu máy, toa xe LVQT" text="Chi trả sử dụng đầu máy, toa xe LVQT" />
                <SelectItem value="Chi trả sử dụng đầu máy" text="Chi trả sử dụng đầu máy" />
                <SelectItem value="Chi trả công tác đón gửi" text="Chi trả công tác đón gửi" />
                <SelectItem value="Chi trả tác nghiệp đầu cuối" text="Chi trả tác nghiệp đầu cuối" />
                <SelectItem value="Chi trả kiểm tra, cấp nước xe khách" text="Chi trả kiểm tra, cấp nước xe khách" />
                <SelectItem value="Chi trả sử dụng toa xe khách" text="Chi trả sử dụng toa xe khách" />
                <SelectItem value="Sửa chữa lớn TSCĐ" text="Sửa chữa lớn TSCĐ" />
                <SelectItem value="Khấu hao cơ bản TSCĐ" text="Khấu hao cơ bản TSCĐ" />
                <SelectItem value="Lệ phí cơ sở hạ tầng" text="Lệ phí cơ sở hạ tầng" />
                <SelectItem value="Chi trả sử dụng vốn vay dự án đầu tư tập trung" text="Chi trả sử dụng vốn vay dự án đầu tư tập trung" />
                <SelectItem value="Chi trả tiền lãi vay tín dụng" text="Chi trả tiền lãi vay tín dụng" />
                <SelectItem value="Chi trả sử dụng đất" text="Chi trả sử dụng đất" />
                <SelectItem value="Đền bù tai nạn, phạt hợp đồng" text="Đền bù tai nạn, phạt hợp đồng" />
                <SelectItem value="Chi hoạt động công tác đoàn thể" text="Chi hoạt động công tác đoàn thể" />
                <SelectItem value="Chi phí giao dịch, hội nghị, tiếp khách" text="Chi phí giao dịch, hội nghị, tiếp khách" />
                <SelectItem value="Chi phí phát sinh khác - Phần B" text="Chi phí phát sinh khác - Phần B" />
                <SelectItem value="Dịch vụ ngoài vận tải" text="Dịch vụ ngoài vận tải" />
              </Select>
            </div>
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
                labelText="Xuất tại kho (ngăn lô)"
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
                    quality: '',
                    quantity: '',
                    minimum_quantity: '',
                    amount: '',
                  });
                  materialIDErrorMessages.push('');
                  qualityErrorMessages.push('');
                  quantityErrorMessages.push('');
                  amountErrorMessages.push('');
                  this.setState({ orderDetails, materialIDErrorMessages, quantityErrorMessages, amountErrorMessages });
                }}
                style={{ marginTop: '1rem' }}
              >
                Thêm vật tư
              </Button>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                onClick={() => {
                  this.setState({
                    orderDetails: orderDetails.filter((e, index) => !selectedLines.includes(index)),
                    materialIDErrorMessages: materialIDErrorMessages.filter((e, index) => !selectedLines.includes(index)),
                    qualityErrorMessages: qualityErrorMessages.filter((e, index) => !selectedLines.includes(index)),
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
              <TableContainer title="Chi tiết danh mục xuất kho">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader />
                      <TableHeader key="stt">STT</TableHeader>
                      <TableHeader key="materialID" style={{ minWidth: '25%' }}>
                        Mã vật tư - Tên vật tư
                      </TableHeader>
                      <TableHeader key="unit" style={{ width: '5rem' }}>
                        Đơn vị
                      </TableHeader>
                      <TableHeader key="quality" style={{ width: '10rem' }}>
                        Chất lượng
                      </TableHeader>
                      <TableHeader key="quantity" style={{ width: '10rem' }}>
                        Số lượng
                      </TableHeader>
                      <TableHeader key="stock_quantity">Lượng tồn trong kho</TableHeader>
                      <TableHeader key="minimum_quantity">Lượng tồn tối thiểu</TableHeader>
                      <TableHeader key="price" style={{ width: '7rem' }}>
                        Đơn giá
                      </TableHeader>
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
                              materialIDErrorMessages[index] = '';
                              amountErrorMessages[index] = '';
                              qualityErrorMessages[index] = '';
                              quantityErrorMessages[index] = '';
                              const selectedMaterialID = e.selectedItem === null ? '' : e.selectedItem.id;
                              if (selectedMaterialID === '') {
                                orderDetails[index].material_id = '';
                                orderDetails[index].material_name = '';
                                orderDetails[index].unit = '';
                                orderDetails[index].quality = '';
                                orderDetails[index].quantity = '';
                                orderDetails[index].stock_quantity = '';
                                orderDetails[index].minimum_quantity = '';
                                orderDetails[index].price = '';
                                orderDetails[index].amount = '';
                              } else {
                                orderDetails[index].material_id = selectedMaterialID;
                                orderDetails[index].material_name = materialList.find((item) => item.material_id === selectedMaterialID).material_name;
                                orderDetails[index].unit = materialList.find((item) => item.material_id === selectedMaterialID).unit;
                                if (orderDetails[index].quality !== '') {
                                  const stockRecord = materialList.find(
                                    (item) => item.material_id === selectedMaterialID && item.quality === orderDetails[index].quality
                                  );
                                  if (stockRecord == null) {
                                    materialIDErrorMessages[index] = 'Trong kho không có loại vật tư tương ứng';
                                    orderDetails[index].quantity = '';
                                    orderDetails[index].stock_quantity = '';
                                    orderDetails[index].minimum_quantity = '';
                                    orderDetails[index].price = '';
                                    orderDetails[index].amount = '';
                                  } else {
                                    orderDetails[index].quantity = '';
                                    orderDetails[index].stock_quantity = stockRecord.quantity;
                                    orderDetails[index].minimum_quantity = stockRecord.minimum_quantity;
                                    orderDetails[index].price = stockRecord.price;
                                    orderDetails[index].amount = '';
                                  }
                                }
                              }
                              orderDetails[index].material_id = selectedMaterialID;
                              orderDetails[index].material_name =
                                selectedMaterialID === '' ? '' : materialList.find((item) => item.material_id === selectedMaterialID).material_name;
                              orderDetails[index].unit =
                                selectedMaterialID === '' ? '' : materialList.find((item) => item.material_id === selectedMaterialID).unit;
                              if (orderDetails[index].quality !== '') {
                                if (selectedMaterialID !== '') {
                                  const stockRecord = materialList.find(
                                    (item) => item.material_id === selectedMaterialID && item.quality === orderDetails[index].quality
                                  );
                                  orderDetails[index].price = stockRecord == null ? '' : stockRecord.price;
                                  orderDetails[index].stock_quantity = stockRecord == null ? '' : stockRecord.quantity;
                                } else {
                                  orderDetails[index].price = '';
                                  orderDetails[index].stock_quantity = '';
                                }
                              }
                              materialIDErrorMessages[index] = '';
                              this.setState({
                                orderDetails,
                                materialIDErrorMessages,
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
                              qualityErrorMessages[index] = '';
                              materialIDErrorMessages[index] = '';
                              if (orderDetails[index].material_id !== '') {
                                const stockRecord = materialList.find(
                                  (item) => item.material_id === orderDetails[index].material_id && item.quality === e.selectedItem.id
                                );
                                if (stockRecord == null) {
                                  materialIDErrorMessages[index] = 'Trong kho không có loại vật tư tương ứng';
                                  orderDetails[index].quantity = '';
                                  orderDetails[index].stock_quantity = '';
                                  orderDetails[index].minimum_quantity = '';
                                  orderDetails[index].price = '';
                                  orderDetails[index].amount = '';
                                } else {
                                  orderDetails[index].price = stockRecord.price;
                                  orderDetails[index].stock_quantity = stockRecord.quantity;
                                  orderDetails[index].minimum_quantity = stockRecord.minimum_quantity;
                                }
                              }
                              this.setState({ orderDetails, qualityErrorMessages });
                            }}
                            disabled={orderDetails[index].material_id === ''}
                            invalid={qualityErrorMessages[index] !== ''}
                            invalidText={qualityErrorMessages[index]}
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
                              orderDetails[index].amount = Number(e.target.value) * Number(orderDetails[index].price);
                              this.setState({ orderDetails });
                            }}
                            disabled={orderDetails[index].material_id === '' || orderDetails[index].quality === ''}
                            value={orderDetails[index].quantity}
                            invalid={quantityErrorMessages[index] !== ''}
                            invalidText={quantityErrorMessages[index]}
                          />
                        </TableCell>
                        <TableCell key={`stock-quantity-${index.toString()}`}>{orderDetails[index].stock_quantity}</TableCell>
                        <TableCell key={`minimum-quantity-${index.toString()}`}>{orderDetails[index].minimum_quantity}</TableCell>
                        <TableCell key={`price-${index.toString()}`}>{CurrencyFormatter.format(orderDetails[index].price)}</TableCell>
                        <TableCell key={`amount-${index.toString()}`}>
                          <TextInput
                            id={`amount-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              orderDetails[index].amount = e.target.value;
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

StockOutOrder.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(StockOutOrder);
