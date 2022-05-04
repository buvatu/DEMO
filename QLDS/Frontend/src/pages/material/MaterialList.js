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
      page: 1,
      pageSize: 30,
      redirect: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading } = this.props;
    const { filterMaterialID, filterMaterialGroup, filterMatetrialName, filterMaterialType, pageSize } = this.state;
    setLoading(true);
    const getMaterialListResult = await getMaterialList(filterMaterialID, filterMaterialGroup, filterMatetrialName, filterMaterialType);
    setLoading(false);
    const materialList = getMaterialListResult.data.map((e, index) => {
      e.id = index.toString();
      return e;
    });
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
      materialList,
      materialListDisplay: materialList.slice(0, pageSize),
    });
  };

  findMaterial = async () => {
    const { setLoading } = this.props;
    const { filterMaterialID, filterMaterialGroup, filterMatetrialName, filterMaterialType, pageSize } = this.state;
    setLoading(true);
    const getMaterialListResult = await getMaterialList(filterMaterialID, filterMatetrialName, filterMaterialGroup, filterMaterialType);
    setLoading(false);
    const materialList = getMaterialListResult.data.map((e, index) => {
      e.id = index.toString();
      return e;
    });
    this.setState({
      materialList,
      materialListDisplay: materialList.slice(0, pageSize),
    });
  };

  removeMaterial = async (materialID) => {
    const { setLoading, setErrorMessage, setSubmitResult } = this.props;
    setLoading(true);
    const getDeleteMaterialResult = await deleteMaterial(materialID);
    if (getDeleteMaterialResult.data === 1) {
      setSubmitResult('Danh mục vật tư được xoá thành công');
    } else {
      setErrorMessage('Có lỗi xảy ra khi xoá danh mục vật tư');
    }
    setLoading(false);
  };

  reload = async () => {
    const { setLoading, setSubmitResult } = this.props;
    const { pageSize } = this.state;
    setSubmitResult('');
    setLoading(true);
    const getMaterialListResult = await getMaterialList('', '', '', '');
    setLoading(false);
    const materialList = getMaterialListResult.data.map((e, index) => {
      e.id = index.toString();
      return e;
    });
    this.setState({
      materialList,
      materialListDisplay: materialList.slice(0, pageSize),
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
              <ComboBox
                id="materialID-ComboBox"
                titleText="Loại vật tư"
                placeholder=""
                label=""
                items={materialList
                  .map((e) => {
                    return {
                      id: e.material_id,
                      label: e.material_id.concat(' - ').concat(e.material_name),
                    };
                  })
                  .sort((a, b) => a.label.split(' - ')[1].localeCompare(b.label.split(' - ')[1]))}
                selectedItem={
                  filterMaterialID === ''
                    ? null
                    : materialList
                        .map((e) => {
                          return {
                            id: e.material_id,
                            label: e.material_id.concat(' - ').concat(e.material_name),
                          };
                        })
                        .find((e) => e.id === filterMaterialID)
                }
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                onChange={(e) => {
                  if (e.selectedItem == null) {
                    this.setState({
                      filterMaterialID: '',
                      filterMatetrialName: '',
                      filterMaterialGroup: '',
                      filterMaterialType: '',
                    });
                  } else {
                    const selectedMaterial = materialList.find((item) => item.material_id === e.selectedItem.id);
                    this.setState({
                      filterMaterialID: selectedMaterial.material_id,
                      filterMatetrialName: selectedMaterial.material_name,
                      filterMaterialGroup: selectedMaterial.material_group_id,
                      filterMaterialType: selectedMaterial.material_type_id,
                      materialListDisplay: materialList.filter((item) => item.material_id === e.selectedItem.id),
                    });
                  }
                }}
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
                placeholder="Vui lòng nhập tên vật tư"
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
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                onClick={() =>
                  this.setState({
                    page: Math.ceil(materialList.length / pageSize),
                    materialListDisplay: materialList.slice(
                      (Math.ceil(materialList.length / pageSize) - 1) * pageSize,
                      Math.ceil(materialList.length / pageSize) * pageSize
                    ),
                  })
                }
              >
                Tới trang cuối
              </Button>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <DataTable
                rows={materialListDisplay}
                headers={[
                  { header: 'Mã vật tư', key: 'material_id' },
                  { header: 'Tên vật tư', key: 'material_name' },
                  { header: 'Loại vật tư', key: 'material_type_name' },
                  { header: 'Nhóm vật tư', key: 'material_group_name' },
                  { header: 'Đơn vị', key: 'unit' },
                  { header: 'Mã nhà sản xuất', key: 'product_code' },
                  { header: 'Lượng tồn tối thiểu', key: 'minimum_quantity' },
                  { header: 'Mã thông số kĩ thuật', key: 'tech_spec_id' },
                ]}
                render={({ rows, headers }) => (
                  <div>
                    <TableContainer title={`Có tất cả ${materialList.length} mục vật tư.`}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            {headers.map((header) => (
                              <TableHeader key={header.key}>{header.header}</TableHeader>
                            ))}
                            <TableHeader />
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow key={row.id}>
                              {row.cells.map((cell) => (
                                <TableCell key={cell.id}>{cell.value}</TableCell>
                              ))}
                              <TableCell>
                                <OverflowMenu>
                                  <OverflowMenuItem
                                    itemText="Sửa"
                                    onClick={() => this.setState({ redirect: <Redirect to={`/material/update?materialID=${row.cells[0].value}`} /> })}
                                  />
                                  <OverflowMenuItem itemText="Xoá" onClick={() => this.removeMaterial(row.cells[0].value)} />
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
                      totalItems={materialList.length}
                      onChange={(target) => {
                        this.setState({
                          materialListDisplay: materialList.slice((target.page - 1) * target.pageSize, target.page * target.pageSize),
                          page: target.page,
                          pageSize: target.pageSize,
                        });
                      }}
                    />
                  </div>
                )}
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
