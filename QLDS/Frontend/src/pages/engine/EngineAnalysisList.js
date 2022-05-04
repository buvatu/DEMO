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
import { Link } from 'react-router-dom';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { deleteEngineAnalysisInfo, getEngineAnalysisList } from '../../services';

class EngineAnalysisList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      engineAnalysisID: '',
      engineID: '',
      engineList: [],
      repairLevel: '',
      repairDate: '',
      repairDateList: [],
      engineAnalysisList: [],
      engineAnalysisListDisplay: [],
    };
  }

  componentDidMount = async () => {
    const { setLoading, auth } = this.props;
    setLoading(true);
    const getEngineAnalysisListResult = await getEngineAnalysisList(auth.companyID);
    setLoading(false);
    const engineAnalysisList = getEngineAnalysisListResult.data;
    const engineList = [
      ...new Set(
        engineAnalysisList.map((e) => {
          return { id: e.engine_id, label: e.engine_id };
        })
      ),
    ];
    const repairDateList = [
      ...new Set(
        engineAnalysisList.map((e) => {
          return { id: e.repair_date, label: e.repair_date };
        })
      ),
    ];
    this.setState({ engineAnalysisList, engineList, repairDateList, engineAnalysisListDisplay: engineAnalysisList });
  };

  delete = async (engineAnalysisID) => {
    const { setLoading, auth } = this.props;
    setLoading(true);
    await deleteEngineAnalysisInfo(engineAnalysisID);
    const getEngineAnalysisListResult = await getEngineAnalysisList(auth.companyID);
    setLoading(false);
    this.setState({ engineAnalysisListDisplay: getEngineAnalysisListResult.data });
  };

  findEngineAnalysisList = () => {
    const { engineAnalysisList, engineAnalysisID, engineID, repairLevel, repairDate } = this.state;
    let engineAnalysisListDisplay = engineAnalysisList;
    if (engineAnalysisID.trim() !== '') {
      engineAnalysisListDisplay = engineAnalysisListDisplay.filter((e) => e.engine_analysis_id.includes(engineAnalysisID.trim()));
    }
    if (engineID !== '') {
      engineAnalysisListDisplay = engineAnalysisListDisplay.filter((e) => e.engine_id === engineID);
    }
    if (repairLevel !== '') {
      engineAnalysisListDisplay = engineAnalysisListDisplay.filter((e) => e.repair_level === repairLevel);
    }
    if (repairDate !== '') {
      engineAnalysisListDisplay = engineAnalysisListDisplay.filter((e) => e.repair_date === repairDate);
    }
    this.setState({ engineAnalysisListDisplay });
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
    const { engineAnalysisListDisplay, engineAnalysisID, engineID, engineList, repairLevel, repairDateList, repairDate } = this.state;

    const repairLevelList = [
      { id: 'Đột xuất', label: 'Đột xuất' },
      { id: 'Ro', label: 'Ro' },
      { id: 'Rt', label: 'Rt' },
      { id: 'R1', label: 'R1' },
      { id: 'R2', label: 'R2' },
      { id: 'Đại tu', label: 'Đại tu' },
    ];

    return (
      <div className="company-list">
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
          <h4>Danh sách biên bản giải thể</h4>
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
                placeholder="Vui lòng nhập mã biên bản"
                labelText="Mã biên bản"
                value={engineAnalysisID}
                onChange={(e) => this.setState({ engineAnalysisID: e.target.value })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="engineID-Dropdown"
                titleText="Đầu máy tiêu thụ"
                label=""
                items={engineList}
                selectedItem={engineID === '' ? null : engineList.find((e) => e.id === engineID)}
                onChange={(e) => this.setState({ engineID: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="repairLevel-Dropdown"
                titleText="Cấp sửa chữa"
                label=""
                items={repairLevelList}
                selectedItem={repairLevel === '' ? null : repairLevelList.find((e) => e.id === repairLevel)}
                onChange={(e) => this.setState({ repairLevel: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="repairDate-Dropdown"
                titleText="Ngày vào sửa chữa"
                label=""
                items={repairDateList}
                selectedItem={repairDate === '' ? null : repairDateList.find((e) => e.id === repairDate)}
                onChange={(e) => this.setState({ repairDate: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-lg-4">
              <Button style={{ marginTop: '1rem', marginRight: '1rem' }} onClick={() => this.findEngineAnalysisList()}>
                Tìm kiếm
              </Button>
              <Button style={{ marginTop: '1rem' }} onClick={() => history.push('/engine/analysis/add')}>
                Tạo biên bản giải thể
              </Button>
            </div>
          </div>
          <br />
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title={`Có tất cả ${engineAnalysisListDisplay.length} biên bản giải thể.`}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader>Mã biên bản giải thể</TableHeader>
                      <TableHeader>Tên biên bản giải thể</TableHeader>
                      <TableHeader>Số hiệu đầu máy</TableHeader>
                      <TableHeader>Loại đầu máy</TableHeader>
                      <TableHeader>Ngày vào sửa chữa</TableHeader>
                      <TableHeader>Cấp sửa chữa</TableHeader>
                      <TableHeader>Xoá</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {engineAnalysisListDisplay.map((row, index) => (
                      <TableRow key={`row-${index.toString()}`}>
                        <TableCell>
                          <Link to={`/engine/analysis/update?engineAnalysisID=${row.engine_analysis_id}`}>{row.engine_analysis_id}</Link>
                        </TableCell>
                        <TableCell>{row.engine_analysis_name}</TableCell>
                        <TableCell>{row.engine_id}</TableCell>
                        <TableCell>{row.engine_type}</TableCell>
                        <TableCell>{row.repair_date}</TableCell>
                        <TableCell>{row.repair_level}</TableCell>
                        <TableCell>
                          <Button onClick={() => this.delete(row.engine_analysis_id)}>Xoá</Button>
                        </TableCell>
                      </TableRow>
                    ))}
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

EngineAnalysisList.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(EngineAnalysisList);
