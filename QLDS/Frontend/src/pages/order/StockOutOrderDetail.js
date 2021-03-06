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
import { assignErrorMessage, setLoadingValue, setMaterialListValue, setSubmitValue } from '../../actions/commonAction';
import {
  cancelOrder,
  exportStockOutOrderRecipe,
  exportTestRecipe,
  getAccountTitleList,
  getCategoryList,
  getMaterialListWithStockQuantity,
  getOrder,
  getUserList,
} from '../../services';

class StockOutOrderDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderInfo: {
        id: '',
        orderName: '',
        status: '',
        requestor: '',
        requestNote: '',
        requestDate: '',
        tester: '',
        testNote: '',
        testDate: '',
        approver: '',
        approveNote: '',
        approveDate: '',
        supplier: '',
        no: '',
        co: '',
        recipeNo: '',
        recipeDate: '',
        deliver: '',
        attachedDocument: '',
        stockName: '',
        address: '',
        category: '',
        companyID: '',
      },
      orderDetailList: [],
      changedOrderDetailList: [],
      testRecipe: {
        id: '',
        orderID: '',
        leader: '',
        leaderPosition: '',
        leaderRepresentation: '',
        firstCommissioner: '',
        firstCommissionerPosition: '',
        firstCommissionerRepresentation: '',
        secondCommissioner: '',
        secondCommissionerPosition: '',
        secondCommissionerRepresentation: '',
        comment: '',
      },
      testerList: [],
      approverList: [],
      engineList: [],
      otherConsumerList: [],
      categoryList: [],
      accountList: [],
    };
  }

  componentDidMount = async () => {
    const { setErrorMessage, setLoading, location, auth, common, setMaterialList } = this.props;
    const params = new URLSearchParams(location.search);
    if (params == null) {
      setErrorMessage('Kh??ng c?? m?? y??u c???u nh???p kho!!!');
      return;
    }
    const orderID = params.get('orderID');
    setLoading(true);
    let { materialList } = common;
    try {
      const getStockOutOrderInfoResult = await getOrder(orderID);
      if (
        getStockOutOrderInfoResult.data.orderInfo.requestor !== auth.userID &&
        getStockOutOrderInfoResult.data.orderInfo.tester !== auth.userID &&
        getStockOutOrderInfoResult.data.orderInfo.approver !== auth.userID
      ) {
        setErrorMessage('B???n kh??ng c?? quy???n truy c???p');
        setLoading(false);
        return;
      }
      const getTesterListResult = await getUserList('', '', auth.companyID, 'phongkythuat');
      const getApproverListResult = await getUserList('', '', auth.companyID, 'phongketoantaichinh');
      const getCategoryListResult = await getCategoryList();
      const getAccountListResult = await getAccountTitleList();
      if (materialList.length === 0) {
        const getMaterialListResult = await getMaterialListWithStockQuantity(auth.companyID);
        materialList = getMaterialListResult.data;
        setMaterialList(materialList);
      }
      const orderDetailList = getStockOutOrderInfoResult.data.orderDetailList.map((e) => {
        const selectedMaterial = materialList.find((item) => item.materialID === e.materialID);
        e.materialName = selectedMaterial.materialName;
        e.unit = selectedMaterial.unit;
        e.materialGroupName = selectedMaterial.materialGroupName;
        e.materialTypeName = selectedMaterial.materialTypeName;
        if (getStockOutOrderInfoResult.data.orderInfo.status === 'created') {
          e.quantity = e.requestQuantity;
          e.amount = e.requestAmount;
        }
        if (getStockOutOrderInfoResult.data.orderInfo.status === 'tested') {
          e.quantity = e.testQuantity;
          e.amount = e.testAmount;
        }
        if (getStockOutOrderInfoResult.data.orderInfo.status === 'completed') {
          e.quantity = e.approveQuantity;
          e.amount = e.approveAmount;
        }
        if (getStockOutOrderInfoResult.data.orderInfo.status === 'canceled') {
          // eslint-disable-next-line no-nested-ternary
          e.quantity = e.approveQuantity !== '' ? e.approveQuantity : e.testQuantity !== '' ? e.testQuantity : e.requestQuantity;
          // eslint-disable-next-line no-nested-ternary
          e.amount = e.approveAmount !== '' ? e.approveAmount : e.testAmount !== '' ? e.testAmount : e.requestAmount;
        }
        return e;
      });
      const { status } = getStockOutOrderInfoResult.data.orderInfo;
      const changedOrderDetailList = orderDetailList.filter((e) => {
        if (status === 'canceled' || status === 'created') {
          return false;
        }
        if (status === 'tested') {
          return e.testQuantity !== e.requestQuantity || e.testAmount !== e.requestAmount;
        }
        if (status === 'completed') {
          return (
            e.approveQuantity !== e.testQuantity ||
            e.approveQuantity !== e.requestQuantity ||
            e.testQuantity !== e.requestQuantity ||
            e.approveAmount !== e.testAmount ||
            e.approveAmount !== e.requestAmount ||
            e.testAmount !== e.requestAmount
          );
        }
        return false;
      });
      this.setState({
        testerList: getTesterListResult.data.map((e) => {
          return { id: e.userID, label: e.username };
        }),
        approverList: getApproverListResult.data.map((e) => {
          return { id: e.userID, label: e.username };
        }),
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
        orderInfo: getStockOutOrderInfoResult.data.orderInfo,
        orderDetailList,
        changedOrderDetailList,
        testRecipe: getStockOutOrderInfoResult.data.testRecipe,
      });
      this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, testDate: this.formatDate(new Date()) } }));
    } catch {
      setErrorMessage('M?? y??u c???u nh???p kho kh??ng t???n t???i!!!');
    }
    setLoading(false);
  };

  cancelOrder = async () => {
    const { setErrorMessage, setLoading, setSubmitResult } = this.props;
    const { orderInfo } = this.state;
    orderInfo.status = 'canceled';
    setLoading(true);
    try {
      await cancelOrder(orderInfo);
    } catch {
      setErrorMessage('C?? l???i khi hu??? y??u c???u. Vui l??ng th??? l???i.');
    }
    setSubmitResult('Y??u c???u ???????c hu??? th??nh c??ng');
    setLoading(false);
  };

  formatDate = (inputDate) => {
    const yyyy = inputDate.getFullYear().toString();
    const mm = `0${inputDate.getMonth() + 1}`.slice(-2);
    const dd = `0${inputDate.getDate()}`.slice(-2);
    return `${dd}/${mm}/${yyyy}`;
  };

  getOrderStatusInVN = () => {
    const { orderInfo } = this.state;
    if (orderInfo.status === 'canceled') {
      return '???? b??? hu???';
    }
    if (orderInfo.status === 'created') {
      return 'Ch??? nghi???m thu';
    }
    if (orderInfo.status === 'tested') {
      return 'Ch??? ph?? duy???t';
    }
    if (orderInfo.status === 'completed') {
      return '???? ho??n th??nh';
    }
    return '';
  };

  downloadStockOutRecipe = async () => {
    const { auth, setErrorMessage } = this.props;
    const { orderInfo } = this.state;
    await exportStockOutOrderRecipe(orderInfo.id, auth.companyID)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Phieu_xuat_kho.xlsx');
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => {
        setErrorMessage('C?? l???i x???y ra khi xu???t file b??o c??o. Vui l??ng th??? l???i');
      });
  };

  downloadTestRecipe = async () => {
    const { auth, setErrorMessage } = this.props;
    const { orderInfo } = this.state;
    await exportTestRecipe(orderInfo.id, auth.companyID)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Bien_ban_kiem_nghiem.xlsx');
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => {
        setErrorMessage('C?? l???i x???y ra khi xu???t file b??o c??o. Vui l??ng th??? l???i');
      });
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common, auth } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const { orderInfo, testerList, approverList, orderDetailList, engineList, categoryList, testRecipe, changedOrderDetailList, otherConsumerList, accountList } =
      this.state;

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
      <div className="stock-out-detail">
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
              <TextInput id="orderName-TextInput" placeholder="Vui l??ng nh???p t??n y??u c???u" labelText="T??n y??u c???u" value={orderInfo.orderName} disabled />
            </div>
            <div className="bx--col-lg-4">
              <TextInput id="requestNote-TextInput" placeholder="Vui l??ng nh???p l?? do l???p b???ng" labelText="L?? do" value={orderInfo.requestNote} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" value={orderInfo.requestDate}>
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ng??y t???o y??u c???u" id="requestDate-datepicker" disabled />
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
                disabled
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="approver-Dropdown"
                titleText="Ng?????i ph?? duy???t"
                label=""
                items={approverList}
                selectedItem={orderInfo.approver === '' ? null : approverList.find((e) => e.id === orderInfo.approver)}
                disabled
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="stockName-TextInput" placeholder="" labelText="Xu???t t???i kho (ng??n l??)" value={orderInfo.stockName} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="address-TextInput" placeholder="" labelText="?????a ch??? kho" value={orderInfo.address} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="attachedDocument-TextInput" placeholder="" labelText="S??? ch???ng t??? g???c k??m theo" value={orderInfo.attachedDocument} disabled />
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
                disabled
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="repairGroup-Dropdown"
                titleText="T??? s???a ch???a"
                label=""
                items={repairGroupList}
                selectedItem={orderInfo.repairGroup === '' ? null : repairGroupList.find((e) => e.id === orderInfo.repairGroup)}
                disabled
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="engineID-Dropdown"
                titleText="?????u m??y ti??u th???"
                label=""
                items={engineList}
                selectedItem={
                  engineList.find((e) => e.id === orderInfo.consumer) == null
                    ? { id: 'other', label: '?????i t?????ng ti??u th??? kh??c' }
                    : engineList.find((e) => e.id === orderInfo.consumer)
                }
                disabled
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="deliver-TextInput" placeholder="" labelText="?????a ch??? (b??? ph???n)" value={orderInfo.deliver} disabled />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <ComboBox
                id="otherConsumer-ComboBox"
                titleText="?????i t?????ng chi ph?? kh??c"
                placeholder=""
                label=""
                items={otherConsumerList}
                selectedItem={otherConsumerList.find((e) => e.id === orderInfo.consumer)}
                onChange={(e) =>
                  this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, consumer: e.selectedItem == null ? '' : e.selectedItem.id } }))
                }
                disabled
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
                disabled
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
                disabled
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
                disabled
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                onClick={() => this.cancelOrder()}
                style={{ marginTop: '1rem', backgroundColor: '#da1e28' }}
                disabled={orderInfo.status === 'completed' || orderInfo.status === 'canceled' || orderInfo.requestor !== auth.userID}
              >
                Hu??? y??u c???u
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
        </div>
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput id="leader-TextInput" placeholder="Tr?????ng ban ki???m nghi???m" labelText="Tr?????ng ban" value={testRecipe.leader} disabled />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="leaderPosition-TextInput"
                placeholder="Ch???c v??? tr?????ng ban ki???m nghi???m"
                labelText="Ch???c v???"
                value={testRecipe.leaderPosition}
                disabled
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="leaderRepresentation-TextInput"
                placeholder="?????i di???n tr?????ng ban ki???m nghi???m"
                labelText="?????i di???n"
                value={testRecipe.leaderRepresentation}
                disabled
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="firstCommissioner-TextInput"
                placeholder="U??? vi??n ban ki???m nghi???m"
                labelText="U??? vi??n"
                value={testRecipe.firstCommissioner}
                disabled
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="firstCommissionerPosition-TextInput"
                placeholder="Ch???c v???"
                labelText="Ch???c v???"
                value={testRecipe.firstCommissionerPosition}
                disabled
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="firstCommissionerRepresentation-TextInput"
                placeholder="?????i di???n"
                labelText="?????i di???n"
                value={testRecipe.firstCommissionerRepresentation}
                disabled
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="secondCommissioner-TextInput"
                placeholder="U??? vi??n ban ki???m nghi???m"
                labelText="U??? vi??n"
                value={testRecipe.secondCommissioner}
                disabled
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="secondCommissionerPosition-TextInput"
                placeholder="Ch???c v???"
                labelText="Ch???c v???"
                value={testRecipe.secondCommissionerPosition}
                disabled
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="secondCommissionerRepresentation-TextInput"
                placeholder="?????i di???n"
                labelText="?????i di???n"
                value={testRecipe.secondCommissionerRepresentation}
                disabled
              />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput id="comment-TextInput" placeholder="" labelText="?? ki???n ban ki???m nghi???m" value={testRecipe.comment} disabled />
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput id="testNote-TextInput" placeholder="" labelText="N???i dung ??i???u ch???nh t??? ph??ng k??? thu???t" value={orderInfo.testNote} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker
                datePickerType="single"
                dateFormat="d/m/Y"
                onChange={(e) => this.setState((prevState) => ({ orderInfo: { ...prevState.orderInfo, testDate: this.formatDate(e[0]) } }))}
                value={orderInfo.testDate}
              >
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ng??y nghi???m thu" id="testDate-datepicker" disabled />
              </DatePicker>
            </div>
            <div className="bx--col-lg-1 bx--col-md-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <Button onClick={() => this.downloadTestRecipe()} style={{ marginTop: '1rem' }} disabled={orderInfo.status !== 'completed'}>
                T???i bi??n b???n nghi???m thu
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput
                id="approveNote-TextInput"
                placeholder=""
                labelText="N???i dung ??i???u ch???nh t??? ph??ng t??i ch??nh k??? to??n"
                value={orderInfo.approveNote}
                disabled
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" value={orderInfo.approveDate}>
                <DatePickerInput datePickerType="single" placeholder="dd/mm/yyyy" labelText="Ng??y ph?? duy???t" id="approveDate-datepicker" disabled />
              </DatePicker>
            </div>
            <div className="bx--col-lg-1 bx--col-md-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="status-TextInput" placeholder="" labelText="Tr???ng th??i y??u c???u" value={this.getOrderStatusInVN()} disabled />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <Button onClick={() => this.downloadStockOutRecipe()} style={{ marginTop: '1rem' }} disabled={orderInfo.status !== 'completed'}>
                T???i phi???u xu???t kho
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          {changedOrderDetailList.length > 0 && (
            <div className="bx--row">
              <div className="bx--col-lg-2 bx--col-md-2" />
              <div className="bx--col-lg-12">
                <TableContainer title="Chi ti???t thay ?????i">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeader key="stt">STT</TableHeader>
                        <TableHeader key="materialID">M?? v???t t??</TableHeader>
                        <TableHeader key="materialName">T??n v???t t??</TableHeader>
                        <TableHeader key="requestQuantity">S??? l?????ng</TableHeader>
                        <TableHeader key="requestAmount">Th??nh ti???n</TableHeader>
                        <TableHeader key="testQuantity">S??? l?????ng nghi???m thu</TableHeader>
                        <TableHeader key="testAmount">Th??nh ti???n nghi???m thu</TableHeader>
                        <TableHeader key="approveQuantity">S??? l?????ng ph?? duy???t</TableHeader>
                        <TableHeader key="approveAmount">Th??nh ti???n ph?? duy???t</TableHeader>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {changedOrderDetailList.map((e, index) => (
                        <TableRow key={`row-${index.toString()}`}>
                          <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                          <TableCell key={`materialID-${index.toString()}`}>{e.materialID}</TableCell>
                          <TableCell key={`materialName-${index.toString()}`}>{e.materialName}</TableCell>
                          <TableCell key={`requestQuantity-${index.toString()}`}>{e.requestQuantity}</TableCell>
                          <TableCell key={`requestAmount-${index.toString()}`}>{e.requestAmount}</TableCell>
                          <TableCell key={`testQuantity-${index.toString()}`}>{e.testQuantity}</TableCell>
                          <TableCell key={`testAmount-${index.toString()}`}>{e.testAmount}</TableCell>
                          <TableCell key={`approveQuantity-${index.toString()}`}>{e.approveQuantity}</TableCell>
                          <TableCell key={`approveAmount-${index.toString()}`}>{e.approveAmount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
              <div className="bx--col-lg-2 bx--col-md-2" />
            </div>
          )}
        </div>
        <br />
        <br />
        <div className="bx--grid">
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title="Chi ti???t danh m???c nh???p kho">
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
                        <TableCell key={`quantity-${index.toString()}`}>{orderDetailList[index].quantity}</TableCell>
                        <TableCell key={`amount-${index.toString()}`}>{orderDetailList[index].amount}</TableCell>
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

StockOutOrderDetail.propTypes = {
  setErrorMessage: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  setSubmitResult: PropTypes.func.isRequired,
  setMaterialList: PropTypes.func.isRequired,
  common: PropTypes.shape({ submitResult: PropTypes.string, errorMessage: PropTypes.string, isLoading: PropTypes.bool, materialList: PropTypes.arrayOf })
    .isRequired,
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
  setMaterialList: (materialList) => dispatch(setMaterialListValue(materialList)),
});

export default connect(mapStateToProps, mapDispatchToProps)(StockOutOrderDetail);
