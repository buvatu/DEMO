import { CloudUpload32 } from '@carbon/icons-react';
import {
  Accordion,
  AccordionItem,
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
  Pagination,
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
import {
  addOrder,
  getAccountTitleList,
  getCategoryList,
  getEngineListByCompany,
  getMaterialListInStock,
  getOtherConsumerList,
  getUserList,
} from '../../services';

class StockOutOrder extends Component {
  constructor(props) {
    super(props);
    const { auth } = this.props;
    this.state = {
      orderInfo: {
        orderName: '',
        orderType: 'O',
        status: 'created',
        requestor: auth.userID,
        requestNote: '',
        requestDate: this.formatDate(new Date()),
        tester: '',
        testNote: '',
        approver: '',
        approveNote: '',

        consumer: '',
        repairGroup: '',
        repairLevel: '',

        no: '',
        co: '',
        attachedDocument: '',
        stockName: '',
        address: '',
        category: '',
        deliver: '',

        companyID: auth.companyID,
      },
      orderNameErrorMessage: '',
      requestNoteErrorMessage: '',
      testerErrorMessage: '',
      testerList: [],
      approverErrorMessage: '',
      approverList: [],
      orderDetailList: [],
      quantityErrorMessages: [],
      amountErrorMessages: [],
      categoryList: [],
      accountList: [],
      engineList: [],
      otherConsumerList: [],
      engineID: '',
      otherConsumer: '',
      engineIDErrorMessage: '',
      repairLevelErrorMessage: '',
      repairGroupErrorMessage: '',

      materialList: [],
      searchResult: [],
      materialListDisplay: [],
      page: 1,
      pageSize: 5,
      filterMaterialID: '',
      filterMaterialGroup: '',
      filterMatetrialName: '',
      filterMaterialType: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth, setErrorMessage } = this.props;
    setLoading(true);
    try {
      const getTesterListResult = await getUserList('', '', auth.companyID, 'phongkythuat');
      const getApproverListResult = await getUserList('', '', auth.companyID, 'phongketoantaichinh');
      const getMaterialListResult = await getMaterialListInStock(auth.companyID);
      const getCategoryListResult = await getCategoryList();
      const getOtherConsumerListResult = await getOtherConsumerList();
      const getEngineListResult = await getEngineListByCompany(auth.companyID);
      const getAccountListResult = await getAccountTitleList();
      this.setState({
        testerList: getTesterListResult.data.map((e) => {
          return { id: e.userID, label: e.username };
        }),
        approverList: getApproverListResult.data.map((e) => {
          return { id: e.userID, label: e.username };
        }),
        materialList: getMaterialListResult.data,
        searchResult: getMaterialListResult.data,
        materialListDisplay: getMaterialListResult.data.slice(0, 5),
        categoryList: [
          { id: '', label: '' },
          ...getCategoryListResult.data.map((e) => {
            return { id: e.categoryID, label: e.categoryID.concat(' - ').concat(e.categoryName) };
          }),
        ],
        accountList: [
          { id: '', label: '' },
          ...getAccountListResult.data.map((e) => {
            return { id: e.accountID, label: e.accountTitle.concat(' - ').concat(e.accountName) };
          }),
        ],
        otherConsumerList: [
          { id: '', label: '' },
          ...getOtherConsumerListResult.data.map((e) => {
            return { id: e.consumerID, label: e.consumerName };
          }),
        ],
        engineList: [
          ...getEngineListResult.data.map((e) => {
            return { id: e.engineID, label: e.engineID };
          }),
          { id: 'other', label: 'Kh??c' },
        ],
      });
    } catch {
      setErrorMessage('Kh??ng th??? t???i trang. Vui l??ng th??? l???i.');
    }
    setLoading(false);
  };

  save = async () => {
    const { setErrorMessage, setLoading, setSubmitResult } = this.props;
    const { orderInfo, orderDetailList, quantityErrorMessages, amountErrorMessages, engineID, otherConsumer, materialList } = this.state;

    this.setState({
      orderNameErrorMessage: '',
      requestNoteErrorMessage: '',
      testerErrorMessage: '',
      approverErrorMessage: '',
      engineIDErrorMessage: '',
      repairLevelErrorMessage: '',
      repairGroupErrorMessage: '',
      quantityErrorMessages: Array(orderDetailList.length).fill('', 0, orderDetailList.length),
      amountErrorMessages: Array(orderDetailList.length).fill('', 0, orderDetailList.length),
    });
    setErrorMessage('');

    let hasError = false;
    if (orderInfo.orderName.trim() === '') {
      hasError = true;
      this.setState({ orderNameErrorMessage: 'T??n y??u c???u kh??ng th??? b??? tr???ng' });
    }
    if (orderInfo.requestNote.trim() === '') {
      hasError = true;
      this.setState({ requestNoteErrorMessage: 'L?? do kh??ng th??? b??? tr???ng' });
    }
    if (orderInfo.tester === '') {
      hasError = true;
      this.setState({ testerErrorMessage: 'Ng?????i nghi???m thu kh??ng th??? b??? tr???ng' });
    }
    if (orderInfo.approver === '') {
      hasError = true;
      this.setState({ approverErrorMessage: 'Ng?????i ph?? duy???t kh??ng th??? b??? tr???ng' });
    }
    if (orderInfo.repairGroup === '') {
      hasError = true;
      this.setState({ repairGroupErrorMessage: 'T??? s???a ch???a kh??ng th??? b??? tr???ng' });
    }
    if (orderInfo.repairLevel === '' && engineID !== 'other') {
      hasError = true;
      this.setState({ repairLevelErrorMessage: 'C???p s???a ch???a kh??ng th??? b??? tr???ng' });
    }
    if (engineID === '') {
      hasError = true;
      this.setState({ engineIDErrorMessage: '?????u m??y ti??u th??? kh??ng th??? b??? tr???ng' });
    }

    if (orderDetailList.length === 0) {
      hasError = true;
      setErrorMessage('M???i y??u c???u c???n ??t nh???t 1 danh m???c v???t t??');
    }

    orderDetailList.forEach((e, index) => {
      if (e.requestQuantity === '') {
        hasError = true;
        quantityErrorMessages[index] = 'C???n nh???p v??o s??? l?????ng';
      }
      // eslint-disable-next-line no-restricted-globals
      if ((e.requestQuantity !== '' && isNaN(e.requestQuantity)) || Number(e.requestQuantity) < 1) {
        hasError = true;
        quantityErrorMessages[index] = 'S??? l?????ng kh??ng h???p l???';
      }
      const material = materialList.find((item) => item.materialID === e.materialID);
      if (Number(e.requestQuantity) > material.stockQuantity) {
        hasError = true;
        quantityErrorMessages[index] = 'S??? l?????ng v?????t qu?? l?????ng t???n trong kho';
      }
      if (material.minimumQuantity != null && material.stockQuantity - Number(e.requestQuantity) < material.minimumQuantity) {
        hasError = true;
        quantityErrorMessages[index] = 'S??? l?????ng xu???t v?????t qu?? l?????ng t???n t???i thi???u';
      }
      // eslint-disable-next-line no-restricted-globals
      if (e.requestAmount !== '' && isNaN(e.requestAmount)) {
        hasError = true;
        amountErrorMessages[index] = 'Th??nh ti???n kh??ng ????ng ?????nh d???ng';
      }
    });
    this.setState({ quantityErrorMessages, amountErrorMessages });

    if (
      orderDetailList.length > 0 &&
      new Set(
        orderDetailList.map((e) => {
          return e.materialID;
        })
      ).size !== orderDetailList.length
    ) {
      hasError = true;
      setErrorMessage('C?? m?? v???t t?? b??? tr??ng. Vui l??ng ki???m tra l???i');
    }
    if (hasError) {
      return;
    }

    if (engineID !== 'other') {
      orderInfo.consumer = engineID;
    } else {
      orderInfo.consumer = otherConsumer;
    }
    setLoading(true);
    try {
      await addOrder({ orderInfo, orderDetailList });
    } catch {
      setErrorMessage('C?? l???i khi th??m y??u c???u. Vui l??ng th??? l???i.');
    }
    setSubmitResult('Y??u c???u ???????c th??m th??nh c??ng');
    setLoading(false);
  };

  formatDate = (inputDate) => {
    const yyyy = inputDate.getFullYear().toString();
    const mm = `0${inputDate.getMonth() + 1}`.slice(-2);
    const dd = `0${inputDate.getDate()}`.slice(-2);
    return `${dd}/${mm}/${yyyy}`;
  };

  findMaterial = () => {
    const { filterMaterialID, filterMaterialGroup, filterMatetrialName, filterMaterialType, pageSize, materialList } = this.state;
    let filterResult = JSON.parse(JSON.stringify(materialList));
    if (filterMaterialID !== '') {
      filterResult = filterResult.filter((e) => e.materialID.includes(filterMaterialID));
    }
    if (filterMatetrialName !== '') {
      filterResult = filterResult.filter((e) => e.materialName.toUpperCase().includes(filterMatetrialName.toUpperCase()));
    }
    if (filterMaterialGroup !== '') {
      filterResult = filterResult.filter((e) => e.materialGroupID === filterMaterialGroup);
    }
    if (filterMaterialType !== '') {
      filterResult = filterResult.filter((e) => e.materialTypeID === filterMaterialType);
    }
    this.setState({
      searchResult: filterResult,
      materialListDisplay: filterResult.slice(0, pageSize),
    });
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      orderInfo,
      orderNameErrorMessage,
      requestNoteErrorMessage,
      testerList,
      approverList,
      orderDetailList,
      testerErrorMessage,
      approverErrorMessage,
      quantityErrorMessages,
      amountErrorMessages,
      categoryList,
      accountList,
      filterMaterialID,
      filterMaterialGroup,
      filterMatetrialName,
      filterMaterialType,
      materialListDisplay,
      searchResult,
      page,
      pageSize,
      engineList,
      otherConsumerList,
      engineID,
      otherConsumer,
      engineIDErrorMessage,
      repairLevelErrorMessage,
      repairGroupErrorMessage,
    } = this.state;

    const materialGroups = [
      { id: '', label: '' },
      { id: 'phutungmuamoi', label: 'Ph??? t??ng mua m???i' },
      { id: 'phutunggiacongcokhi', label: 'Ph??? t??ng gia c??ng c?? kh??' },
      { id: 'phutungkhoiphuc', label: 'Ph??? t??ng kh??i ph???c' },
    ];
    const materialTypes = [
      { id: '', label: '' },
      { id: '1521', label: 'Kho nguy??n v???t li???u ch??nh' },
      { id: '1522', label: 'Kho v???t li???u x??y d???ng c?? b???n' },
      { id: '1523', label: 'Kho d???u m??? b??i tr??n' },
      { id: '1524', label: 'Kho ph??? t??ng' },
      { id: '1525', label: 'Kho nhi??n li???u' },
      { id: '1526', label: 'Kho nguy??n v???t li???u ph???' },
      { id: '1527', label: 'Kho ph??? li???u' },
      { id: '1528', label: 'Kho ph??? t??ng gia c??ng c?? kh??' },
      { id: '1529', label: 'Kho nhi??n li???u t???n tr??n ph????ng ti???n' },
      { id: '1531', label: 'Kho c??ng c??? d???ng c???' },
    ];

    const repairGroupList = [
      { id: 'T??? ??i???n', label: 'T??? ??i???n' },
      { id: 'T??? Khung G???m', label: 'T??? Khung G???m' },
      { id: 'T??? ?????ng c??', label: 'T??? ?????ng c??' },
      { id: 'T??? H??m', label: 'T??? H??m' },
      { id: 'T??? C?? kh??', label: 'T??? C?? kh??' },
      { id: 'T??? Truy???n ?????ng', label: 'T??? Truy???n ?????ng' },
    ];

    const repairLevelList = [
      { id: '?????t xu???t', label: '?????t xu???t' },
      { id: 'Ro', label: 'Ro' },
      { id: 'R1', label: 'R1' },
      { id: 'R2', label: 'R2' },
      { id: 'Rt', label: 'Rt' },
      { id: '?????i tu', label: '?????i tu' },
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
          <ModalHeader iconDescription="Close" title={<div>Thao t??c th??nh c??ng</div>} />
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
          <h4>Y??u c???u xu???t kho</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput
                id="orderName-TextInput"
                placeholder="Vui l??ng nh???p t??n y??u c???u"
                labelText="T??n y??u c???u"
                value={orderInfo.orderName}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, orderName: e.target.value } }))}
                invalid={orderNameErrorMessage !== ''}
                invalidText={orderNameErrorMessage}
              />
            </div>
            <div className="bx--col-lg-4">
              <TextInput
                id="requestNote-TextInput"
                placeholder="Vui l??ng nh???p l?? do l???p b???ng"
                labelText="L?? do"
                value={orderInfo.requestNote}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, requestNote: e.target.value } }))}
                invalid={requestNoteErrorMessage !== ''}
                invalidText={requestNoteErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker
                datePickerType="single"
                dateFormat="d/m/Y"
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, requestDate: this.formatDate(e[0]) } }))}
                value={orderInfo.requestDate}
              >
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ng??y t???o y??u c???u" id="requestDate-datepicker" />
              </DatePicker>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="tester-Dropdown"
                titleText="Ng?????i nghi???m thu"
                label=""
                items={testerList}
                selectedItem={orderInfo.tester === '' ? null : testerList.find((e) => e.id === orderInfo.tester)}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, tester: e.selectedItem.id } }))}
                invalid={testerErrorMessage !== ''}
                invalidText={testerErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="approver-Dropdown"
                titleText="Ng?????i ph?? duy???t"
                label=""
                items={approverList}
                selectedItem={orderInfo.approver === '' ? null : approverList.find((e) => e.id === orderInfo.approver)}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, approver: e.selectedItem.id } }))}
                invalid={approverErrorMessage !== ''}
                invalidText={approverErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="stockName-TextInput"
                placeholder=""
                labelText="Xu???t t???i kho (ng??n l??)"
                value={orderInfo.stockName}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, stockName: e.target.value } }))}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="address-TextInput"
                placeholder=""
                labelText="?????a ch??? kho"
                value={orderInfo.address}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, address: e.target.value } }))}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="attachedDocument-TextInput"
                placeholder=""
                labelText="S??? ch???ng t??? g???c k??m theo"
                value={orderInfo.attachedDocument}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, attachedDocument: e.target.value } }))}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="repairLevel-Dropdown"
                titleText="C???p s???a ch???a"
                label=""
                items={repairLevelList}
                selectedItem={orderInfo.repairLevel === '' ? null : repairLevelList.find((e) => e.id === orderInfo.repairLevel)}
                onChange={(e) =>
                  this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, repairLevel: e.selectedItem.id }, repairLevelErrorMessage: '' }))
                }
                invalid={repairLevelErrorMessage !== ''}
                invalidText={repairLevelErrorMessage}
                disabled={engineID === 'other'}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="repairGroup-Dropdown"
                titleText="T??? s???a ch???a"
                label=""
                items={repairGroupList}
                selectedItem={orderInfo.repairGroup === '' ? null : repairGroupList.find((e) => e.id === orderInfo.repairGroup)}
                onChange={(e) =>
                  this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, repairGroup: e.selectedItem.id }, repairGroupErrorMessage: '' }))
                }
                invalid={repairGroupErrorMessage !== ''}
                invalidText={repairGroupErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="deliver-TextInput"
                placeholder=""
                labelText="?????a ch??? (b??? ph???n)"
                value={orderInfo.deliver}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, deliver: e.target.value } }))}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="engineID-Dropdown"
                titleText="?????u m??y"
                label=""
                items={engineList}
                selectedItem={engineID === '' ? null : engineList.find((e) => e.id === engineID)}
                onChange={(e) =>
                  this.setState((prevState) => ({
                    orderInfo: { ...prevState.orderInfo, repairLevel: e.selectedItem.id === 'other' ? '' : orderInfo.repairLevel },
                    engineID: e.selectedItem.id,
                    engineIDErrorMessage: '',
                  }))
                }
                invalid={engineIDErrorMessage !== ''}
                invalidText={engineIDErrorMessage}
              />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="otherConsumer-ComboBox"
                titleText="?????i t?????ng chi ph?? kh??c"
                placeholder=""
                label=""
                items={otherConsumerList}
                selectedItem={otherConsumer === '' ? null : otherConsumerList.find((e) => e.id === otherConsumer)}
                onChange={(e) => this.setState({ otherConsumer: e.selectedItem == null ? '' : e.selectedItem.id })}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                disabled={engineID !== 'other'}
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="no-ComboBox"
                titleText="N???"
                placeholder=""
                label=""
                items={categoryList}
                selectedItem={orderInfo.no === '' ? null : categoryList.find((e) => e.id === orderInfo.no)}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, no: e.selectedItem == null ? '' : e.selectedItem.id } }))}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
              />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="co-ComboBox"
                titleText="C??"
                placeholder=""
                label=""
                items={categoryList}
                selectedItem={orderInfo.co === '' ? null : categoryList.find((e) => e.id === orderInfo.co)}
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, co: e.selectedItem == null ? '' : e.selectedItem.id } }))}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
              />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="category-ComboBox"
                titleText="Kho???n m???c"
                placeholder=""
                label=""
                items={accountList}
                selectedItem={orderInfo.category === '' ? null : accountList.find((e) => e.id === orderInfo.category)}
                onChange={(e) =>
                  this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, category: e.selectedItem == null ? '' : e.selectedItem.id } }))
                }
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.save()} style={{ marginTop: '1rem' }}>
                L??u th??ng tin
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
        </div>
        <div className="bx--grid">
          <Accordion>
            <AccordionItem title={<strong>T??m ki???m nhanh v???t t??</strong>}>
              <div className="bx--row">
                <div className="bx--col-lg-4">
                  <TextInput
                    id="filterMaterialID-TextInput"
                    placeholder="Vui l??ng nh???p m???t ph???n m?? v???t t?? ????? t??m ki???m"
                    labelText="M?? v???t t??"
                    value={filterMaterialID}
                    onChange={(e) => this.setState({ filterMaterialID: e.target.value })}
                  />
                </div>
                <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
                <div className="bx--col-lg-4">
                  <Dropdown
                    id="filterMaterialGroup-Dropdown"
                    titleText="Nh??m v???t t??"
                    label=""
                    items={materialGroups}
                    selectedItem={filterMaterialGroup === '' ? null : materialGroups.find((e) => e.id === filterMaterialGroup)}
                    onChange={(e) => this.setState({ filterMaterialGroup: e.selectedItem.id })}
                  />
                </div>
                <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
                <div className="bx--col-lg-2 bx--col-md-2">
                  <Button onClick={() => this.findMaterial()} style={{ marginTop: '1rem' }}>
                    T??m
                  </Button>
                </div>
              </div>
              <br />
              <div className="bx--row">
                <div className="bx--col-lg-4">
                  <TextInput
                    id="filterMaterialName-TextInput"
                    placeholder="Vui l??ng nh???p m???t ph???n t??n v???t t?? ????? t??m ki???m"
                    labelText="T??n v???t t??"
                    value={filterMatetrialName}
                    onChange={(e) => this.setState({ filterMatetrialName: e.target.value })}
                  />
                </div>
                <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
                <div className="bx--col-lg-4">
                  <Dropdown
                    id="filterMaterialType-Dropdown"
                    titleText="Lo???i v???t t?? (t??i kho???n kho)"
                    label=""
                    items={materialTypes}
                    selectedItem={filterMaterialType === '' ? null : materialTypes.find((e) => e.id === filterMaterialType)}
                    onChange={(e) => this.setState({ filterMaterialType: e.selectedItem.id })}
                  />
                </div>
                <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
                <div className="bx--col-lg-2 bx--col-md-2">
                  <Button
                    style={{ marginTop: '1rem' }}
                    onClick={() => this.setState({ filterMaterialID: '', filterMaterialGroup: '', filterMatetrialName: '', filterMaterialType: '' })}
                  >
                    Xo?? b??? l???c
                  </Button>
                </div>
              </div>
              <br />
              <hr className="LeftNav-module--divider--1Z49I" />
              <div className="bx--row">
                <div className="bx--col-lg-2 bx--col-md-2" />
                <div className="bx--col-lg-12">
                  <TableContainer title={`K???t qu??? t??m ki???m cho ra ${searchResult.length} m???c v???t t?? t????ng ???ng.`}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableHeader key="materialID">M?? v???t t??</TableHeader>
                          <TableHeader key="materialName">T??n v???t t??</TableHeader>
                          <TableHeader key="materialTypeName">Lo???i v???t t??</TableHeader>
                          <TableHeader key="materialGroupName">Nh??m v???t t??</TableHeader>
                          <TableHeader key="unit">????n v??? t??nh</TableHeader>
                          <TableHeader key="minimumQuantity">L?????ng t???n t???i thi???u</TableHeader>
                          <TableHeader key="stockQuantity">L?????ng t???n trong kho</TableHeader>
                          <TableHeader />
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {materialListDisplay.map((material, index) => (
                          <TableRow key={`row-${index.toString()}}`}>
                            <TableCell key={`materialID-${index.toString()}`}>{material.materialID}</TableCell>
                            <TableCell key={`materialName-${index.toString()}`}>{material.materialName}</TableCell>
                            <TableCell key={`materialTypeName-${index.toString()}`}>{material.materialTypeName}</TableCell>
                            <TableCell key={`materialGroupName-${index.toString()}`}>{material.materialGroupName}</TableCell>
                            <TableCell key={`unit-${index.toString()}`}>{material.unit}</TableCell>
                            <TableCell key={`minimumQuantity-${index.toString()}`}>{material.minimumQuantity}</TableCell>
                            <TableCell key={`stockQuantity-${index.toString()}`}>{material.stockQuantity}</TableCell>
                            <TableCell>
                              <Button
                                disabled={orderDetailList.find((e) => e.materialID === material.materialID)}
                                onClick={() => {
                                  orderDetailList.push({
                                    materialID: material.materialID,
                                    materialName: material.materialName,
                                    materialTypeName: material.materialTypeName,
                                    materialGroupName: material.materialGroupName,
                                    unit: material.unit,
                                    requestQuantity: '',
                                    requestAmount: '',
                                  });
                                  quantityErrorMessages.push('');
                                  amountErrorMessages.push('');
                                  this.setState({ orderDetailList, quantityErrorMessages, amountErrorMessages });
                                }}
                              >
                                Th??m
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Pagination
                    className="fixed-pagination"
                    backwardText="Previous page"
                    forwardText="Next page"
                    itemsPerPageText="Items per page:"
                    page={page}
                    pageNumberText="Page Number"
                    pageSize={pageSize}
                    pageSizes={[5, 10, 15]}
                    totalItems={searchResult.length}
                    onChange={(target) => {
                      this.setState({
                        materialListDisplay: searchResult.slice((target.page - 1) * target.pageSize, target.page * target.pageSize),
                        page: target.page,
                        pageSize: target.pageSize,
                      });
                    }}
                  />
                </div>
              </div>
              <br />
            </AccordionItem>
          </Accordion>
        </div>
        <br />
        <br />
        <div className="bx--grid">
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer
                title="Chi ti???t danh m???c nh???p kho"
                description="(*) Th??nh ti???n kh??ng b???t bu???c ph???i nh???p. N???u nh???p th??nh ti???n th?? s??? ???????c coi l?? ????n gi?? th??? c??ng"
              >
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader key="stt">STT</TableHeader>
                      <TableHeader key="materialID">M?? v???t t??</TableHeader>
                      <TableHeader key="materialName">T??n v???t t??</TableHeader>
                      <TableHeader key="unit">????n v???</TableHeader>
                      <TableHeader key="materialTypeName">Thu???c kho</TableHeader>
                      <TableHeader key="materialGroupName">Lo???i v???t t??</TableHeader>
                      <TableHeader key="quantity">S??? l?????ng</TableHeader>
                      <TableHeader key="amount">Th??nh ti???n</TableHeader>
                      <TableHeader />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderDetailList.map((row, index) => (
                      <TableRow key={`row-${index.toString()}`}>
                        <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                        <TableCell key={`materialID-${index.toString()}`}>{orderDetailList[index].materialID}</TableCell>
                        <TableCell key={`materialName-${index.toString()}`}>{orderDetailList[index].materialName}</TableCell>
                        <TableCell key={`unit-${index.toString()}`}>{orderDetailList[index].unit}</TableCell>
                        <TableCell key={`materialTypeName-${index.toString()}`}>{orderDetailList[index].materialTypeName}</TableCell>
                        <TableCell key={`materialGroupName-${index.toString()}`}>{orderDetailList[index].materialGroupName}</TableCell>
                        <TableCell key={`quantity-${index.toString()}`}>
                          <TextInput
                            id={`quantity-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              orderDetailList[index].requestQuantity = e.target.value;
                              quantityErrorMessages[index] = '';
                              this.setState({ orderDetailList, quantityErrorMessages });
                            }}
                            value={orderDetailList[index].requestQuantity}
                            invalid={quantityErrorMessages[index] !== ''}
                            invalidText={quantityErrorMessages[index]}
                          />
                        </TableCell>
                        <TableCell key={`amount-${index.toString()}`}>
                          <TextInput
                            id={`amount-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              orderDetailList[index].requestAmount = e.target.value;
                              amountErrorMessages[index] = '';
                              this.setState({ orderDetailList, amountErrorMessages });
                            }}
                            value={orderDetailList[index].requestAmount}
                            invalid={amountErrorMessages[index] !== ''}
                            invalidText={amountErrorMessages[index]}
                          />
                        </TableCell>
                        <TableCell key={`remove-button-${index.toString()}`}>
                          <Button
                            onClick={() => {
                              this.setState({
                                orderDetailList: orderDetailList.filter((e) => e.materialID !== row.materialID),
                                quantityErrorMessages: Array(orderDetailList.length).fill('', 0, orderDetailList.length),
                                amountErrorMessages: Array(orderDetailList.length).fill('', 0, orderDetailList.length),
                              });
                            }}
                          >
                            Xo??
                          </Button>
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
