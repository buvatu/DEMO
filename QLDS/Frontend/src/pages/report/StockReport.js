import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComboBox,
  ComposedModal,
  DataTable,
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
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { exportStockReport, filterStockList } from '../../services';

class StockReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterMaterialID: '',
      materialIDs: [],
      filterMaterialType: '',
      materialTypes: [],
      filterMaterialGroup: '',
      materialGroups: [],
      filterQuality: '',
      qualityList: [],

      stockList: [],
    };
  }

  componentDidMount = async () => {
    await this.getStockList();
    this.setState({
      materialGroups: [
        { id: '', label: '' },
        { id: 'phutungmuamoi', label: 'Phụ tùng mua mới' },
        { id: 'phutunggiacongcokhi', label: 'Phụ tùng gia công cơ khí' },
        { id: 'phutungkhoiphuc', label: 'Phụ tùng khôi phục' },
      ],
      materialTypes: [
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
      ],
      qualityList: [
        { id: '', label: '' },
        { id: 'Mới', label: 'Mới' },
        { id: 'Loại I', label: 'Loại I' },
        { id: 'Loại II', label: 'Loại II' },
        { id: 'Phế liệu', label: 'Phế liệu' },
      ],
    });
  };

  getStockList = async () => {
    const { setLoading, auth } = this.props;
    const { filterMaterialID, filterMaterialType, filterMaterialGroup, filterQuality } = this.state;
    setLoading(true);
    const getStockListResult = await filterStockList(filterMaterialID, filterMaterialType, filterMaterialGroup, filterQuality, auth.companyID);
    setLoading(false);
    this.setState({
      stockList: getStockListResult.data.map((e, index) => {
        e.id = index.toString();
        return e;
      }),
      materialIDs: [
        ...new Set(
          getStockListResult.data.map((e) => {
            return { id: e.material_id, label: e.material_id };
          })
        ),
      ],
    });
  };

  exportReport = async () => {
    const { auth, setErrorMessage } = this.props;
    const { filterMaterialID, filterMaterialType, filterMaterialGroup, filterQuality } = this.state;
    await exportStockReport(filterMaterialID, filterMaterialType, filterMaterialGroup, filterQuality, auth.companyID)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Bao cao ton kho.xlsx');
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => {
        setErrorMessage('Có lỗi xảy ra khi xuất file báo cáo. Vui lòng thử lại');
      });
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      filterMaterialID,
      materialIDs,
      filterMaterialType,
      materialTypes,
      filterMaterialGroup,
      materialGroups,
      filterQuality,
      qualityList,

      stockList,
    } = this.state;

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
            <div className="bx--col-lg-2 bx--col-md-2">
              <ComboBox
                id="filterMaterialID-Dropdown"
                placeholder="mã vật tư"
                titleText="Mã vật tư"
                label=""
                items={materialIDs}
                selectedItem={filterMaterialID === '' ? null : materialIDs.find((e) => e.id === filterMaterialID)}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                onChange={(e) => this.setState({ filterMaterialID: e.selectedItem == null ? '' : e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <Dropdown
                id="filterMaterialType-Dropdown"
                titleText="Loại vật tư (tài khoản kho)"
                label=""
                items={materialTypes}
                selectedItem={filterMaterialType === '' ? null : materialTypes.find((e) => e.id === filterMaterialType)}
                onChange={(e) => this.setState({ filterMaterialType: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.getStockList()} style={{ marginTop: '1rem' }}>
                Tìm
              </Button>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="filterMaterialGroup-Dropdown"
                titleText="Nhóm vật tư"
                label=""
                items={materialGroups}
                selectedItem={filterMaterialGroup === '' ? null : materialGroups.find((e) => e.id === filterMaterialGroup)}
                onChange={(e) => this.setState({ filterMaterialGroup: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-3 bx--col-md-3">
              <Dropdown
                id="filterQuality-Dropdown"
                titleText="Chất lượng"
                label=""
                items={qualityList}
                selectedItem={filterQuality === '' ? null : qualityList.find((e) => e.id === filterQuality)}
                onChange={(e) => this.setState({ filterQuality: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.exportReport()} style={{ marginTop: '1rem' }}>
                Xuất báo cáo
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <DataTable
                rows={stockList}
                headers={[
                  { header: 'Mã vật tư', key: 'material_id' },
                  { header: 'Tên vật tư', key: 'material_name' },
                  { header: 'Đơn vị tính', key: 'unit' },
                  { header: 'Chất lượng', key: 'quality' },
                  { header: 'Số lượng tồn', key: 'quantity' },
                  { header: 'Giá vốn', key: 'price' },
                  { header: 'Tiền tồn', key: 'amount' },
                ]}
                render={({ rows, headers }) => (
                  <div>
                    <TableContainer title={`Có tất cả ${stockList.length} danh mục vật tư tồn kho.`}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {headers.map((header) => (
                              <TableHeader key={header.key}>{header.header}</TableHeader>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow key={row.id}>
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
