import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
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
  TableSelectRow,
  TextInput,
} from 'carbon-components-react';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { getCompanyList, getEngineList, insertEngine, updateEngine } from '../../services';

class Engine extends Component {
  constructor(props) {
    super(props);
    this.state = {
      engineList: [],
      newEngineID: '',
      newEngineIDErrorMessage: '',
      newCompanyID: '',
      newCompanyIDErrorMessage: '',
      newCompanyName: '',
      newEngineType: '',
      newEngineTypeErrorMessage: '',

      updatedEngineID: '',
      updatedCompanyID: '',
      updatedCompanyName: '',
      updatedEngineType: '',

      companyList: [],
      engineTypes: [],
    };
  }

  componentDidMount = async () => {
    const { setLoading } = this.props;
    setLoading(true);
    const getCompanyListResult = await getCompanyList();
    const getEngineListResult = await getEngineList();
    setLoading(false);
    this.setState({
      companyList: getCompanyListResult.data.map((e) => {
        return { id: e.company_id, label: e.company_name };
      }),
      engineList: getEngineListResult.data.map((e, index) => {
        e.id = index.toString();
        return e;
      }),
      engineTypes: [
        { id: 'Đầu máy Bỉ', label: 'Đầu máy Bỉ' },
        { id: 'Đầu máy Ấn Độ', label: 'Đầu máy Ấn Độ' },
        { id: 'Đầu máy Trung Quốc', label: 'Đầu máy Trung Quốc' },
        { id: 'Đầu máy GE', label: 'Đầu máy GE' },
      ],
    });
  };

  reload = async () => {
    const { setLoading, setSubmitResult } = this.props;
    setSubmitResult('');
    setLoading(true);
    const getEngineListResult = await getEngineList();
    setLoading(false);
    this.setState({
      engineList: getEngineListResult.data.map((e, index) => {
        e.id = index.toString();
        return e;
      }),
      newEngineID: '',
      newEngineIDErrorMessage: '',
      newCompanyID: '',
      newCompanyIDErrorMessage: '',
      newCompanyName: '',
      newEngineType: '',
      newEngineTypeErrorMessage: '',

      updatedEngineID: '',
      updatedCompanyID: '',
      updatedCompanyName: '',
      updatedEngineType: '',
    });
  };

  addNewEngine = async () => {
    const { setLoading, setSubmitResult, setErrorMessage, auth } = this.props;
    const { engineList, newEngineID, newCompanyID, newCompanyName, newEngineType } = this.state;
    let hasError = false;
    if (newEngineID.trim() === '') {
      this.setState({ newEngineIDErrorMessage: 'Số hiệu đầu máy không được bỏ trống' });
      hasError = true;
    }
    if (
      engineList
        .map((e) => {
          return e.engine_id;
        })
        .includes(newEngineID.trim())
    ) {
      this.setState({ newEngineIDErrorMessage: 'Số hiệu đầu máy đã tồn tại' });
      hasError = true;
    }
    if (newCompanyID.trim() === '') {
      this.setState({ newCompanyIDErrorMessage: 'Tên đơn vị quản lý không được bỏ trống' });
      hasError = true;
    }
    if (newEngineType.trim() === '') {
      this.setState({ newEngineTypeErrorMessage: 'Loại đầu máy không được bỏ trống' });
      hasError = true;
    }
    if (hasError) {
      return;
    }
    setLoading(true);
    const getAddEngineResult = await insertEngine(newEngineID, newCompanyID, newCompanyName, newEngineType, auth.userID);
    setLoading(false);
    if (getAddEngineResult.data === 1) {
      setSubmitResult('Đầu máy mới được thêm thành công!');
    } else {
      setErrorMessage('Đầu máy mới đã tồn tại. Vui lòng kiểm tra lại.');
    }
  };

  updateEngine = async () => {
    const { setLoading, setSubmitResult, setErrorMessage, auth } = this.props;
    const { updatedEngineID, updatedCompanyID, updatedCompanyName, updatedEngineType } = this.state;
    setLoading(true);
    const getUpdatEngineResult = await updateEngine(updatedEngineID, updatedCompanyID, updatedCompanyName, updatedEngineType, auth.userID);
    setLoading(false);
    if (getUpdatEngineResult.data === 1) {
      setSubmitResult('Đầu máy được cập nhật thành công!');
    } else {
      setErrorMessage('Có lỗi khi cập nhật đầu máy. Vui lòng kiểm tra lại.');
    }
  };

