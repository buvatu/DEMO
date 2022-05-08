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
  OverflowMenu,
  OverflowMenuItem,
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
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Redirect } from 'react-router-dom';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { deleteMaterial, exportMaterialReport, getMaterialList } from '../../services';

class MaterialList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterMaterialID: '',
      filterMaterialGroup: '',
      materialGroups: [],
      filterMatetrialName: '',
      filterMaterialType: '',
      materialTypes: [],
      materialList: [],
      materialListDisplay: [],
      searchResult: [],
      page: 1,
      pageSize: 30,
      redirect: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading } = this.props;
    const { pageSize } = this.state;
    setLoading(true);
    const getMaterialListResult = await getMaterialList();
    setLoading(false);
    this.setState({
      materialGroups: [
        { id: 'phutungmuamoi', label: 'Phụ tùng mua mới' },
        { id: 'phutunggiacongcokhi', label: 'Phụ tùng gia công cơ khí' },
        { id: 'phutungkhoiphuc', label: 'Phụ tùng khôi phục' },
      ],
      materialTypes: [
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
      materialList: getMaterialListResult.data,
      searchResult: getMaterialListResult.data,
      materialListDisplay: getMaterialListResult.data.slice(0, pageSize),
    });
  };

  findMaterial = async () => {
    const { filterMaterialID, filterMaterialGroup, filterMatetrialName, filterMaterialType, pageSize, materialList } = this.state;
    let filterResult = JSON.parse(JSON.stringify(materialList));
    if (filterMaterialID !== '') {
      filterResult = filterResult.filter((e) => e.materialID.includes(filterMaterialID));
    }
    if (filterMatetrialName !== '') {
      filterResult = filterResult.filter((e) => e.materialName.includes(filterMatetrialName));
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

  removeMaterial = async (id) => {
    const { setLoading, setErrorMessage, setSubmitResult } = this.props;
    setLoading(true);
    try {
      await deleteMaterial(id);
      setSubmitResult('Danh mục vật tư được xoá thành công');
    } catch {
      setErrorMessage('Có lỗi xảy ra khi xoá danh mục vật tư');
    }
    setLoading(false);
  };

  reload = async () => {
    const { setLoading, setSubmitResult } = this.props;
    const { pageSize } = this.state;
    setSubmitResult('');
    setLoading(true);
    const getMaterialListResult = await getMaterialList();
    setLoading(false);
    this.setState({
      materialList: getMaterialListResult.data,
      searchResult: getMaterialListResult.data,
      materialListDisplay: getMaterialListResult.data.slice(0, pageSize),
      filterMaterialID: '',
      filterMaterialGroup: '',
      filterMatetrialName: '',
      filterMaterialType: '',
    });
  };

  downloadMaterialList = async () => {
    const { setErrorMessage, setLoading } = this.props;
    setLoading(true);
    await exportMaterialReport()
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Bao cao danh muc vat tu.xlsx');
        document.body.appendChild(link);
        link.click();
        setLoading(false);
      })
      .catch(() => {
        setErrorMessage('Có lỗi xảy ra khi xuất file báo cáo. Vui lòng thử lại');
        setLoading(false);
      });
  };

  render() {
    const {
      filterMaterialID,
      filterMaterialGroup,
      materialGroups,
      filterMatetrialName,
      filterMaterialType,
      materialTypes,
      materialList,
      materialListDisplay,
      searchResult,
      page,
      pageSize,
      redirect,
    } = this.state;
    if (redirect !== '') {
      return redirect;
    }
    const { common, setErrorMessage, history } = this.props;
    const { errorMessage, isLoading, submitResult } = common;

    return (
      <div className="material-list">
        {isLoading && <Loading description="Loading data. Please wait..." withOverlay />}
        {/* Success Modal */}
        <ComposedModal className="btn-success" open={submitResult !== ''} size="sm" onClose={() => this.reload()}>
          <ModalHeader iconDescription="Close" title={<div>Thao tác thành công</div>} />
          <ModalBody aria-label="Modal content">
            <div className="form-icon">
              <CloudUpload32 className="icon-prop" />
              <p className="bx--modal-content__text">{submitResult}</p>
            </div>
          </ModalBody>
          <ModalFooter onRequestSubmit={() => this.reload()} primaryButtonText="OK" secondaryButtonText="" />
        </ComposedModal>
        {/* Error Message */}
        <div className="bx--grid">
          <div className="bx--row">
            {errorMessage !== '' && <InlineNotification lowContrast kind="error" title={errorMessage} onCloseButtonClick={() => setErrorMessage('')} />}
          </div>
        </div>
        <br />
        <div className="view-header--box">
          <h4>Danh mục vật tư</h4>
        </div>
        <br />

        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput
                id="filterMaterialID-TextInput"
                placeholder="Vui lòng nhập một phần mã vật tư để tìm kiếm"
                labelText="Mã vật tư"
                value={filterMaterialID}
                onChange={(e) => this.setState({ filterMaterialID: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
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
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.findMaterial()} style={{ marginTop: '1rem' }}>
                Tìm
              </Button>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput
                id="filterMaterialName-TextInput"
                placeholder="Vui lòng nhập một phần tên vật tư để tìm kiếm"
                labelText="Tên vật tư"
                value={filterMatetrialName}
                onChange={(e) => this.setState({ filterMatetrialName: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
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
              <Button
                style={{ marginTop: '1rem' }}
                onClick={() => this.setState({ filterMaterialID: '', filterMaterialGroup: '', filterMatetrialName: '', filterMaterialType: '' })}
              >
                Xoá bộ lọc
              </Button>
            </div>
          </div>
          <br />
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
        </div>

        <div className="bx--grid">
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => history.push('/material/add')}>Thêm loại vật tư mới</Button>
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <Button onClick={() => this.downloadMaterialList()}>Xuất báo cáo danh mục vật tư</Button>
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title={`Có tất cả ${materialList.length} mục vật tư.`}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader key="materialID">Mã vật tư</TableHeader>
                      <TableHeader key="materialName">Tên vật tư</TableHeader>
                      <TableHeader key="materialTypeName">Loại vật tư</TableHeader>
                      <TableHeader key="materialGroupName">Nhóm vật tư</TableHeader>
                      <TableHeader key="unit">Đơn vị tính</TableHeader>
                      <TableHeader key="productCode">Mã nhà sản xuất</TableHeader>
                      <TableHeader key="minimumQuantity">Lượng tồn tối thiểu</TableHeader>
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
                        <TableCell key={`productCode-${index.toString()}`}>{material.productCode}</TableCell>
                        <TableCell key={`minimumQuantity-${index.toString()}`}>{material.minimumQuantity}</TableCell>
                        <TableCell>
                          <OverflowMenu>
                            <OverflowMenuItem
                              itemText="Sửa"
                              onClick={() => this.setState({ redirect: <Redirect to={`/material/update?materialID=${material.materialID}`} /> })}
                            />
                            <OverflowMenuItem itemText="Xoá" onClick={() => this.removeMaterial(material.id)} />
                          </OverflowMenu>
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
                pageSizes={[30, 40, 50]}
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
            <div className="bx--col-lg-2 bx--col-md-2" />
          </div>
          <br />
        </div>
      </div>
    );
  }
}

MaterialList.propTypes = {
  setSubmitResult: PropTypes.func.isRequired,
  setErrorMessage: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  common: PropTypes.shape({ submitResult: PropTypes.string, errorMessage: PropTypes.string, isLoading: PropTypes.bool }).isRequired,
  auth: PropTypes.shape({
    isAuthenticated: PropTypes.bool,
    userID: PropTypes.string,
    username: PropTypes.string,
    role: PropTypes.string,
    roleName: PropTypes.string,
    isActive: PropTypes.bool,
    companyID: PropTypes.string,
    companyName: PropTypes.string,
  }).isRequired,
  history: PropTypes.instanceOf(Object).isRequired,
};

const mapStateToProps = (state) => ({
  common: state.common,
  auth: state.common,
});

const mapDispatchToProps = (dispatch) => ({
  setErrorMessage: (errorMessage) => dispatch(assignErrorMessage(errorMessage)),
  setLoading: (loading) => dispatch(setLoadingValue(loading)),
  setSubmitResult: (submitResult) => dispatch(setSubmitValue(submitResult)),
});

export default connect(mapStateToProps, mapDispatchToProps)(MaterialList);
