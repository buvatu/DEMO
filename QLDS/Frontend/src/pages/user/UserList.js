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
import { assignErrorMessage, setLoadingValue } from '../../actions/commonAction';
import { getCompanyList, getUserList } from '../../services';

class UserList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filterUserID: '',
      filterUsername: '',
      filterRole: '',
      filterCompanyID: '',
      userList: [],
      userListDisplay: [],
      companyList: [],
      roleList: [],
      page: 1,
      pageSize: 10,
    };
  }

  componentDidMount = async () => {
    const { setLoading, setErrorMessage, auth } = this.props;
    if (auth.role !== 'SysAdmin' && auth.role !== 'CompanyAdmin') {
      setErrorMessage('Bạn không đủ quyền truy cập vào chức năng này!!!');
      return;
    }
    const { pageSize } = this.state;
    setLoading(true);
    if (auth.role === 'SysAdmin') {
      const getUserListResult = await getUserList('', '', '', ''); // Find all
      const getCompanyListResult = await getCompanyList();
      this.setState({
        userList: getUserListResult.data.map((e, index) => {
          e.id = index.toString();
          return e;
        }),
        userListDisplay: getUserListResult.data
          .map((e, index) => {
            e.id = index.toString();
            return e;
          })
          .slice(0, pageSize),
        companyList: getCompanyListResult.data.map((e) => {
          return { id: e.companyID, label: e.companyName };
        }),
        roleList: [
          { id: 'SysAdmin', label: 'Quản lý hệ thống' },
          { id: 'CompanyAdmin', label: 'Quản lý công ty' },
          { id: 'phongketoantaichinh', label: 'Phòng Kế toán - Tài chính' },
          { id: 'phongkehoachvattu', label: 'Phòng Kế hoạch - Vật tư' },
          { id: 'phongkythuat', label: 'Phòng Kỹ thuật' },
          { id: 'bangiamdoc', label: 'Ban Giám đốc' },
        ],
      });
    } else {
      const getUserListResult = await getUserList('', '', auth.companyID, ''); // Find user in company only
      this.setState({
        userList: getUserListResult.data.map((e, index) => {
          e.id = index.toString();
          return e;
        }),
        userListDisplay: getUserListResult.data
          .map((e, index) => {
            e.id = index.toString();
            return e;
          })
          .slice(0, pageSize),
        companyList: [{ id: auth.companyID, label: auth.companyName }],
        roleList: [
          { id: 'CompanyAdmin', label: 'Quản lý công ty' },
          { id: 'phongketoantaichinh', label: 'Phòng Kế toán - Tài chính' },
          { id: 'phongkehoachvattu', label: 'Phòng Kế hoạch - Vật tư' },
          { id: 'phongkythuat', label: 'Phòng Kỹ thuật' },
          { id: 'bangiamdoc', label: 'Ban Giám đốc' },
        ],
      });
    }
    setLoading(false);
  };

  findUsers = async () => {
    const { setLoading } = this.props;
    setLoading(true);
    const { filterUserID, filterUsername, filterRole, filterCompanyID, pageSize } = this.state;
    const getUserListResult = await getUserList(filterUserID, filterUsername, filterCompanyID, filterRole);
    setLoading(false);
    this.setState({
      userList: getUserListResult.data.map((e, index) => {
        e.id = index.toString();
        return e;
      }),
      userListDisplay: getUserListResult.data
        .map((e, index) => {
          e.id = index.toString();
          return e;
        })
        .slice(0, pageSize),
    });
  };

  render() {
    const { filterUserID, filterUsername, filterRole, filterCompanyID, userList, userListDisplay, companyList, roleList, page, pageSize } = this.state;
    const { auth, common, setErrorMessage, setSubmitResult, history } = this.props;
    const { errorMessage, isLoading, submitResult } = common;

    return (
      <div className="user-list">
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
          <h4>Danh sách các nhân viên trong {auth.role === 'SysAdmin' ? 'hệ thống' : 'công ty'}</h4>
        </div>
        <br />

        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput
                id="filterUserID-TextInput"
                placeholder="Vui lòng nhập mã nhân viên"
                labelText="Mã định danh nhân viên"
                value={filterUserID}
                onChange={(e) => this.setState({ filterUserID: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <Dropdown
                id="filterCompanyID-Dropdown"
                titleText="Công ty"
                label=""
                items={companyList}
                disabled={auth.role !== 'SysAdmin'}
                selectedItem={companyList.find((e) => e.id === filterCompanyID)}
                onChange={(e) => this.setState({ filterCompanyID: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.findUsers()} style={{ marginTop: '1rem' }} disabled={auth.role !== 'SysAdmin' && auth.role !== 'CompanyAdmin'}>
                Tìm
              </Button>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-4">
              <TextInput
                id="filterUsername-TextInput"
                placeholder="Vui lòng nhập tên nhân viên"
                labelText="Tên nhân viên"
                value={filterUsername}
                onChange={(e) => this.setState({ filterUsername: e.target.value })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-4">
              <Dropdown
                id="filterRole-Dropdown"
                titleText="Vị trí"
                label=""
                items={roleList}
                selectedItem={roleList.find((e) => e.id === filterRole)}
                onChange={(e) => this.setState({ filterRole: e.selectedItem.id })}
              />
            </div>
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button
                style={{ marginTop: '1rem' }}
                onClick={() =>
                  this.setState({ filterUserID: '', filterRole: '', filterUsername: '', filterCompanyID: auth.role === 'SysAdmin' ? '' : filterCompanyID })
                }
                disabled={auth.role !== 'SysAdmin' && auth.role !== 'CompanyAdmin'}
              >
                Xoá bộ lọc
              </Button>
            </div>
          </div>
          <br />
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <DataTable
                rows={userListDisplay}
                headers={[
                  { header: 'Mã nhân viên', key: 'userID' },
                  { header: 'Tên nhân viên', key: 'username' },
                  { header: 'Số điện thoại', key: 'phoneNumber' },
                  { header: 'Email', key: 'email' },
                  { header: 'Công ty', key: 'companyName' },
                  { header: 'Vị trí', key: 'roleName' },
                  { header: 'Địa chỉ', key: 'address' },
                ]}
                render={({ rows, headers }) => (
                  <div>
                    <TableContainer title={`Có tất cả ${userList.length} nhân viên.`}>
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
                    <Pagination
                      className="fixed-pagination"
                      backwardText="Previous page"
                      forwardText="Next page"
                      itemsPerPageText="Items per page:"
                      page={page}
                      pageNumberText="Page Number"
                      pageSize={pageSize}
                      pageSizes={[10, 20, 30, 40, 50]}
                      totalItems={userList.length}
                      onChange={(target) => {
                        this.setState({
                          userListDisplay: userList.slice((target.page - 1) * target.pageSize, target.page * target.pageSize),
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
          <br />
          <br />
          <div className="bx--row">
            <div className="bx--col-sm-1 bx--col-md-1 bx--col-lg-1" />
            <div className="bx--col-lg-8">
              <Button onClick={() => history.push('/user/add')}>Thêm nhân viên mới</Button>
            </div>
            <div className="bx--col-lg-4" />
          </div>
          <br />
          <br />
          <br />
        </div>
      </div>
    );
  }
}

UserList.propTypes = {
  setErrorMessage: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  setSubmitResult: PropTypes.func.isRequired,
  common: PropTypes.shape({ errorMessage: PropTypes.string, submitResult: PropTypes.string, isLoading: PropTypes.bool }).isRequired,
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
});

export default connect(mapStateToProps, mapDispatchToProps)(UserList);