  render() {
    // Props first
    const { setErrorMessage, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      engineList,
      newEngineID,
      newCompanyID,
      newEngineType,
      newEngineIDErrorMessage,
      newCompanyIDErrorMessage,
      newEngineTypeErrorMessage,

      updatedEngineID,
      updatedCompanyID,
      updatedEngineType,

      companyList,
      engineTypes,
    } = this.state;

    return (
      <div className="engine">
        {/* Loading */}
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
          <h4>Danh sách đầu máy</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newEngineID-TextInput"
                placeholder=""
                labelText="Số hiệu đầu máy"
                value={newEngineID}
                onChange={(e) => this.setState({ newEngineID: e.target.value })}
                invalid={newEngineIDErrorMessage !== ''}
                invalidText={newEngineIDErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="newCompany-Dropdown"
                titleText="Đơn vị quản lý"
                label=""
                items={companyList}
                selectedItem={newCompanyID === '' ? null : companyList.find((e) => e.id === newCompanyID)}
                onChange={(e) => this.setState({ newCompanyID: e.selectedItem.id, newCompanyName: e.selectedItem.label })}
                invalid={newCompanyIDErrorMessage !== ''}
                invalidText={newCompanyIDErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="newEngineType-Dropdown"
                titleText="Loại đầu máy"
                label=""
                items={engineTypes}
                selectedItem={newEngineType === '' ? null : engineTypes.find((e) => e.id === newEngineType)}
                onChange={(e) => this.setState({ newEngineType: e.selectedItem.id })}
                invalid={newEngineTypeErrorMessage !== ''}
                invalidText={newEngineTypeErrorMessage}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.addNewEngine()} style={{ marginTop: '1rem' }}>
                Thêm
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput id="updatedEngineID-TextInput" placeholder="" labelText="Số hiệu đầu máy" disabled value={updatedEngineID} />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="newCompany-Dropdown"
                titleText="Đơn vị quản lý"
                label=""
                items={companyList}
                selectedItem={updatedCompanyID === '' ? null : companyList.find((e) => e.id === updatedCompanyID)}
                onChange={(e) => this.setState({ updatedCompanyID: e.selectedItem.id, updatedCompanyName: e.selectedItem.label })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Dropdown
                id="newEngineType-Dropdown"
                titleText="Loại đầu máy"
                label=""
                items={engineTypes}
                selectedItem={updatedEngineType === '' ? null : engineTypes.find((e) => e.id === updatedEngineType)}
                onChange={(e) => this.setState({ updatedEngineType: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.updateEngine()} style={{ marginTop: '1rem' }} disabled={updatedEngineID === ''}>
                Cập nhật
              </Button>
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <DataTable
                rows={engineList}
                headers={[
                  { header: 'Số hiệu đầu máy', key: 'engine_id' },
                  { header: 'Đơn vị quản lý', key: 'company_name' },
                  { header: 'Loại đầu máy', key: 'engine_type' },
                ]}
                radio
                render={({ rows, headers, getSelectionProps, selectRow }) => (
                  <div>
                    <TableContainer title={`Có tất cả ${engineList.length} đầu máy.`}>
                      <Table style={{ maxHeigh: '70vh' }}>
                        <TableHead>
                          <TableRow>
                            <TableHeader />
                            {headers.map((header) => (
                              <TableHeader key={header.key}>{header.header}</TableHeader>
                            ))}
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {rows.map((row) => (
                            <TableRow key={row.id}>
                              <TableSelectRow
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                {...getSelectionProps({ row })}
                                onSelect={() => {
                                  selectRow(row.id);
                                  this.setState({
                                    updatedEngineID: row.cells[0].value,
                                    updatedCompanyID: companyList.find((e) => e.label === row.cells[1].value).id,
                                    updatedCompanyName: row.cells[1].value,
                                    updatedEngineType: row.cells[2].value,
                                  });
                                }}
                              />
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
          <br />
        </div>
      </div>
    );
  }
}

Engine.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(Engine);
