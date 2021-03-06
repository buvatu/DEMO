import { CloudUpload32 } from '@carbon/icons-react';
import {
  Button,
  ComboBox,
  ComposedModal,
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
import { assignErrorMessage, setLoadingValue, setSubmitValue } from '../../actions/commonAction';
import { deleteScrap, getScrapList, getScrapMaterialList, insertScrap, updateScrap } from '../../services';

class Scrap extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scrapMaterialList: [],
      scrapList: [],
      scrapListDisplay: [],
      page: 1,
      pageSize: 30,

      newMaterialID: '',
      newMaterialIDErrorMessage: '',
      newMaterialName: '',
      newCopperVolume: '',
      newAluminumVolume: '',
      newCastIronVolume: '',
      newSteelVolume: '',
      newOtherVolume: '',

      id: '',
      updatedMaterialID: '',
      updatedMaterialName: '',
      updatedCopperVolume: '',
      updatedAluminumVolume: '',
      updatedCastIronVolume: '',
      updatedSteelVolume: '',
      updatedOtherVolume: '',
    };
  }

  componentDidMount = async () => {
    const { setLoading } = this.props;
    setLoading(true);
    const getScrapListResult = await getScrapList();
    const getScrapMaterialListResult = await getScrapMaterialList();
    const scrapList = getScrapListResult.data;
    const scrapMaterialIDList = getScrapListResult.data.map((e) => {
      return e.materialID;
    });
    const scrapMaterialList = getScrapMaterialListResult.data.filter((e) => !scrapMaterialIDList.includes(e.materialID));
    setLoading(false);
    this.setState({
      scrapMaterialList,
      scrapList,
      scrapListDisplay: scrapList.slice(0, 30),
    });
  };

  reload = async () => {
    const { setLoading, setSubmitResult } = this.props;
    const { scrapMaterialList } = this.state;
    setSubmitResult('');
    setLoading(true);
    const getScrapListResult = await getScrapList();
    const scrapList = getScrapListResult.data;
    const scrapMaterialIDList = getScrapListResult.data.map((e) => {
      return e.materialID;
    });

    setLoading(false);
    this.setState({
      scrapMaterialList: scrapMaterialList.filter((e) => !scrapMaterialIDList.includes(e.materialID)),
      scrapList,
      scrapListDisplay: scrapList.slice(0, 30),
      page: 1,
      pageSize: 30,

      newMaterialID: '',
      newMaterialIDErrorMessage: '',
      newCopperVolume: '',
      newAluminumVolume: '',
      newCastIronVolume: '',
      newSteelVolume: '',
      newOtherVolume: '',

      id: '',
      updatedMaterialID: '',
      updatedMaterialName: '',
      updatedCopperVolume: '',
      updatedAluminumVolume: '',
      updatedCastIronVolume: '',
      updatedSteelVolume: '',
      updatedOtherVolume: '',
    });
  };

  addNewScrap = async () => {
    const { setLoading, setSubmitResult, setErrorMessage } = this.props;
    const { newMaterialID, newMaterialName, newCopperVolume, newAluminumVolume, newCastIronVolume, newSteelVolume, newOtherVolume } = this.state;
    this.setState({ newMaterialIDErrorMessage: '' });
    if (newMaterialID.trim() === '') {
      this.setState({ newMaterialIDErrorMessage: 'M?? v???t t?? kh??ng ???????c b??? tr???ng' });
      return;
    }

    setLoading(true);
    try {
      await insertScrap({
        materialID: newMaterialID,
        materialName: newMaterialName,
        copperVolume: newCopperVolume,
        aluminumVolume: newAluminumVolume,
        castIronVolume: newCastIronVolume,
        steelVolume: newSteelVolume,
        otherVolume: newOtherVolume,
      });
      setSubmitResult('V???t t?? ph??? li???u m???i th??m th??nh c??ng!');
    } catch {
      setErrorMessage('Ph??? li???u m???i ???? t???n t???i. Vui l??ng ki???m tra l???i.');
    }
    setLoading(false);
  };

  updateScrap = async () => {
    const { setLoading, setSubmitResult, setErrorMessage } = this.props;
    const {
      id,
      updatedMaterialID,
      updatedMaterialName,
      updatedCopperVolume,
      updatedAluminumVolume,
      updatedCastIronVolume,
      updatedSteelVolume,
      updatedOtherVolume,
    } = this.state;
    setLoading(true);
    try {
      await updateScrap({
        id,
        materialID: updatedMaterialID,
        materialName: updatedMaterialName,
        copperVolume: updatedCopperVolume,
        aluminumVolume: updatedAluminumVolume,
        castIronVolume: updatedCastIronVolume,
        steelVolume: updatedSteelVolume,
        otherVolume: updatedOtherVolume,
      });
      setSubmitResult('V???t t?? ph??? li???u ???????c c???p nh???t th??nh c??ng!');
    } catch {
      setErrorMessage('C?? l???i khi c???p nh???t v???t t?? ph??? li???u. Vui l??ng ki???m tra l???i.');
    }
    setLoading(false);
  };

  deleteScrap = async () => {
    const { setLoading, setSubmitResult, setErrorMessage } = this.props;
    const { id } = this.state;
    setLoading(true);
    try {
      await deleteScrap(id);
      setSubmitResult('V???t t?? ph??? li???u ???????c xo?? th??nh c??ng!');
    } catch {
      setErrorMessage('C?? l???i khi xo?? v???t t?? ph??? li???u. Vui l??ng ki???m tra l???i.');
    }
    setLoading(false);
  };

  render() {
    // Props first
    const { setErrorMessage, common } = this.props;
    const { submitResult, errorMessage, isLoading } = common;

    // Then state
    const {
      scrapList,
      scrapListDisplay,
      page,
      pageSize,
      scrapMaterialList,

      newMaterialID,
      newMaterialIDErrorMessage,
      newCopperVolume,
      newAluminumVolume,
      newCastIronVolume,
      newSteelVolume,
      newOtherVolume,

      updatedMaterialID,
      updatedCopperVolume,
      updatedAluminumVolume,
      updatedCastIronVolume,
      updatedSteelVolume,
      updatedOtherVolume,
    } = this.state;

    const scrapMaterialIDList = scrapMaterialList.map((e) => {
      return { id: e.materialID, label: e.materialID.concat(' - ').concat(e.materialName) };
    });

    return (
      <div className="scrap">
        {/* Loading */}
        {isLoading && <Loading description="Loading data. Please wait..." withOverlay />}
        {/* Success Modal */}
        <ComposedModal className="btn-success" open={submitResult !== ''} size="sm" onClose={() => this.reload()}>
          <ModalHeader iconDescription="Close" title={<div>Thao t??c th??nh c??ng</div>} />
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
          <h4>Danh m???c ph??? li???u</h4>
        </div>
        <br />

        {/* Content page */}
        <div className="bx--grid">
          <div className="bx--row">
            <div className="bx--col-lg-6">
              <ComboBox
                id="newMaterialID-ComboBox"
                titleText="Lo???i v???t t??"
                placeholder=""
                label=""
                items={scrapMaterialIDList}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                onChange={(e) =>
                  this.setState({
                    newMaterialID: e.selectedItem == null ? '' : e.selectedItem.id,
                    newMaterialName: e.selectedItem == null ? '' : scrapMaterialList.find((material) => material.materialID === e.selectedItem.id).materialName,
                    newMaterialIDErrorMessage: '',
                  })
                }
                selectedItem={newMaterialID === '' ? null : scrapMaterialIDList.find((e) => e.materialID === newMaterialID)}
                invalid={newMaterialIDErrorMessage !== ''}
                invalidText={newMaterialIDErrorMessage}
              />
            </div>
            <div className="bx--col-lg-2 bx--col-md-2">
              <Button onClick={() => this.addNewScrap()} style={{ marginTop: '1rem' }}>
                Th??m
              </Button>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newCopperVolume-TextInput"
                placeholder=""
                labelText="Kh???i l?????ng ?????ng"
                value={newCopperVolume}
                onChange={(e) => this.setState({ newCopperVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newAluminumVolume-TextInput"
                placeholder=""
                labelText="Kh???i l?????ng Nh??m"
                value={newAluminumVolume}
                onChange={(e) => this.setState({ newAluminumVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newCastIronVolume-TextInput"
                placeholder=""
                labelText="Kh???i l?????ng Gang"
                value={newCastIronVolume}
                onChange={(e) => this.setState({ newCastIronVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newSteelVolume-TextInput"
                placeholder=""
                labelText="Kh???i l?????ng S???t"
                value={newSteelVolume}
                onChange={(e) => this.setState({ newSteelVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="newOtherVolume -TextInput"
                placeholder=""
                labelText="V???t li???u kh??c"
                value={newOtherVolume}
                onChange={(e) => this.setState({ newOtherVolume: e.target.value })}
              />
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-6">
              <ComboBox
                id="updatedMaterialID-ComboBox"
                titleText="Lo???i v???t t?? ph??? li???u"
                placeholder=""
                label=""
                items={scrapList.map((e) => {
                  return {
                    id: e.materialID,
                    label: e.materialID.concat(' - ').concat(e.materialName),
                  };
                })}
                shouldFilterItem={({ item, inputValue }) => {
                  if (!inputValue) return true;
                  return item.label.toLowerCase().includes(inputValue.toLowerCase());
                }}
                selectedItem={
                  updatedMaterialID === ''
                    ? null
                    : scrapList
                        .map((e) => {
                          return {
                            id: e.materialID,
                            label: e.materialID.concat(' - ').concat(e.materialName),
                          };
                        })
                        .find((e) => e.id === updatedMaterialID)
                }
                onChange={(e) => {
                  if (e.selectedItem == null) {
                    this.setState({
                      id: '',
                      updatedMaterialID: '',
                      updatedMaterialName: '',
                      updatedCopperVolume: '',
                      updatedAluminumVolume: '',
                      updatedCastIronVolume: '',
                      updatedSteelVolume: '',
                      updatedOtherVolume: '',
                    });
                  } else {
                    const selectedScrap = scrapList.find((item) => item.materialID === e.selectedItem.id);
                    this.setState({
                      id: selectedScrap.id,
                      updatedMaterialID: selectedScrap.materialID,
                      updatedMaterialName: selectedScrap.materialName,
                      updatedCopperVolume: selectedScrap.copperVolume,
                      updatedAluminumVolume: selectedScrap.aluminumVolume,
                      updatedCastIronVolume: selectedScrap.castIronVolume,
                      updatedSteelVolume: selectedScrap.steelVolume,
                      updatedOtherVolume: selectedScrap.otherVolume,
                    });
                  }
                }}
              />
            </div>
            <div className="bx--col-lg-4">
              <Button onClick={() => this.updateScrap()} style={{ marginTop: '1rem', marginRight: '1rem' }} disabled={updatedMaterialID === ''}>
                C???p nh???t
              </Button>
              <Button onClick={() => this.deleteScrap()} style={{ marginTop: '1rem' }} disabled={updatedMaterialID === ''}>
                Xo??
              </Button>
            </div>
          </div>
          <br />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedCopperVolume-TextInput"
                placeholder=""
                labelText="Kh???i l?????ng ?????ng"
                value={updatedCopperVolume}
                onChange={(e) => this.setState({ updatedCopperVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedAluminumVolume-TextInput"
                placeholder=""
                labelText="Kh???i l?????ng Nh??m"
                value={updatedAluminumVolume}
                onChange={(e) => this.setState({ updatedAluminumVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedCastIronVolume-TextInput"
                placeholder=""
                labelText="Kh???i l?????ng Gang"
                value={updatedCastIronVolume}
                onChange={(e) => this.setState({ updatedCastIronVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedSteelVolume-TextInput"
                placeholder=""
                labelText="Kh???i l?????ng S???t"
                value={updatedSteelVolume}
                onChange={(e) => this.setState({ updatedSteelVolume: e.target.value })}
              />
            </div>
            <span style={{ maxWidth: '2rem' }} />
            <div className="bx--col-lg-2 bx--col-md-2">
              <TextInput
                id="updatedOtherVolume -TextInput"
                placeholder=""
                labelText="V???t li???u kh??c"
                value={updatedOtherVolume}
                onChange={(e) => this.setState({ updatedOtherVolume: e.target.value })}
              />
            </div>
          </div>
          <br />
          <hr className="LeftNav-module--divider--1Z49I" />
          <div className="bx--row">
            <div className="bx--col-lg-2 bx--col-md-2" />
            <div className="bx--col-lg-12">
              <TableContainer title={`C?? t???t c??? ${scrapList.length} v???t t?? ph??? li???u.`}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableHeader style={{ width: '15%' }} key="materialID">
                        M?? v???t t??
                      </TableHeader>
                      <TableHeader style={{ width: '35%' }} key="materialName">
                        T??n v???t t??
                      </TableHeader>
                      <TableHeader style={{ width: '10%' }} key="copperVolume">
                        Kh???i l?????ng ?????ng
                      </TableHeader>
                      <TableHeader style={{ width: '10%' }} key="aluminumVolume">
                        Kh???i l?????ng Nh??m
                      </TableHeader>
                      <TableHeader style={{ width: '10%' }} key="castIronVolume">
                        Kh???i l?????ng Gang
                      </TableHeader>
                      <TableHeader style={{ width: '10%' }} key="steelVolume">
                        Kh???i l?????ng S???t
                      </TableHeader>
                      <TableHeader style={{ width: '10%' }} key="otherVolume">
                        V???t li???u kh??c
                      </TableHeader>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {scrapListDisplay.map((row, index) => (
                      <TableRow key={`row-${index.toString()}`}>
                        <TableCell key={`materialID-${index.toString()}`}>{row.materialID}</TableCell>
                        <TableCell key={`materialName-${index.toString()}`}>{row.materialName}</TableCell>
                        <TableCell key={`copperVolume-${index.toString()}`}>{row.copperVolume}</TableCell>
                        <TableCell key={`aluminumVolume-${index.toString()}`}>{row.aluminumVolume}</TableCell>
                        <TableCell key={`castIronVolume-${index.toString()}`}>{row.castIronVolume}</TableCell>
                        <TableCell key={`steelVolume-${index.toString()}`}>{row.steelVolume}</TableCell>
                        <TableCell key={`otherVolume-${index.toString()}`}>{row.otherVolume}</TableCell>
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
                totalItems={scrapList.length}
                onChange={(target) => {
                  this.setState({
                    scrapListDisplay: scrapList.slice((target.page - 1) * target.pageSize, target.page * target.pageSize),
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
        </div>
      </div>
    );
  }
}

Scrap.propTypes = {
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

export default connect(mapStateToProps, mapDispatchToProps)(Scrap);
