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
import { Link } from 'react-router-dom';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { deleteEngineAnalysisInfo, getEngineAnalysisList } from '../../services';

class EngineAnalysisList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      engineAnalysisName: '',
      engineID: '',
      engineIDList: [],
      repairLevel: '',
      repairDate: '',
      repairDateList: [],
      engineAnalysisList: [],
      searchResult: [],
      engineAnalysisListDisplay: [],
      page: 1,
      pageSize: 10,
    };
  }

  componentDidMount = async () => {
    const { setLoading, setErrorMessage, auth } = this.props;
    setLoading(true);
    try {
      const getEngineAnalysisListResult = await getEngineAnalysisList(auth.companyID);
      this.setState({
        engineAnalysisList: getEngineAnalysisListResult.data,
        searchResult: getEngineAnalysisListResult.data,
        engineAnalysisListDisplay: getEngineAnalysisListResult.data.slice(0, 10),

        engineIDList: [
          ...new Set(
            getEngineAnalysisListResult.data.map((e) => {
              return { id: e.engineID, label: e.engineID };
            })
          ),
        ],

        repairDateList: [
          ...new Set(
            getEngineAnalysisListResult.data.map((e) => {
              return { id: e.repairDate, label: e.repairDate };
            })
          ),
        ],
      });
    } catch {
      setErrorMessage('Lỗi khi tải trang. Vui lòng thử lại');
    }
    setLoading(false);
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
    const { engineAnalysisList, engineAnalysisName, engineID, repairLevel, repairDate } = this.state;
    let searchResult = JSON.parse(JSON.stringify(engineAnalysisList));
    if (engineAnalysisName.trim() !== '') {
      searchResult = searchResult.filter((e) => e.engineAnalysisName.includes(engineAnalysisName));
    }
    if (engineID !== '') {
      searchResult = searchResult.filter((e) => e.engineID === engineID);
    }
    if (repairLevel !== '') {
      searchResult = searchResult.filter((e) => e.repairLevel === repairLevel);
    }
    if (repairDate !== '') {
      searchResult = searchResult.filter((e) => e.repairDate === repairDate);
    }
    this.setState({ searchResult, engineAnalysisListDisplay: searchResult.slice(0, 10) });
  };

  render() {
    // Props first
    const { setErrorMessage, setSubmitResult, history, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      engineAnalysisList,
      searchResult,
      engineAnalysisListDisplay,
      page,
      pageSize,
      engineAnalysisName,
      engineID,
      engineIDList,
      repairLevel,
      repairDateList,
      repairDate,
    } = this.state;

    const repairLevelList = [
      { id: 'Đột xuất', label: 'Đột xuất' },
      { id: 'Ro', label: 'Ro' },
      { id: 'Rt', label: 'Rt' },
      { id: 'R1', label: 'R1' },
      { id: 'R2', label: 'R2' },
      { id: 'Đại tu', label: 'Đại tu' },
    ];

    return (
      <div className="engine-analysis-list">
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
                id="engineAnalysisName-TextInput"
                placeholder="Vui lòng nhập một phần tên biên bản để tìm kiếm"
                labelText="Tên biên bản"
                value={engineAnalysisName}
                onChange={(e) => this.setState({ engineAnalysisName: e.target.value })}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="engineID-Dropdown"
                titleText="Đầu máy tiêu thụ"
                label=""
                items={engineIDList}
                selectedItem={engineID === '' ? null : engineIDList.find((e) => e.id === engineID)}
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
              <Button style={{ marginTop: '1rem' }} onClick={() => history.push('/engine/analysis')}>
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
              <TableContainer title={`Có tất cả ${searchResult.length} biên bản giải thể.`}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader key="engineAnalysisName">Tên biên bản giải thể</TableHeader>
                      <TableHeader key="engineID">Số hiệu đầu máy</TableHeader>
                      <TableHeader key="repairDate">Ngày vào sửa chữa</TableHeader>
                      <TableHeader key="repairLevel">Cấp sửa chữa</TableHeader>
                      <TableHeader>Xoá</TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {engineAnalysisListDisplay.map((row, index) => (
                      <TableRow key={`row-${index.toString()}`}>
                        <TableCell>
                          <Link to={`/engine/analysis?engineAnalysisID=${row.id}`}>{row.engineAnalysisName}</Link>
                        </TableCell>
                        <TableCell>{row.engineID}</TableCell>
                        <TableCell>{row.repairDate}</TableCell>
                        <TableCell>{row.repairLevel}</TableCell>
                        <TableCell>
                          <Button onClick={() => this.delete(row.id)}>Xoá</Button>
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
                totalItems={engineAnalysisList.length}
                onChange={(target) => {
                  this.setState({
                    engineAnalysisListDisplay: searchResult.slice((target.page - 1) * target.pageSize, target.page * target.pageSize),
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
