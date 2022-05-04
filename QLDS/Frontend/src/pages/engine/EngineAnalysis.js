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
import {
  addEngineAnalysisInfo,
  exportEngineAnalysisReport,
  getComponentList,
  getEngineAnalysisInfo,
  getEngineListByCompany,
  getMaterialList,
  insertComponents,
  updateComponents,
} from '../../services';

const measureList = [
  { id: 'Thay mới', label: 'Thay mới' },
  { id: 'Lĩnh mới', label: 'Lĩnh mới' },
  { id: 'Thay khôi phục', label: 'Thay khôi phục' },
];

const repairPartList = [
  { id: 'phandien', label: 'Phần Điện' },
  { id: 'phankhunggam', label: 'Phần Khung gầm' },
  { id: 'phandongco', label: 'Phần Động cơ' },
  { id: 'phanham', label: 'Phần Hãm' },
  { id: 'phancokhi', label: 'Phần Cơ khí' },
  { id: 'phantruyendong', label: 'Phần Truyền động' },
];
class EngineAnalysis extends Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: '',
      engineAnalysisID: '',
      engineAnalysisIDErrorMessage: '',
      engineAnalysisName: '',
      engineAnalysisNameErrorMessage: '',
      engineID: '',
      engineIDErrorMessage: '',
      engineType: '',
      repairDate: '',
      repairLevel: '',
      tmpRepairPart: '',
      repairPart: '',

      electricComponentList: [],
      chassisComponentList: [],
      engineComponentList: [],
      breakComponentList: [],
      machanicComponentList: [],
      transmissionComponentList: [],

      engineList: [],
      materialList: [],
      selectedLines: [],
    };
  }

  componentDidMount = async () => {
    const { setLoading, setErrorMessage, location, auth } = this.props;
    let mode = '';
    let engineAnalysisID = '';
    if (location.pathname === '/engine/analysis/update') {
      mode = 'update';
      const params = new URLSearchParams(location.search);
      if (params == null) {
        setErrorMessage('Không có mã biên bản giải thể!!!');
      } else {
        engineAnalysisID = params.get('engineAnalysisID');
        setLoading(true);
        const getEngineAnalysisInfoResult = await getEngineAnalysisInfo(engineAnalysisID);
        setLoading(false);
        if (getEngineAnalysisInfoResult.data === 'null') {
          setErrorMessage('Mã biên bản giải thể không tồn tại!!!');
          return;
        }
        setLoading(true);
        const getComponenetListResult = await getComponentList(engineAnalysisID);
        setLoading(false);
        this.setState({
          engineAnalysisID,
          engineAnalysisName: getEngineAnalysisInfoResult.data.engine_analysis_name,
          engineID: getEngineAnalysisInfoResult.data.engine_id,
          engineType: getEngineAnalysisInfoResult.data.engine_type,
          repairDate: getEngineAnalysisInfoResult.data.repair_date,
          repairLevel: getEngineAnalysisInfoResult.data.repair_level,

          electricComponentList: getComponenetListResult.data.filter((e) => e.repair_part === 'phandien'),
          chassisComponentList: getComponenetListResult.data.filter((e) => e.repair_part === 'phankhunggam'),
          engineComponentList: getComponenetListResult.data.filter((e) => e.repair_part === 'phandongco'),
          breakComponentList: getComponenetListResult.data.filter((e) => e.repair_part === 'phanham'),
          machanicComponentList: getComponenetListResult.data.filter((e) => e.repair_part === 'phancokhi'),
          transmissionComponentList: getComponenetListResult.data.filter((e) => e.repair_part === 'phantruyendong'),
        });
      }
    } else {
      mode = 'add';
    }
    setLoading(true);
    const getEngineListResult = await getEngineListByCompany(auth.companyID);
    const getMaterialListResult = await getMaterialList('', '', '', '');
    setLoading(false);
    this.setState({
      mode,
      engineList: getEngineListResult.data,
      materialList: getMaterialListResult.data,
    });
  };

  formatDate = (inputDate) => {
    const yyyy = inputDate.getFullYear().toString();
    const mm = `0${inputDate.getMonth() + 1}`.slice(-2);
    const dd = `0${inputDate.getDate()}`.slice(-2);
    return `${dd}/${mm}/${yyyy}`;
  };

  save = async () => {
    const { setLoading, setErrorMessage, setSubmitResult, auth } = this.props;
    const {
      mode,
      engineAnalysisID,
      engineAnalysisName,
      engineID,
      engineType,
      repairDate,
      repairLevel,

      electricComponentList,
      chassisComponentList,
      engineComponentList,
      breakComponentList,
      machanicComponentList,
      transmissionComponentList,
    } = this.state;
    let components = [];
    components = components.concat(electricComponentList);
    components = components.concat(chassisComponentList);
    components = components.concat(engineComponentList);
    components = components.concat(breakComponentList);
    components = components.concat(machanicComponentList);
    components = components.concat(transmissionComponentList);
    if (mode === 'add') {
      // Validate
      let hasError = false;
      if (engineAnalysisID === '') {
        hasError = true;
        this.setState({ engineAnalysisIDErrorMessage: 'Mã biên bản không được bỏ trống' });
      }
      if (engineAnalysisName === '') {
        hasError = true;
        this.setState({ engineAnalysisNameErrorMessage: 'Tên biên bản không được bỏ trống' });
      }
      if (engineID === '') {
        hasError = true;
        this.setState({ engineIDErrorMessage: 'Số hiệu đầu máy không được bỏ trống' });
      }
      if (hasError) {
        return;
      }
      // First, add engine_analysis info
      setLoading(true);
      const getAddEngineAnalysisInfoResult = await addEngineAnalysisInfo(
        engineAnalysisID,
        engineAnalysisName,
        engineID,
        engineType,
        repairDate,
        repairLevel,
        auth.companyID,
        auth.userID
      );
      setLoading(false);
      if (getAddEngineAnalysisInfoResult.data !== 1) {
        setErrorMessage('Mã biên bản giải thể đã tồn tại');
      } else {
        await insertComponents(engineAnalysisID, components, auth.userID);
        setSubmitResult('Biên bản giải thể đầu máy đã được thêm thành công');
      }
    } else {
      setLoading(true);
      await updateComponents(engineAnalysisID, components, auth.userID);
      setLoading(false);
      setSubmitResult('Biên bản giải thể đầu máy đã được cập nhật thành công');
    }
  };

  exportReport = async () => {
    const { setErrorMessage } = this.props;
    const { engineAnalysisID } = this.state;
    await exportEngineAnalysisReport(engineAnalysisID)
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

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      mode,
      engineAnalysisID,
      engineAnalysisIDErrorMessage,
      engineAnalysisName,
      engineAnalysisNameErrorMessage,
      engineID,
      engineIDErrorMessage,
      engineType,
      repairDate,
      repairLevel,
      repairPart,
      tmpRepairPart,

      electricComponentList,
      chassisComponentList,
      engineComponentList,
      breakComponentList,
      machanicComponentList,
      transmissionComponentList,

      engineList,
      materialList,
      selectedLines,
    } = this.state;

    const engineIDList = engineList.map((e) => {
      return { id: e.engine_id, label: e.engine_id };
    });

    const materialIDs = materialList
      .map((e) => {
        return { id: e.material_id, label: e.material_id.concat(' - ').concat(e.material_name) };
      })
      .sort((a, b) => a.label.split(' - ')[1].localeCompare(b.label.split(' - ')[1]));

    const repairLevelList = [
      { id: 'Đột xuất', label: 'Đột xuất' },
      { id: 'Ro', label: 'Ro' },
      { id: 'Rt', label: 'Rt' },
      { id: 'R1', label: 'R1' },
      { id: 'R2', label: 'R2' },
      { id: 'Đại tu', label: 'Đại tu' },
    ];

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
              history.push(`/engine/analysis/update?engineAnalysisID=${engineAnalysisID}`);
              this.setState({ mode: 'update' });
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
                id="engineAnalysisID-TextInput"
                placeholder="Ví dụ: BBGT_01012022"
                labelText="Mã biên bản giải thể"
                value={engineAnalysisID}
                onChange={(e) => this.setState({ engineAnalysisID: e.target.value })}
                invalid={engineAnalysisIDErrorMessage !== ''}
                invalidText={engineAnalysisIDErrorMessage}
                disabled={mode === 'update'}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="engineAnalysisName-TextInput"
                placeholder=""
                labelText="Tên biên bản giải thể"
                value={engineAnalysisName}
                onChange={(e) => this.setState({ engineAnalysisName: e.target.value })}
                invalid={engineAnalysisNameErrorMessage !== ''}
                invalidText={engineAnalysisNameErrorMessage}
                disabled={mode === 'update'}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="engineID-Dropdown"
                titleText="Số hiệu đầu máy"
                label=""
                items={engineIDList}
                selectedItem={engineID === '' ? null : engineIDList.find((e) => e.id === engineID)}
                onChange={(e) =>
                  this.setState({ engineID: e.selectedItem.id, engineType: engineList.find((item) => item.engine_id === e.selectedItem.id).engine_type })
                }
                invalid={engineIDErrorMessage !== ''}
                invalidText={engineIDErrorMessage}
                disabled={mode === 'update'}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="engineType-TextInput" labelText="Loại đầu máy" value={engineType} disabled />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <DatePicker datePickerType="single" dateFormat="d/m/Y" onChange={(e) => this.setState({ repairDate: this.formatDate(e[0]) })} value={repairDate}>
                <DatePickerInput
                  datePickerType="single"
                  placeholder="dd/mm/yyyy"
                  labelText="Ngày vào sửa chữa"
                  id="repairDate-datepicker"
                  disabled={mode === 'update'}
                />
              </DatePicker>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="repairLevel-Dropdown"
                titleText="Cấp sửa chữa"
                label=""
                items={repairLevelList}
                selectedItem={repairLevel === '' ? null : repairLevelList.find((e) => e.id === repairLevel)}
                onChange={(e) => this.setState({ repairLevel: e.selectedItem.id })}
                disabled={mode === 'update'}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="repairePart-Dropdown"
                titleText="Phần sửa chữa"
                label=""
                items={repairPartList}
                selectedItem={tmpRepairPart === '' ? null : repairPartList.find((e) => e.id === tmpRepairPart)}
                onChange={(e) => this.setState({ tmpRepairPart: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.setState({ repairPart: tmpRepairPart, selectedLines: [] })} style={{ marginTop: '1rem' }} disabled={repairPart !== ''}>
                Chọn phần sửa chữa
              </Button>
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.setState({ repairPart: '', tmpRepairPart: '' })} style={{ marginTop: '1rem' }} disabled={repairPart === ''}>
                Chọn lại phần sửa
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                onClick={() => {
                  const newComponent = { repair_part: repairPart, material_id: '', material_name: '', unit: '', quantity: 1, status: '', measure: '' };
                  if (repairPart === 'phandien') {
                    electricComponentList.push(newComponent);
                    this.setState({ electricComponentList });
                  }
                  if (repairPart === 'phankhunggam') {
                    chassisComponentList.push(newComponent);
                    this.setState({ chassisComponentList });
                  }
                  if (repairPart === 'phandongco') {
                    engineComponentList.push(newComponent);
                    this.setState({ engineComponentList });
                  }
                  if (repairPart === 'phanham') {
                    breakComponentList.push(newComponent);
                    this.setState({ breakComponentList });
                  }
                  if (repairPart === 'phancokhi') {
                    machanicComponentList.push(newComponent);
                    this.setState({ machanicComponentList });
                  }
                  if (repairPart === 'phantruyendong') {
                    transmissionComponentList.push(newComponent);
                    this.setState({ transmissionComponentList });
                  }
                }}
                style={{ marginTop: '1rem' }}
                disabled={repairPart === ''}
              >
                Thêm vật tư
              </Button>
            </div>
            <span style={{ maxLength: '3rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                onClick={() => {
                  if (repairPart === 'phandien') {
                    this.setState({
                      electricComponentList: electricComponentList.filter((e, index) => !selectedLines.includes(index)),
                      selectedLines: [],
                    });
                  }
                }}
                style={{ marginTop: '1rem' }}
                disabled={repairPart === ''}
              >
                Xoá vật tư
              </Button>
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.save()} style={{ marginTop: '1rem' }} disabled={repairPart === ''}>
                Lưu thông tin
              </Button>
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            {mode === 'update' && (
              <div className="bx--col-lg-2 bx--col-md-2">
                <Button onClick={() => this.exportReport()} style={{ marginTop: '1rem' }}>
                  Xuất ra file
                </Button>
              </div>
            )}
          </div>
          <br />
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title="Chi tiết danh mục giải thể">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader />
                      <TableHeader key="stt">STT</TableHeader>
                      <TableHeader key="materialID" style={{ minWidth: '35%' }}>
                        Mã vật tư - Tên vật tư
                      </TableHeader>
                      <TableHeader key="unit">Đơn vị</TableHeader>
                      <TableHeader key="quantity">Số lượng</TableHeader>
                      <TableHeader key="status">Trạng thái giải thể</TableHeader>
                      <TableHeader key="measure" style={{ width: '12rem' }}>
                        Biện pháp
                      </TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(repairPart === '' || repairPart === 'phandien') && (
                      <TableRow key="phandien">
                        <TableCell colSpan={8}>
                          <strong>Phần Điện</strong>
                        </TableCell>
                      </TableRow>
                    )}
                    {(repairPart === '' || repairPart === 'phandien') &&
                      electricComponentList.map((row, index) => (
                        <TableRow key={index.toString()}>
                          <TableCell>
                            {repairPart === '' ? (
                              ''
                            ) : (
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
                            )}
                          </TableCell>
                          <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                          <TableCell key={`material-${index.toString()}`}>
                            <ComboBox
                              id={`materialID-Dropdown-${index}`}
                              titleText=""
                              placeholder="Mã vật tư"
                              label=""
                              items={materialIDs}
                              selectedItem={
                                electricComponentList[index].material_id === ''
                                  ? null
                                  : materialIDs.find((e) => e.id === electricComponentList[index].material_id)
                              }
                              shouldFilterItem={({ item, inputValue }) => {
                                if (!inputValue) return true;
                                return item.label.toLowerCase().includes(inputValue.toLowerCase());
                              }}
                              onChange={(e) => {
                                const selectedItemID = e.selectedItem === null ? '' : e.selectedItem.id;
                                electricComponentList[index].material_id = selectedItemID;
                                electricComponentList[index].material_name =
                                  selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).material_name;
                                electricComponentList[index].unit =
                                  selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).unit;
                                this.setState({ electricComponentList });
                              }}
                            />
                          </TableCell>
                          <TableCell key={`unit-${index.toString()}`}>{electricComponentList[index].unit}</TableCell>
                          <TableCell key={`quantity-${index.toString()}`}>
                            <TextInput
                              id={`quantity-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                if (e.target.value !== '' && (!e.target.value.match(/^\d+$/) || Number(e.target.value) < 1)) {
                                  return;
                                }
                                electricComponentList[index].quantity = Number(e.target.value);
                                this.setState({ electricComponentList });
                              }}
                              value={electricComponentList[index].quantity}
                              invalidText="Số lượng không hợp lệ"
                            />
                          </TableCell>
                          <TableCell key={`status-${index.toString()}`}>
                            <TextInput
                              id={`status-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                electricComponentList[index].status = e.target.value;
                                this.setState({ electricComponentList });
                              }}
                              value={electricComponentList[index].status}
                            />
                          </TableCell>
                          <TableCell key={`measure-${index.toString()}`}>
                            <Dropdown
                              id={`measure-textinput-${index}`}
                              titleText=""
                              label=""
                              items={measureList}
                              selectedItem={
                                electricComponentList[index].measure === '' ? null : measureList.find((e) => e.id === electricComponentList[index].measure)
                              }
                              onChange={(e) => {
                                electricComponentList[index].measure = e.selectedItem.id;
                                this.setState({ electricComponentList });
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}

                    {(repairPart === '' || repairPart === 'phankhunggam') && (
                      <TableRow key="phankhunggam">
                        <TableCell colSpan={8}>
                          <strong>Phần Khung gầm</strong>
                        </TableCell>
                      </TableRow>
                    )}
                    {(repairPart === '' || repairPart === 'phankhunggam') &&
                      chassisComponentList.map((row, index) => (
                        <TableRow key={index.toString()}>
                          <TableCell>
                            {repairPart === '' ? (
                              ''
                            ) : (
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
                            )}
                          </TableCell>
                          <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                          <TableCell key={`material-${index.toString()}`}>
                            <ComboBox
                              id={`materialID-Dropdown-${index}`}
                              titleText=""
                              placeholder="Mã vật tư"
                              label=""
                              items={materialIDs}
                              selectedItem={
                                chassisComponentList[index].material_id === '' ? null : materialIDs.find((e) => e.id === chassisComponentList[index].material_id)
                              }
                              shouldFilterItem={({ item, inputValue }) => {
                                if (!inputValue) return true;
                                return item.label.toLowerCase().includes(inputValue.toLowerCase());
                              }}
                              onChange={(e) => {
                                const selectedItemID = e.selectedItem === null ? '' : e.selectedItem.id;
                                chassisComponentList[index].material_id = selectedItemID;
                                chassisComponentList[index].material_name =
                                  selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).material_name;
                                chassisComponentList[index].unit =
                                  selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).unit;
                                this.setState({ chassisComponentList });
                              }}
                            />
                          </TableCell>
                          <TableCell key={`unit-${index.toString()}`}>{chassisComponentList[index].unit}</TableCell>
                          <TableCell key={`quantity-${index.toString()}`}>
                            <TextInput
                              id={`quantity-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                if (e.target.value !== '' && (!e.target.value.match(/^\d+$/) || Number(e.target.value) < 1)) {
                                  return;
                                }
                                chassisComponentList[index].quantity = Number(e.target.value);
                                this.setState({ chassisComponentList });
                              }}
                              value={chassisComponentList[index].quantity}
                              invalidText="Số lượng không hợp lệ"
                            />
                          </TableCell>
                          <TableCell key={`status-${index.toString()}`}>
                            <TextInput
                              id={`status-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                chassisComponentList[index].status = e.target.value;
                                this.setState({ chassisComponentList });
                              }}
                              value={chassisComponentList[index].status}
                            />
                          </TableCell>
                          <TableCell key={`measure-${index.toString()}`}>
                            <Dropdown
                              id={`measure-textinput-${index}`}
                              titleText=""
                              label=""
                              items={measureList}
                              selectedItem={
                                chassisComponentList[index].measure === '' ? null : measureList.find((e) => e.id === chassisComponentList[index].measure)
                              }
                              onChange={(e) => {
                                chassisComponentList[index].measure = e.selectedItem.id;
                                this.setState({ chassisComponentList });
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}

                    {(repairPart === '' || repairPart === 'phandongco') && (
                      <TableRow key="phandongco">
                        <TableCell colSpan={8}>
                          <strong>Phần Động cơ</strong>
                        </TableCell>
                      </TableRow>
                    )}
                    {(repairPart === '' || repairPart === 'phandongco') &&
                      engineComponentList.map((row, index) => (
                        <TableRow key={index.toString()}>
                          <TableCell>
                            {repairPart === '' ? (
                              ''
                            ) : (
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
                            )}
                          </TableCell>
                          <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                          <TableCell key={`material-${index.toString()}`}>
                            <ComboBox
                              id={`materialID-Dropdown-${index}`}
                              titleText=""
                              placeholder="Mã vật tư"
                              label=""
                              items={materialIDs}
                              selectedItem={
                                engineComponentList[index].material_id === '' ? null : materialIDs.find((e) => e.id === engineComponentList[index].material_id)
                              }
                              shouldFilterItem={({ item, inputValue }) => {
                                if (!inputValue) return true;
                                return item.label.toLowerCase().includes(inputValue.toLowerCase());
                              }}
                              onChange={(e) => {
                                const selectedItemID = e.selectedItem === null ? '' : e.selectedItem.id;
                                engineComponentList[index].material_id = selectedItemID;
                                engineComponentList[index].material_name =
                                  selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).material_name;
                                engineComponentList[index].unit =
                                  selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).unit;
                                this.setState({ engineComponentList });
                              }}
                            />
                          </TableCell>
                          <TableCell key={`unit-${index.toString()}`}>{engineComponentList[index].unit}</TableCell>
                          <TableCell key={`quantity-${index.toString()}`}>
                            <TextInput
                              id={`quantity-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                if (e.target.value !== '' && (!e.target.value.match(/^\d+$/) || Number(e.target.value) < 1)) {
                                  return;
                                }
                                engineComponentList[index].quantity = Number(e.target.value);
                                this.setState({ engineComponentList });
                              }}
                              value={engineComponentList[index].quantity}
                              invalidText="Số lượng không hợp lệ"
                            />
                          </TableCell>
                          <TableCell key={`status-${index.toString()}`}>
                            <TextInput
                              id={`status-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                engineComponentList[index].status = e.target.value;
                                this.setState({ engineComponentList });
                              }}
                              value={engineComponentList[index].status}
                            />
                          </TableCell>
                          <TableCell key={`measure-${index.toString()}`}>
                            <Dropdown
                              id={`measure-textinput-${index}`}
                              titleText=""
                              label=""
                              items={measureList}
                              selectedItem={
                                engineComponentList[index].measure === '' ? null : measureList.find((e) => e.id === engineComponentList[index].measure)
                              }
                              onChange={(e) => {
                                engineComponentList[index].measure = e.selectedItem.id;
                                this.setState({ engineComponentList });
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}

                    {(repairPart === '' || repairPart === 'phanham') && (
                      <TableRow key="phanham">
                        <TableCell colSpan={8}>
                          <strong>Phần Hãm</strong>
                        </TableCell>
                      </TableRow>
                    )}
                    {(repairPart === '' || repairPart === 'phanham') &&
                      breakComponentList.map((row, index) => (
                        <TableRow key={index.toString()}>
                          <TableCell>
                            {repairPart === '' ? (
                              ''
                            ) : (
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
                            )}
                          </TableCell>
                          <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                          <TableCell key={`material-${index.toString()}`}>
                            <ComboBox
                              id={`materialID-Dropdown-${index}`}
                              titleText=""
                              placeholder="Mã vật tư"
                              label=""
                              items={materialIDs}
                              selectedItem={
                                breakComponentList[index].material_id === '' ? null : materialIDs.find((e) => e.id === breakComponentList[index].material_id)
                              }
                              shouldFilterItem={({ item, inputValue }) => {
                                if (!inputValue) return true;
                                return item.label.toLowerCase().includes(inputValue.toLowerCase());
                              }}
                              onChange={(e) => {
                                const selectedItemID = e.selectedItem === null ? '' : e.selectedItem.id;
                                breakComponentList[index].material_id = selectedItemID;
                                breakComponentList[index].material_name =
                                  selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).material_name;
                                breakComponentList[index].unit =
                                  selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).unit;
                                this.setState({ breakComponentList });
                              }}
                            />
                          </TableCell>
                          <TableCell key={`unit-${index.toString()}`}>{breakComponentList[index].unit}</TableCell>
                          <TableCell key={`quantity-${index.toString()}`}>
                            <TextInput
                              id={`quantity-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                if (e.target.value !== '' && (!e.target.value.match(/^\d+$/) || Number(e.target.value) < 1)) {
                                  return;
                                }
                                breakComponentList[index].quantity = Number(e.target.value);
                                this.setState({ breakComponentList });
                              }}
                              value={breakComponentList[index].quantity}
                              invalidText="Số lượng không hợp lệ"
                            />
                          </TableCell>
                          <TableCell key={`status-${index.toString()}`}>
                            <TextInput
                              id={`status-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                breakComponentList[index].status = e.target.value;
                                this.setState({ breakComponentList });
                              }}
                              value={breakComponentList[index].status}
                            />
                          </TableCell>
                          <TableCell key={`measure-${index.toString()}`}>
                            <Dropdown
                              id={`measure-textinput-${index}`}
                              titleText=""
                              label=""
                              items={measureList}
                              selectedItem={breakComponentList[index].measure === '' ? null : measureList.find((e) => e.id === breakComponentList[index].measure)}
                              onChange={(e) => {
                                breakComponentList[index].measure = e.selectedItem.id;
                                this.setState({ breakComponentList });
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}

                    {(repairPart === '' || repairPart === 'phancokhi') && (
                      <TableRow key="phancokhi">
                        <TableCell colSpan={8}>
                          <strong>Phần Cơ khí</strong>
                        </TableCell>
                      </TableRow>
                    )}
                    {(repairPart === '' || repairPart === 'phancokhi') &&
                      machanicComponentList.map((row, index) => (
                        <TableRow key={index.toString()}>
                          <TableCell>
                            {repairPart === '' ? (
                              ''
                            ) : (
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
                            )}
                          </TableCell>
                          <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                          <TableCell key={`material-${index.toString()}`}>
                            <ComboBox
                              id={`materialID-Dropdown-${index}`}
                              titleText=""
                              placeholder="Mã vật tư"
                              label=""
                              items={materialIDs}
                              selectedItem={
                                machanicComponentList[index].material_id === ''
                                  ? null
                                  : materialIDs.find((e) => e.id === machanicComponentList[index].material_id)
                              }
                              shouldFilterItem={({ item, inputValue }) => {
                                if (!inputValue) return true;
                                return item.label.toLowerCase().includes(inputValue.toLowerCase());
                              }}
                              onChange={(e) => {
                                const selectedItemID = e.selectedItem === null ? '' : e.selectedItem.id;
                                machanicComponentList[index].material_id = selectedItemID;
                                machanicComponentList[index].material_name =
                                  selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).material_name;
                                machanicComponentList[index].unit =
                                  selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).unit;
                                this.setState({ machanicComponentList });
                              }}
                            />
                          </TableCell>
                          <TableCell key={`unit-${index.toString()}`}>{machanicComponentList[index].unit}</TableCell>
                          <TableCell key={`quantity-${index.toString()}`}>
                            <TextInput
                              id={`quantity-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                if (e.target.value !== '' && (!e.target.value.match(/^\d+$/) || Number(e.target.value) < 1)) {
                                  return;
                                }
                                machanicComponentList[index].quantity = Number(e.target.value);
                                this.setState({ machanicComponentList });
                              }}
                              value={machanicComponentList[index].quantity}
                              invalidText="Số lượng không hợp lệ"
                            />
                          </TableCell>
                          <TableCell key={`status-${index.toString()}`}>
                            <TextInput
                              id={`status-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                machanicComponentList[index].status = e.target.value;
                                this.setState({ machanicComponentList });
                              }}
                              value={machanicComponentList[index].status}
                            />
                          </TableCell>
                          <TableCell key={`measure-${index.toString()}`}>
                            <Dropdown
                              id={`measure-textinput-${index}`}
                              titleText=""
                              label=""
                              items={measureList}
                              selectedItem={
                                machanicComponentList[index].measure === '' ? null : measureList.find((e) => e.id === machanicComponentList[index].measure)
                              }
                              onChange={(e) => {
                                machanicComponentList[index].measure = e.selectedItem.id;
                                this.setState({ machanicComponentList });
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      ))}

                    {(repairPart === '' || repairPart === 'phantruyendong') && (
                      <TableRow key="phantruyendong">
                        <TableCell colSpan={8}>
                          <strong>Phần Truyền động - Tổng hợp</strong>
                        </TableCell>
                      </TableRow>
                    )}
                    {(repairPart === '' || repairPart === 'phantruyendong') &&
                      transmissionComponentList.map((row, index) => (
                        <TableRow key={index.toString()}>
                          <TableCell>
                            {repairPart === '' ? (
                              ''
                            ) : (
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
                            )}
                          </TableCell>
                          <TableCell key={`stt-${index.toString()}`}>{index + 1}</TableCell>
                          <TableCell key={`material-${index.toString()}`}>
                            <ComboBox
                              id={`materialID-Dropdown-${index}`}
                              titleText=""
                              placeholder="Mã vật tư"
                              label=""
                              items={materialIDs}
                              selectedItem={
                                transmissionComponentList[index].material_id === ''
                                  ? null
                                  : materialIDs.find((e) => e.id === transmissionComponentList[index].material_id)
                              }
                              shouldFilterItem={({ item, inputValue }) => {
                                if (!inputValue) return true;
                                return item.label.toLowerCase().includes(inputValue.toLowerCase());
                              }}
                              onChange={(e) => {
                                const selectedItemID = e.selectedItem === null ? '' : e.selectedItem.id;
                                transmissionComponentList[index].material_id = selectedItemID;
                                transmissionComponentList[index].material_name =
                                  selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).material_name;
                                transmissionComponentList[index].unit =
                                  selectedItemID === '' ? '' : materialList.find((item) => item.material_id === selectedItemID).unit;
                                this.setState({ transmissionComponentList });
                              }}
                            />
                          </TableCell>
                          <TableCell key={`unit-${index.toString()}`}>{transmissionComponentList[index].unit}</TableCell>
                          <TableCell key={`quantity-${index.toString()}`}>
                            <TextInput
                              id={`quantity-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                if (e.target.value !== '' && (!e.target.value.match(/^\d+$/) || Number(e.target.value) < 1)) {
                                  return;
                                }
                                transmissionComponentList[index].quantity = Number(e.target.value);
                                this.setState({ transmissionComponentList });
                              }}
                              value={transmissionComponentList[index].quantity}
                              invalidText="Số lượng không hợp lệ"
                            />
                          </TableCell>
                          <TableCell key={`status-${index.toString()}`}>
                            <TextInput
                              id={`status-textinput-${index}`}
                              labelText=""
                              onChange={(e) => {
                                transmissionComponentList[index].status = e.target.value;
                                this.setState({ transmissionComponentList });
                              }}
                              value={transmissionComponentList[index].status}
                            />
                          </TableCell>
                          <TableCell key={`measure-${index.toString()}`}>
                            <Dropdown
                              id={`measure-textinput-${index}`}
                              titleText=""
                              label=""
                              items={measureList}
                              selectedItem={
                                transmissionComponentList[index].measure === ''
                                  ? null
                                  : measureList.find((e) => e.id === transmissionComponentList[index].measure)
                              }
                              onChange={(e) => {
                                transmissionComponentList[index].measure = e.selectedItem.id;
                                this.setState({ transmissionComponentList });
                              }}
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
          <br />
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

export default connect(mapStateToProps, mapDispatchToProps)(EngineAnalysis);
