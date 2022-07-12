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
import { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setMaterialListValue, setSubmitValue } from '../../actions/commonAction';
import {
  addEngineAnalysisInfo,
  exportEngineAnalysisReport,
  getEngineAnalysisDetailList,
  getEngineAnalysisInfo,
  getEngineListByCompany,
  getMaterialListWithStockQuantity,
  getScrapClassifyList,
  insertEngineAnalysisDetailList,
  insertScrapClassifyList,
} from '../../services';

class EngineAnalysis extends Component {
  constructor(props) {
    super(props);
    const { auth } = this.props;
    this.state = {
      engineAnalysisInfo: {
        id: '',
        engineAnalysisName: '',
        engineID: '',
        companyID: auth.companyID,
        repairLevel: '',
        repairDate: this.formatDate(new Date()),
      },
      engineAnalysisDetailList: [],
      scrapClassifyDetailList: [],
      engineAnalysisNameErrorMessage: '',
      engineIDErrorMessage: '',
      engineList: [],

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
    const { setLoading, setErrorMessage, location, auth, common, setMaterialList } = this.props;
    const params = new URLSearchParams(location.search);

    setLoading(true);
    let { materialList } = common;
    try {
      if (materialList.length === 0) {
        const getMaterialListResult = await getMaterialListWithStockQuantity(auth.companyID);
        materialList = getMaterialListResult.data;
        setMaterialList(materialList);
      }
      const getEngineListResult = await getEngineListByCompany(auth.companyID);
      this.setState({
        materialList,
        searchResult: materialList,
        materialListDisplay: materialList.slice(0, 5),
        engineList: getEngineListResult.data,
      });
    } catch {
      setErrorMessage('Lỗi khi tải trang. Vui lòng thử lại!!!');
      setLoading(false);
      return;
    }

    if (params != null && params.get('engineAnalysisID') != null) {
      try {
        const engineAnalysisID = params.get('engineAnalysisID');
        const getEngineAnalysisInfoResult = await getEngineAnalysisInfo(engineAnalysisID);
        const getEngineAnalysisDetailsResult = await getEngineAnalysisDetailList(engineAnalysisID);
        const getScrapClassifyResult = await getScrapClassifyList(engineAnalysisID);
        this.setState({
          engineAnalysisInfo: getEngineAnalysisInfoResult.data,
          engineAnalysisDetailList: getEngineAnalysisDetailsResult.data.map((e) => {
            const material = materialList.find((item) => item.materialID === e.materialID);
            e.materialName = material.materialName;
            e.unit = material.unit;
            return e;
          }),
          scrapClassifyDetailList: getScrapClassifyResult.data.map((e) => {
            const material = materialList.find((item) => item.materialID === e.materialID);
            e.materialName = material.materialName;
            e.unit = material.unit;
            return e;
          }),
        });
      } catch (error) {
        setErrorMessage('Mã biên bản giải thể không tồn tại!!!');
        setLoading(false);
        return;
      }
    }

    setLoading(false);
  };

  findMaterial = () => {
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

  formatDate = (inputDate) => {
    const yyyy = inputDate.getFullYear().toString();
    const mm = `0${inputDate.getMonth() + 1}`.slice(-2);
    const dd = `0${inputDate.getDate()}`.slice(-2);
    return `${dd}/${mm}/${yyyy}`;
  };

  save = async () => {
    const { setLoading, setErrorMessage, setSubmitResult } = this.props;
    const { engineAnalysisInfo, engineAnalysisDetailList, scrapClassifyDetailList } = this.state;

    let hasError = false;
    if (engineAnalysisInfo.engineAnalysisName === '') {
      hasError = true;
      this.setState({ engineAnalysisNameErrorMessage: 'Tên biên bản không được bỏ trống' });
    }
    if (engineAnalysisInfo.engineID === '') {
      hasError = true;
      this.setState({ engineIDErrorMessage: 'Số hiệu đầu máy không được bỏ trống' });
    }

    if (engineAnalysisDetailList.length === 0) {
      hasError = true;
      this.scrollToTop();
      setErrorMessage('Nội dung biên bản giải thể không thể bỏ trống');
    }

    if (scrapClassifyDetailList.length === 0) {
      hasError = true;
      this.scrollToTop();
      setErrorMessage('Nội dung biên bản giải thể không thể bỏ trống');
    }

    if (engineAnalysisDetailList.length !== scrapClassifyDetailList.length) {
      this.scrollToTop();
      hasError = true;
      setErrorMessage('Số lượng phế liệu không trùng với số lượng vật tư giải thể. Vui lòng kiểm tra lại.');
      return;
    }

    engineAnalysisDetailList.forEach((e) => {
      if (e.measure === '' || e.status === '' || Number(e.quantity) < 1) {
        hasError = true;
      }
    });

    scrapClassifyDetailList.forEach((e) => {
      if (e.quality === '' || Number(e.quantity) < 1) {
        hasError = true;
      }
    });
    if (hasError) {
      this.scrollToTop();
      setErrorMessage('Biên bản giải thể hoặc Phân loại phế liệu không đúng định dạng. Vui lòng kiểm tra lại.');
      return;
    }

    setLoading(true);
    try {
      let engineAnalysisID = engineAnalysisInfo.id;
      if (engineAnalysisInfo.id === '') {
        const saveEngineAnalysisInfoResult = await addEngineAnalysisInfo(engineAnalysisInfo);
        engineAnalysisID = saveEngineAnalysisInfoResult.data.id;
        this.setState({ engineAnalysisInfo: saveEngineAnalysisInfoResult.data });
      }
      await insertEngineAnalysisDetailList(engineAnalysisID, engineAnalysisDetailList);
      await insertScrapClassifyList(engineAnalysisID, scrapClassifyDetailList);
      setSubmitResult('Biên bản giải thể đầu máy đã được lưu thành công');
    } catch (error) {
      this.scrollToTop();
      setErrorMessage('Lỗi khi thêm biên bản giải thể. Vui lòng kiểm tra lại.');
    }
    setLoading(false);
  };

  exportReport = async () => {
    const { setErrorMessage } = this.props;
    const { engineAnalysisInfo } = this.state;
    await exportEngineAnalysisReport(engineAnalysisInfo.id)
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'Bien_ban_giai_the.xlsx');
        document.body.appendChild(link);
        link.click();
      })
      .catch(() => {
        setErrorMessage('Có lỗi xảy ra khi xuất file báo cáo. Vui lòng thử lại');
      });
  };

  addEngineAnalysisDetail = (material, part) => {
    const { engineAnalysisDetailList, scrapClassifyDetailList, engineAnalysisInfo, materialList } = this.state;
    const { setErrorMessage } = this.props;
    engineAnalysisDetailList.push({
      id: '',
      engineAnalysisID: engineAnalysisInfo.id,
      materialID: material.materialID,
      materialName: material.materialName,
      unit: material.unit,
      part,
      quantity: 1,
      status: '',
      measure: '',
    });
    this.setState({ engineAnalysisDetailList });
    const scrapItem = materialList.find((e) => e.materialTypeID === '1527' && e.materialName.includes(material.materialName));
    if (scrapItem != null) {
      scrapClassifyDetailList.push({
        id: '',
        materialID: scrapItem.materialID,
        materialName: scrapItem.materialName,
        unit: material.unit,
        quantity: 1,
        quanlity: '',
      });
      this.setState({ scrapClassifyDetailList });
    } else {
      this.scrollToTop();
      setErrorMessage('Không tìm thấy vật tư phế liệu tương ứng. Vui lòng thêm vào danh mục phân loại phế liệu thủ công.');
    }
  };

  addScrapClassifyDetail = (material) => {
    const { scrapClassifyDetailList } = this.state;
    scrapClassifyDetailList.push({
      id: '',
      materialID: material.materialID,
      materialName: material.materialName,
      unit: material.unit,
      quantity: 1,
      quanlity: '',
    });
    this.setState({ scrapClassifyDetailList });
  };

  scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common, auth } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      engineAnalysisInfo,
      engineAnalysisDetailList,
      scrapClassifyDetailList,
      engineAnalysisNameErrorMessage,
      engineIDErrorMessage,
      engineList,
      filterMaterialID,
      filterMaterialGroup,
      filterMatetrialName,
      filterMaterialType,
      materialListDisplay,
      searchResult,
      page,
      pageSize,
    } = this.state;

    const engineIDList = engineList.map((e) => {
      return { id: e.engineID, label: e.engineID };
    });

    const repairLevelList = [
      { id: 'Đột xuất', label: 'Đột xuất' },
      { id: 'Ro', label: 'Ro' },
      { id: 'Rt', label: 'Rt' },
      { id: 'R1', label: 'R1' },
      { id: 'R2', label: 'R2' },
      { id: 'Đại tu', label: 'Đại tu' },
    ];

    const measureList = [
      { id: 'Thay mới', label: 'Thay mới' },
      { id: 'Lĩnh mới', label: 'Lĩnh mới' },
      { id: 'Thay khôi phục', label: 'Thay khôi phục' },
    ];

    const qualityList = [
      { id: 'Loại I', label: 'Loại I' },
      { id: 'Loại II', label: 'Loại II' },
      { id: 'Loại III', label: 'Loại III' },
    ];

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

    const electricPartSize = engineAnalysisDetailList.filter((e) => e.part === 'phandien').length;
    const chassisPartSize = engineAnalysisDetailList.filter((e) => e.part === 'phankhunggam').length;
    const enginePartSize = engineAnalysisDetailList.filter((e) => e.part === 'phandongco').length;
    const breakPartSize = engineAnalysisDetailList.filter((e) => e.part === 'phanham').length;
    const machanicPartSize = engineAnalysisDetailList.filter((e) => e.part === 'phancokhi').length;

    return (
      <div className="engine-analyst">
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
              history.push(`/engine/analysis?engineAnalysisID=${engineAnalysisInfo.id}`);
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
          <h4>Biên bản giải thể đầu máy</h4>
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
              <TextInput
                id="engineAnalysisName-TextInput"
                placeholder=""
                labelText="Tên biên bản giải thể"
                value={engineAnalysisInfo.engineAnalysisName}
                onChange={(e) =>
                  this.setState((prevState) => ({
                    engineAnalysisInfo: { ...prevState.engineAnalysisInfo, engineAnalysisName: e.target.value },
                    engineAnalysisNameErrorMessage: '',
                  }))
                }
                invalid={engineAnalysisNameErrorMessage !== ''}
                invalidText={engineAnalysisNameErrorMessage}
                disabled={engineAnalysisInfo.id !== ''}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="engineID-Dropdown"
                titleText="Số hiệu đầu máy"
                label=""
                helperText={engineAnalysisInfo.engineID === '' ? '' : engineList.find((e) => e.engineID === engineAnalysisInfo.engineID).engineType}
                items={engineIDList}
                selectedItem={engineAnalysisInfo.engineID === '' ? null : engineIDList.find((e) => e.id === engineAnalysisInfo.engineID)}
                onChange={(e) =>
                  this.setState((prevState) => ({
                    engineAnalysisInfo: { ...prevState.engineAnalysisInfo, engineID: e.selectedItem == null ? '' : e.selectedItem.id },
                    engineIDErrorMessage: '',
                  }))
                }
                invalid={engineIDErrorMessage !== ''}
                invalidText={engineIDErrorMessage}
                disabled={engineAnalysisInfo.id !== ''}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="repairLevel-Dropdown"
                titleText="Cấp sửa chữa"
                label=""
                items={repairLevelList}
                selectedItem={engineAnalysisInfo.repairLevel === '' ? null : repairLevelList.find((e) => e.id === engineAnalysisInfo.repairLevel)}
                onChange={(e) =>
                  this.setState((prevState) => ({
                    engineAnalysisInfo: { ...prevState.engineAnalysisInfo, repairLevel: e.selectedItem == null ? '' : e.selectedItem.id },
                  }))
                }
                disabled={engineAnalysisInfo.id !== ''}
              />
            </div>
            <div className="bx--col-lg-3 bx--col-md-3">
              <DatePicker
                datePickerType="single"
                dateFormat="d/m/Y"
                onChange={(e) => this.setState((prevState) => ({ engineAnalysisInfo: { ...prevState.engineAnalysisInfo, repairDate: this.formatDate(e[0]) } }))}
                value={engineAnalysisInfo.repairDate}
              >
                <DatePickerInput
                  datePickerType="single"
                  placeholder="dd/mm/yyyy"
                  labelText="Ngày vào sửa chữa"
                  id="repairDate-datepicker"
                  disabled={engineAnalysisInfo.id !== ''}
                />
              </DatePicker>
            </div>
            {auth.role === 'phongkythuat' && (
              <div className="bx--col-lg-3 bx--col-md-3">
                <Button onClick={() => this.save()} style={{ marginTop: '1rem' }}>
                  Lưu thông tin
                </Button>
                <Button onClick={() => this.exportReport()} style={{ marginTop: '1rem', marginLeft: '1rem' }}>
                  Xuất ra file
                </Button>
              </div>
            )}
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
        </div>
        {auth.role === 'phongkythuat' && (
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
            <hr className="LeftNav-module--divider--1Z49I" />
            <div className="bx--row">
              <div className="bx--col-lg-2 bx--col-md-2" />
              <div className="bx--col-lg-12">
                <TableContainer title={`Kết quả tìm kiếm cho ra ${searchResult.length} mục vật tư tương ứng.`}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableHeader key="materialID">Mã vật tư</TableHeader>
                        <TableHeader key="materialName">Tên vật tư</TableHeader>
                        <TableHeader key="materialTypeName">Loại vật tư</TableHeader>
                        <TableHeader key="materialGroupName">Nhóm vật tư</TableHeader>
                        <TableHeader key="unit">Đơn vị tính</TableHeader>
                        <TableHeader key="minimumQuantity">Lượng tồn tối thiểu</TableHeader>
                        <TableHeader key="stockQuantity">Lượng tồn trong kho</TableHeader>
                        <TableHeader style={{ minWidth: '12%' }} />
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
                          <TableCell key={`action-${index.toString()}`}>
                            <OverflowMenu ariaLabel="overflow-menu" size="md">
                              <OverflowMenuItem
                                itemText="Thêm vào phần Điện"
                                onClick={() => this.addEngineAnalysisDetail(material, 'phandien')}
                                disabled={engineAnalysisDetailList.find((e) => e.materialID === material.materialID) != null}
                              />
                              <OverflowMenuItem
                                itemText="Thêm vào phần Khung Gầm"
                                onClick={() => this.addEngineAnalysisDetail(material, 'phankhunggam')}
                                disabled={engineAnalysisDetailList.find((e) => e.materialID === material.materialID) != null}
                              />
                              <OverflowMenuItem
                                itemText="Thêm vào phần Động Cơ"
                                onClick={() => this.addEngineAnalysisDetail(material, 'phandongco')}
                                disabled={engineAnalysisDetailList.find((e) => e.materialID === material.materialID) != null}
                              />
                              <OverflowMenuItem
                                itemText="Thêm vào phần Hãm"
                                onClick={() => this.addEngineAnalysisDetail(material, 'phanham')}
                                disabled={engineAnalysisDetailList.find((e) => e.materialID === material.materialID) != null}
                              />
                              <OverflowMenuItem
                                itemText="Thêm vào phần Cơ Khí"
                                onClick={() => this.addEngineAnalysisDetail(material, 'phancokhi')}
                                disabled={engineAnalysisDetailList.find((e) => e.materialID === material.materialID) != null}
                              />
                              <OverflowMenuItem
                                itemText="Thêm vào phần Truyền Động"
                                onClick={() => this.addEngineAnalysisDetail(material, 'phantruyendong')}
                                disabled={engineAnalysisDetailList.find((e) => e.materialID === material.materialID) != null}
                              />
                              <OverflowMenuItem
                                hasDivider
                                itemText="Thêm vào phần Phế Liệu"
                                onClick={() => this.addScrapClassifyDetail(material)}
                                disabled={scrapClassifyDetailList.find((e) => e.materialID === material.materialID) != null}
                              />
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
          </div>
        )}
        <br />
        <div className="bx--grid">
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title="Chi tiết danh mục giải thể">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader style={{ width: '5%' }} />
                      <TableHeader key="stt" style={{ width: '5%' }}>
                        STT
                      </TableHeader>
                      <TableHeader key="materialID">Mã vật tư</TableHeader>
                      <TableHeader key="materialName">Tên vật tư</TableHeader>
                      <TableHeader key="unit" style={{ width: '5%' }}>
                        Đơn vị
                      </TableHeader>
                      <TableHeader key="quantity" style={{ width: '10%' }}>
                        Số lượng
                      </TableHeader>
                      <TableHeader key="status" style={{ width: '12.5%' }}>
                        Trạng thái giải thể
                      </TableHeader>
                      <TableHeader key="measure" style={{ width: '12.5%' }}>
                        Biện pháp
                      </TableHeader>
                      <TableHeader style={{ width: '7.5%' }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow key="phandien">
                      <TableCell colSpan={9}>
                        <strong>Phần Điện</strong>
                      </TableCell>
                    </TableRow>
                    {engineAnalysisDetailList
                      .filter((e) => e.part === 'phandien')
                      .map((row, index) => (
                        <TableRow key={`row-dien-${index.toString()}`}>
                          <TableCell />
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{row.materialID}</TableCell>
                          <TableCell>{row.materialName}</TableCell>
                          <TableCell>{row.unit}</TableCell>
                          <TableCell>
                            <TextInput
                              id={`quantity-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                if (e.target.value !== '' && (!e.target.value.match(/^\d+$/) || Number(e.target.value) < 1)) {
                                  return;
                                }
                                engineAnalysisDetailList[index].quantity = Number(e.target.value);
                                this.setState({ engineAnalysisDetailList });
                              }}
                              value={engineAnalysisDetailList[index].quantity}
                              invalidText="Số lượng không hợp lệ"
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell key={`status-${index.toString()}`}>
                            <TextInput
                              id={`status-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                engineAnalysisDetailList[index].status = e.target.value;
                                this.setState({ engineAnalysisDetailList });
                              }}
                              value={engineAnalysisDetailList[index].status}
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell key={`measure-${index.toString()}`}>
                            <Dropdown
                              id={`measure-Dropdown-${index}`}
                              titleText=""
                              label=""
                              items={measureList}
                              selectedItem={
                                engineAnalysisDetailList[index].measure === '' ? null : measureList.find((e) => e.id === engineAnalysisDetailList[index].measure)
                              }
                              onChange={(e) => {
                                engineAnalysisDetailList[index].measure = e.selectedItem.id;
                                this.setState({ engineAnalysisDetailList });
                              }}
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => {
                                this.setState({
                                  engineAnalysisDetailList: engineAnalysisDetailList.filter((e) => e.materialID !== row.materialID),
                                });
                              }}
                              disabled={auth.role !== 'phongkythuat'}
                            >
                              Xoá
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    <TableRow key="phankhunggam">
                      <TableCell colSpan={9}>
                        <strong>Phần Khung gầm</strong>
                      </TableCell>
                    </TableRow>
                    {engineAnalysisDetailList
                      .filter((e) => e.part === 'phankhunggam')
                      .map((row, index) => (
                        <TableRow key={`row-khunggam-${index.toString()}`}>
                          <TableCell />
                          <TableCell>{index + electricPartSize + 1}</TableCell>
                          <TableCell>{row.materialID}</TableCell>
                          <TableCell>{row.materialName}</TableCell>
                          <TableCell>{row.unit}</TableCell>
                          <TableCell>
                            <TextInput
                              id={`quantity-textinput-${index + electricPartSize}`}
                              labelText=""
                              onChange={(e) => {
                                if (e.target.value !== '' && (!e.target.value.match(/^\d+$/) || Number(e.target.value) < 1)) {
                                  return;
                                }
                                engineAnalysisDetailList[index + electricPartSize].quantity = Number(e.target.value);
                                this.setState({ engineAnalysisDetailList });
                              }}
                              value={engineAnalysisDetailList[index + electricPartSize].quantity}
                              invalidText="Số lượng không hợp lệ"
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell key={`status-${index + electricPartSize}`}>
                            <TextInput
                              id={`status-textinput-${index + electricPartSize}`}
                              labelText=""
                              onChange={(e) => {
                                engineAnalysisDetailList[index + electricPartSize].status = e.target.value;
                                this.setState({ engineAnalysisDetailList });
                              }}
                              value={engineAnalysisDetailList[index + electricPartSize].status}
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell key={`measure-${index + electricPartSize}`}>
                            <Dropdown
                              id={`measure-Dropdown-${index + electricPartSize}`}
                              titleText=""
                              label=""
                              items={measureList}
                              selectedItem={
                                engineAnalysisDetailList[index + electricPartSize].measure === ''
                                  ? null
                                  : measureList.find((e) => e.id === engineAnalysisDetailList[index + electricPartSize].measure)
                              }
                              onChange={(e) => {
                                engineAnalysisDetailList[index + electricPartSize].measure = e.selectedItem.id;
                                this.setState({ engineAnalysisDetailList });
                              }}
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => {
                                this.setState({
                                  engineAnalysisDetailList: engineAnalysisDetailList.filter((e) => e.materialID !== row.materialID),
                                });
                              }}
                              disabled={auth.role !== 'phongkythuat'}
                            >
                              Xoá
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    <TableRow key="phandongco">
                      <TableCell colSpan={9}>
                        <strong>Phần Động cơ</strong>
                      </TableCell>
                    </TableRow>
                    {engineAnalysisDetailList
                      .filter((e) => e.part === 'phandongco')
                      .map((row, index) => (
                        <TableRow key={`row-dongco-${index.toString()}`}>
                          <TableCell />
                          <TableCell>{index + electricPartSize + chassisPartSize + 1}</TableCell>
                          <TableCell>{row.materialID}</TableCell>
                          <TableCell>{row.materialName}</TableCell>
                          <TableCell>{row.unit}</TableCell>
                          <TableCell>
                            <TextInput
                              id={`quantity-textinput-${index + electricPartSize + chassisPartSize}`}
                              labelText=""
                              onChange={(e) => {
                                if (e.target.value !== '' && (!e.target.value.match(/^\d+$/) || Number(e.target.value) < 1)) {
                                  return;
                                }
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize].quantity = Number(e.target.value);
                                this.setState({ engineAnalysisDetailList });
                              }}
                              value={engineAnalysisDetailList[index + electricPartSize + chassisPartSize].quantity}
                              invalidText="Số lượng không hợp lệ"
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell key={`status-${index + electricPartSize + chassisPartSize}`}>
                            <TextInput
                              id={`status-textinput-${index + electricPartSize + chassisPartSize}`}
                              labelText=""
                              onChange={(e) => {
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize].status = e.target.value;
                                this.setState({ engineAnalysisDetailList });
                              }}
                              value={engineAnalysisDetailList[index + electricPartSize + chassisPartSize].status}
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell key={`measure-${index + electricPartSize + chassisPartSize}`}>
                            <Dropdown
                              id={`measure-Dropdown-${index + electricPartSize + chassisPartSize}`}
                              titleText=""
                              label=""
                              items={measureList}
                              selectedItem={
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize].measure === ''
                                  ? null
                                  : measureList.find((e) => e.id === engineAnalysisDetailList[index + electricPartSize + chassisPartSize].measure)
                              }
                              onChange={(e) => {
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize].measure = e.selectedItem.id;
                                this.setState({ engineAnalysisDetailList });
                              }}
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => {
                                this.setState({
                                  engineAnalysisDetailList: engineAnalysisDetailList.filter((e) => e.materialID !== row.materialID),
                                });
                              }}
                              disabled={auth.role !== 'phongkythuat'}
                            >
                              Xoá
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    <TableRow key="phanham">
                      <TableCell colSpan={9}>
                        <strong>Phần Hãm</strong>
                      </TableCell>
                    </TableRow>
                    {engineAnalysisDetailList
                      .filter((e) => e.part === 'phanham')
                      .map((row, index) => (
                        <TableRow key={`row-dongco-${index.toString()}`}>
                          <TableCell />
                          <TableCell>{index + electricPartSize + chassisPartSize + enginePartSize + 1}</TableCell>
                          <TableCell>{row.materialID}</TableCell>
                          <TableCell>{row.materialName}</TableCell>
                          <TableCell>{row.unit}</TableCell>
                          <TableCell>
                            <TextInput
                              id={`quantity-textinput-${index + electricPartSize + chassisPartSize + enginePartSize}`}
                              labelText=""
                              onChange={(e) => {
                                if (e.target.value !== '' && (!e.target.value.match(/^\d+$/) || Number(e.target.value) < 1)) {
                                  return;
                                }
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize].quantity = Number(e.target.value);
                                this.setState({ engineAnalysisDetailList });
                              }}
                              value={engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize].quantity}
                              invalidText="Số lượng không hợp lệ"
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell key={`status-${index + electricPartSize + chassisPartSize + enginePartSize}`}>
                            <TextInput
                              id={`status-textinput-${index + electricPartSize + chassisPartSize + enginePartSize}`}
                              labelText=""
                              onChange={(e) => {
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize].status = e.target.value;
                                this.setState({ engineAnalysisDetailList });
                              }}
                              value={engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize].status}
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell key={`measure-${index + electricPartSize + chassisPartSize + enginePartSize}`}>
                            <Dropdown
                              id={`measure-Dropdown-${index + electricPartSize + chassisPartSize + enginePartSize}`}
                              titleText=""
                              label=""
                              items={measureList}
                              selectedItem={
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize].measure === ''
                                  ? null
                                  : measureList.find(
                                      (e) => e.id === engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize].measure
                                    )
                              }
                              onChange={(e) => {
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize].measure = e.selectedItem.id;
                                this.setState({ engineAnalysisDetailList });
                              }}
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => {
                                this.setState({
                                  engineAnalysisDetailList: engineAnalysisDetailList.filter((e) => e.materialID !== row.materialID),
                                });
                              }}
                              disabled={auth.role !== 'phongkythuat'}
                            >
                              Xoá
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    <TableRow key="phancokhi">
                      <TableCell colSpan={9}>
                        <strong>Phần Cơ khí</strong>
                      </TableCell>
                    </TableRow>
                    {engineAnalysisDetailList
                      .filter((e) => e.part === 'phancokhi')
                      .map((row, index) => (
                        <TableRow key={`row-dongco-${index.toString()}`}>
                          <TableCell />
                          <TableCell>{index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + 1}</TableCell>
                          <TableCell>{row.materialID}</TableCell>
                          <TableCell>{row.materialName}</TableCell>
                          <TableCell>{row.unit}</TableCell>
                          <TableCell>
                            <TextInput
                              id={`quantity-textinput-${index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize}`}
                              labelText=""
                              onChange={(e) => {
                                if (e.target.value !== '' && (!e.target.value.match(/^\d+$/) || Number(e.target.value) < 1)) {
                                  return;
                                }
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize].quantity = Number(
                                  e.target.value
                                );
                                this.setState({ engineAnalysisDetailList });
                              }}
                              value={engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize].quantity}
                              invalidText="Số lượng không hợp lệ"
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell key={`status-${index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize}`}>
                            <TextInput
                              id={`status-textinput-${index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize}`}
                              labelText=""
                              onChange={(e) => {
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize].status = e.target.value;
                                this.setState({ engineAnalysisDetailList });
                              }}
                              value={engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize].status}
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell key={`measure-${index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize}`}>
                            <Dropdown
                              id={`measure-Dropdown-${index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize}`}
                              titleText=""
                              label=""
                              items={measureList}
                              selectedItem={
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize].measure === ''
                                  ? null
                                  : measureList.find(
                                      (e) =>
                                        e.id === engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize].measure
                                    )
                              }
                              onChange={(e) => {
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize].measure = e.selectedItem.id;
                                this.setState({ engineAnalysisDetailList });
                              }}
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => {
                                this.setState({
                                  engineAnalysisDetailList: engineAnalysisDetailList.filter((e) => e.materialID !== row.materialID),
                                });
                              }}
                              disabled={auth.role !== 'phongkythuat'}
                            >
                              Xoá
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    <TableRow key="phantruyendong">
                      <TableCell colSpan={9}>
                        <strong>Phần Truyền động - Tổng hợp</strong>
                      </TableCell>
                    </TableRow>
                    {engineAnalysisDetailList
                      .filter((e) => e.part === 'phantruyendong')
                      .map((row, index) => (
                        <TableRow key={`row-dongco-${index.toString()}`}>
                          <TableCell />
                          <TableCell>{index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + machanicPartSize + 1}</TableCell>
                          <TableCell>{row.materialID}</TableCell>
                          <TableCell>{row.materialName}</TableCell>
                          <TableCell>{row.unit}</TableCell>
                          <TableCell>
                            <TextInput
                              id={`quantity-textinput-${index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + machanicPartSize}`}
                              labelText=""
                              onChange={(e) => {
                                if (e.target.value !== '' && (!e.target.value.match(/^\d+$/) || Number(e.target.value) < 1)) {
                                  return;
                                }
                                engineAnalysisDetailList[
                                  index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + machanicPartSize
                                ].quantity = Number(e.target.value);
                                this.setState({ engineAnalysisDetailList });
                              }}
                              value={
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + machanicPartSize].quantity
                              }
                              invalidText="Số lượng không hợp lệ"
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell key={`status-${index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + machanicPartSize}`}>
                            <TextInput
                              id={`status-textinput-${index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + machanicPartSize}`}
                              labelText=""
                              onChange={(e) => {
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + machanicPartSize].status =
                                  e.target.value;
                                this.setState({ engineAnalysisDetailList });
                              }}
                              value={
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + machanicPartSize].status
                              }
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell key={`measure-${index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + machanicPartSize}`}>
                            <Dropdown
                              id={`measure-Dropdown-${index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + machanicPartSize}`}
                              titleText=""
                              label=""
                              items={measureList}
                              selectedItem={
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + machanicPartSize]
                                  .measure === ''
                                  ? null
                                  : measureList.find(
                                      (e) =>
                                        e.id ===
                                        engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + machanicPartSize]
                                          .measure
                                    )
                              }
                              onChange={(e) => {
                                engineAnalysisDetailList[index + electricPartSize + chassisPartSize + enginePartSize + breakPartSize + machanicPartSize].measure =
                                  e.selectedItem.id;
                                this.setState({ engineAnalysisDetailList });
                              }}
                              disabled={auth.role !== 'phongkythuat'}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              onClick={() => {
                                this.setState({
                                  engineAnalysisDetailList: engineAnalysisDetailList.filter((e) => e.materialID !== row.materialID),
                                });
                              }}
                              disabled={auth.role !== 'phongkythuat'}
                            >
                              Xoá
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    {auth.role === 'phongkythuat' && (
                      <>
                        <TableRow />
                        <TableRow />
                        <TableRow />
                        <TableRow />
                      </>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2" />
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title="Chi tiết danh mục phân loại phế liệu">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader key="stt" style={{ width: '5%' }}>
                        STT
                      </TableHeader>
                      <TableHeader key="materialID">Mã vật tư</TableHeader>
                      <TableHeader key="materialName">Tên vật tư</TableHeader>
                      <TableHeader key="unit" style={{ width: '5%' }}>
                        Đơn vị
                      </TableHeader>
                      <TableHeader key="quantity" style={{ width: '7.5%' }}>
                        Số lượng
                      </TableHeader>
                      <TableHeader key="quality" style={{ width: '10%' }}>
                        Chất lượng
                      </TableHeader>
                      <TableHeader style={{ width: '7.5%' }} />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scrapClassifyDetailList.map((row, index) => (
                      <TableRow key={`row-${index.toString()}`}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>{row.materialID}</TableCell>
                        <TableCell>{row.materialName}</TableCell>
                        <TableCell>{row.unit}</TableCell>
                        <TableCell>
                          <TextInput
                            id={`scrap-quantity-textinput-${index}`}
                            labelText=""
                            onChange={(e) => {
                              if (e.target.value !== '' && (!e.target.value.match(/^\d+$/) || Number(e.target.value) < 1)) {
                                return;
                              }
                              scrapClassifyDetailList[index].quantity = Number(e.target.value);
                              this.setState({ scrapClassifyDetailList });
                            }}
                            value={scrapClassifyDetailList[index].quantity}
                            invalidText="Số lượng không hợp lệ"
                            disabled={auth.role !== 'phongkythuat'}
                          />
                        </TableCell>
                        <TableCell>
                          <Dropdown
                            id={`scrap-quality-dropdown-${index}`}
                            titleText=""
                            label=""
                            items={qualityList}
                            selectedItem={
                              scrapClassifyDetailList[index].quality === '' ? null : qualityList.find((e) => e.id === scrapClassifyDetailList[index].quality)
                            }
                            onChange={(e) => {
                              scrapClassifyDetailList[index].quality = e.selectedItem.id;
                              this.setState({ scrapClassifyDetailList });
                            }}
                            disabled={auth.role !== 'phongkythuat'}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => {
                              this.setState({
                                scrapClassifyDetailList: scrapClassifyDetailList.filter((e) => e.materialID !== row.materialID),
                              });
                            }}
                            disabled={auth.role !== 'phongkythuat'}
                          >
                            Xoá
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
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
          <br />
          <br />
          <br />
          <br />
          <br />
        </div>
      </div>
    );
  }
}

EngineAnalysis.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(EngineAnalysis);
