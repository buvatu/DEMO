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
import { CurrencyFormatter } from '../../constants';
import { exportStockReport, getCompanyList, getStockList } from '../../services';

class StockReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      materialID: '',
      materialName: '',
      materialType: '',
      materialGroup: '',
      companyID: '',
      companyIDs: [],

      stockList: [],
      stockListSearchResult: [],
      stockListDisplay: [],
      page: 1,
      pageSize: 10,
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth, setErrorMessage } = this.props;
    const { pageSize } = this.state;
    setLoading(true);
    try {
      const getStockListResult = await getStockList(auth.companyID === 'TCT_DS_VN' ? '' : auth.companyID);
      const getCompanyListResult = await getCompanyList();
      this.setState({
        stockList: getStockListResult.data,
        stockListSearchResult: getStockListResult.data,
        stockListDisplay: getStockListResult.data.slice(0, pageSize),
        companyIDs: [
          { id: '', label: '' },
          ...getCompanyListResult.data.map((e) => {
            return { id: e.companyID, label: e.companyName };
          }),
        ],
      });
    } catch {
      setErrorMessage('Có lỗi khi tải trang. Vui lòng thử lại');
      return;
    }
    setLoading(false);
  };

  filterStockList = () => {
    const { materialID, materialName, materialType, materialGroup, companyID, stockList, pageSize } = this.state;
    let stockListSearchResult = stockList;
    if (materialID !== '') {
      stockListSearchResult = stockListSearchResult.filter((e) => e.materialID.includes(materialID));
    }
    if (materialName !== '') {
      stockListSearchResult = stockListSearchResult.filter((e) => e.materialName.includes(materialName));
    }
    if (materialType !== '') {
      stockListSearchResult = stockListSearchResult.filter((e) => e.materialTypeID === materialType);
    }
    if (materialGroup !== '') {
      stockListSearchResult = stockListSearchResult.filter((e) => e.materialGroupID === materialGroup);
    }
    if (companyID !== '') {
      stockListSearchResult = stockListSearchResult.filter((e) => e.companyID === companyID);
    }
    this.setState({
      stockListSearchResult,
      stockListDisplay: stockListSearchResult.slice(0, pageSize),
    });
  };

  exportStockReport = async () => {
    const { auth, setErrorMessage } = this.props;
    const { materialID, materialName, materialType, materialGroup } = this.state;
    await exportStockReport(materialID, materialName, materialType, materialGroup, auth.companyID)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Bao_cao_ton_kho.xlsx');
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
    const { stockListSearchResult, stockListDisplay, stockList, materialID, materialType, materialName, materialGroup, page, pageSize, companyID, companyIDs } =
      this.state;

    const materialGroups = [
      { id: '', label: '' },
      { id: 'phutungmuamoi', label: 'Phụ tùng mua mới' },
      { id: 'phutunggiacongcokhi', label: 'Phụ tùng gia công cơ khí' },
      { id: 'phutungkhoiphuc', label: 'Phụ tùng khôi phục' },
    ];
    const materialTypes = [
      { id: '', label: '' },
      { id: '1521', label: 'Kho nguyên vật liệu chính' },
      { id: '1522', label: 'Kho vật liệu xây dựng cơ bản' },
      { id: '1523', label: 'Kho dầu mỡ bôi trơn' },
      { id: '1524', label: 'Kho phụ tùng' },
      { id: '1525', label: 'Kho nhiên liệu' },
      { id: '1526', label: 'Kho nguyên vật liệu phụ' },
      { id: '1527', label: 'Kho phế liệu' },
      { id: '1528', label: 'Kho phụ tùng gia công cơ khí' },
      { id: '1529', label: 'Kho nhiên liệu tồn trên phương tiện' },
      { id: '1531', label: 'Kho công cụ dụng cụ' },
    ];

    return (
      <div className="stock-report">
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
          <h4>Báo cáo tồn kho</h4>
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
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="materialID-TextInput"
                placeholder="Vui lòng nhập một phần mã vật tư để tìm kiếm"
                labelText="Mã vật tư"
                value={materialID}
                onChange={(e) => this.setState({ materialID: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <TextInput
                id="materialName-TextInput"
                placeholder="Vui lòng nhập một phần tên vật tư để tìm kiếm"
                labelText="Tên vật tư"
                value={materialName}
                onChange={(e) => this.setState({ materialName: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <Button onClick={() => this.filterStockList()} style={{ marginTop: '1rem' }}>
                Tìm
              </Button>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-3 bx--col-md-3">
              <Dropdown
                id="materialGroup-Dropdown"
                titleText="Nhóm vật tư"
                label=""
                items={materialGroups}
                selectedItem={materialGroup === '' ? null : materialGroups.find((e) => e.id === materialGroup)}
                onChange={(e) => this.setState({ materialGroup: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <Dropdown
                id="materialType-Dropdown"
                titleText="Loại vật tư (tài khoản kho)"
                label=""
                items={materialTypes}
                selectedItem={materialType === '' ? null : materialTypes.find((e) => e.id === materialType)}
                onChange={(e) => this.setState({ materialType: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            {auth.companyID === 'TCT_DS_VN' && (
              <div className="bx--col-lg-3 bx--col-md-3">
                <Dropdown
                  id="companyID-Dropdown"
                  titleText="Công ty"
                  label=""
                  items={companyIDs}
                  selectedItem={companyID === '' ? null : companyIDs.find((e) => e.id === companyID)}
                  onChange={(e) => this.setState({ companyID: e.selectedItem.id })}
                  disabled={auth.companyID !== 'TCT_DS_VN'}
                />
              </div>
            )}
            {auth.companyID !== 'TCT_DS_VN' && (
              <div className="bx--col-lg-3 bx--col-md-3">
                <Button onClick={() => this.exportStockReport()} style={{ marginTop: '1rem' }}>
                  Xuất báo cáo
                </Button>
              </div>
            )}
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title={`Có tất cả ${stockList.length} danh mục vật tư tồn kho.`}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>STT</TableHeader>
                      <TableHeader key="materialID">Mã vật tư</TableHeader>
                      <TableHeader key="materialName">Tên vật tư</TableHeader>
                      <TableHeader key="materialType">Loại vật tư</TableHeader>
                      <TableHeader key="materialGroup">Nhóm vật tư</TableHeader>
                      <TableHeader key="unit">Đơn vị</TableHeader>
                      <TableHeader key="quantity">Lượng tồn</TableHeader>
                      {auth.companyID === 'TCT_DS_VN' && <TableHeader key="companyID">Công ty</TableHeader>}
                      {auth.companyID !== 'TCT_DS_VN' && <TableHeader key="amount">Tiền tồn</TableHeader>}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stockListDisplay.map((row, index) => (
                      <TableRow key={`row-${index.toString()}}`}>
                        <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                        <TableCell key={`materialID-${index.toString()}`}>{row.materialID}</TableCell>
                        <TableCell key={`materialName-${index.toString()}`}>{row.materialName}</TableCell>
                        <TableCell key={`materialType-${index.toString()}`}>{row.materialTypeName}</TableCell>
                        <TableCell key={`materialGroup-${index.toString()}`}>{row.materialGroupName}</TableCell>
                        <TableCell key={`unit-${index.toString()}`}>{row.unit}</TableCell>
                        <TableCell key={`quantity-${index.toString()}`}>{row.stockQuantity}</TableCell>
                        {auth.companyID === 'TCT_DS_VN' && <TableCell key={`companyID-${index.toString()}`}>{row.companyName}</TableCell>}
                        {auth.companyID !== 'TCT_DS_VN' && <TableCell key={`amount-${index.toString()}`}>{CurrencyFormatter.format(row.amount)}</TableCell>}
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
                pageSizes={[10, 20, 30, 40, 50]}
                totalItems={stockListSearchResult.length}
                onChange={(target) => {
                  this.setState({
                    stockListDisplay: stockListSearchResult.slice((target.page - 1) * target.pageSize, target.page * target.pageSize),
                    page: target.page,
                    pageSize: target.pageSize,
                  });
                }}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2" />
          </div>
          <br />
          <br />
        </div>
      </div>
    );
  }
}

StockReport.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(StockReport);
