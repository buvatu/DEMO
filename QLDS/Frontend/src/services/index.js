import Axios from 'axios';
import { ACCESS_TOKEN, API_BASE_URL, DELETE, GET, POST, PUT } from '../constants';

const request = (options) => {
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem(ACCESS_TOKEN)}`,
  };
  return Axios.request({ ...{ headers }, baseURL: API_BASE_URL, ...options });
};

export const login = (userID, password) => {
  return request({
    url: '/login',
    params: { userID, password },
    method: POST,
  });
};

export const signout = (userID, token) => {
  return request({
    url: `${API_BASE_URL}/signout`,
    params: { userID, token },
    method: POST,
  });
};

export const getUserInfoByToken = (token) => {
  return request({
    url: '/token',
    params: { token },
    method: GET,
  });
};

export const getUserInfo = (userID) => {
  return request({
    url: '/user',
    params: { userID },
    method: GET,
  });
};

export const getCompanyList = () => {
  return request({
    url: '/company/list',
    method: GET,
  });
};

export const getCompanyInfo = (companyID) => {
  return request({
    url: '/company',
    params: { companyID },
    method: GET,
  });
};

export const updateCompanyInfo = (company) => {
  return request({
    url: '/company',
    data: company,
    method: PUT,
  });
};

export const insertCompanyInfo = (company) => {
  return request({
    url: '/company',
    data: company,
    method: POST,
  });
};

export const getUserList = (userID, username, companyID, role) => {
  return request({
    url: '/user/list',
    params: { userID, username, companyID, role },
    method: GET,
  });
};

export const updateUserInfo = (user, oldPassword, newPassword) => {
  return request({
    url: '/user',
    params: { oldPassword, newPassword },
    data: user,
    method: PUT,
  });
};

export const insertUserInfo = (user) => {
  return request({
    url: '/user',
    data: user,
    method: POST,
  });
};

export const getScrapMaterialList = () => {
  return request({
    url: '/material/scrap/list',
    method: GET,
  });
};

export const getMaterialList = () => {
  return request({
    url: '/material/list',
    method: GET,
  });
};

export const getMaterialInfo = (materialID) => {
  return request({
    url: '/material',
    params: { materialID },
    method: GET,
  });
};

export const deleteMaterial = (id) => {
  return request({
    url: '/material',
    params: { id },
    method: DELETE,
  });
};

export const insertMaterialInfo = (material) => {
  return request({
    url: '/material',
    data: material,
    method: POST,
  });
};

export const updateMaterialInfo = (material) => {
  return request({
    url: '/material',
    data: material,
    method: PUT,
  });
};

export const getStandardList = () => {
  return request({
    url: '/standard/list',
    method: GET,
  });
};

export const insertStandard = (standard) => {
  return request({
    url: '/standard',
    data: standard,
    method: POST,
  });
};

export const updateStandard = (standard) => {
  return request({
    url: '/standard',
    data: standard,
    method: PUT,
  });
};

export const getSpecList = () => {
  return request({
    url: '/spec/list',
    method: GET,
  });
};

export const getTechSpec = (specID) => {
  return request({
    url: '/spec',
    params: { specID },
    method: GET,
  });
};

export const getTechSpecStandards = (specID) => {
  return request({
    url: '/spec/standard/list',
    params: { specID },
    method: GET,
  });
};

export const insertSpec = (techSpec) => {
  return request({
    url: '/spec',
    data: techSpec,
    method: POST,
  });
};

export const updateTechSpec = (techSpec) => {
  return request({
    url: '/spec',
    data: techSpec,
    method: PUT,
  });
};

export const getEngineList = () => {
  return request({
    url: '/engine/list',
    method: GET,
  });
};

export const getEngineListByCompany = (companyID) => {
  return request({
    url: '/engine/company/list',
    params: { companyID },
    method: GET,
  });
};

export const insertEngine = (engine) => {
  return request({
    url: '/engine',
    data: engine,
    method: POST,
  });
};

export const updateEngine = (engine) => {
  return request({
    url: '/engine',
    data: engine,
    method: PUT,
  });
};

export const getSupplierList = () => {
  return request({
    url: '/supplier/list',
    method: GET,
  });
};

export const insertSupplier = (supplier) => {
  return request({
    url: '/supplier',
    data: supplier,
    method: POST,
  });
};

export const updateSupplier = (supplier) => {
  return request({
    url: '/supplier',
    data: supplier,
    method: PUT,
  });
};

export const deleteSupplier = (id) => {
  return request({
    url: '/supplier',
    params: { id },
    method: DELETE,
  });
};

export const getScrapList = () => {
  return request({
    url: '/scrap/list',
    method: GET,
  });
};

export const insertScrap = (scrap) => {
  return request({
    url: '/scrap',
    data: scrap,
    method: POST,
  });
};

export const updateScrap = (scrap) => {
  return request({
    url: '/scrap',
    data: scrap,
    method: PUT,
  });
};

export const deleteScrap = (id) => {
  return request({
    url: '/scrap',
    params: { id },
    method: DELETE,
  });
};

export const getScrapPriceList = (companyID) => {
  return request({
    url: '/scrap/price/list',
    params: { companyID },
    method: GET,
  });
};

export const adjustScrapPrice = (copperPrice, aluminumPrice, castIronPrice, steelPrice, otherPrice, companyID, updatedUser) => {
  return request({
    url: '/scrap/price/adjust',
    params: { copperPrice, aluminumPrice, castIronPrice, steelPrice, otherPrice, companyID, updatedUser },
    method: POST,
  });
};

export const getOrderList = (requestor, tester, approver, status = '', requestDate = '') => {
  return request({
    url: '/order/list',
    params: { requestor, tester, approver, status, requestDate },
    method: GET,
  });
};

export const getOrderInfo = (orderID) => {
  return request({
    url: '/order',
    params: { orderID },
    method: GET,
  });
};

export const addOrderInfo = (
  orderType,
  orderName,
  status,
  consumer,
  requestor,
  requestNote,
  tester = '',
  approver,
  companyID,
  supplier = '',
  no = '',
  co = '',
  recipeNo = '',
  deliver = '',
  requestDate = '',
  attachedDocument = '',
  stockNo = '',
  address = ''
) => {
  return request({
    url: '/order',
    params: {
      orderType,
      orderName,
      status,
      consumer,
      requestor,
      requestNote,
      tester,
      approver,
      companyID,
      supplier,
      no,
      co,
      recipeNo,
      deliver,
      requestDate,
      attachedDocument,
      stockNo,
      address,
    },
    method: POST,
  });
};

export const updateOrderInfo = (orderID, status, testNote = '', approveNote = '', updatedUser, testDate = '', approveDate = '') => {
  return request({
    url: '/order',
    params: { orderID, status, testNote, approveNote, updatedUser, testDate, approveDate },
    method: PUT,
  });
};

export const getOrderDetails = (orderID) => {
  return request({
    url: '/order/details',
    params: { orderID },
    method: GET,
  });
};

export const addOrderDetails = (orderID, requestor, orderDetails) => {
  return request({
    url: '/order/details',
    params: { orderID, requestor },
    data: orderDetails,
    method: POST,
  });
};

export const updateOrderDetails = (orderDetails, updatedUser) => {
  return request({
    url: '/order/details',
    params: { updatedUser },
    data: orderDetails,
    method: PUT,
  });
};

export const addOrderChangesHistory = (orderChanges, updatedUser) => {
  return request({
    url: '/order/change-history',
    params: { updatedUser },
    data: orderChanges,
    method: POST,
  });
};

export const getStockList = (companyID) => {
  return request({
    url: '/stock/list',
    params: { companyID },
    method: GET,
  });
};

export const stockIn = (orderDetails, companyID, updatedUser) => {
  return request({
    url: '/stock/in',
    params: { companyID, updatedUser },
    data: orderDetails,
    method: PUT,
  });
};

export const stockOut = (orderDetails, companyID, updatedUser) => {
  return request({
    url: '/stock/out',
    params: { companyID, updatedUser },
    data: orderDetails,
    method: PUT,
  });
};

export const stockUpdate = (stockList, companyID, updatedUser, requestDate) => {
  return request({
    url: '/stock/update',
    params: { companyID, updatedUser, requestDate },
    data: stockList,
    method: PUT,
  });
};

export const filterStockList = (filterMaterialID, filterMaterialType, filterMaterialGroup, filterQuality, companyID) => {
  return request({
    url: '/stock/filter/list',
    params: { filterMaterialID, filterMaterialType, filterMaterialGroup, filterQuality, companyID },
    method: GET,
  });
};

export const exportStockReport = (filterMaterialID, filterMaterialType, filterMaterialGroup, filterQuality, companyID) => {
  return request({
    url: '/report/stock',
    params: { filterMaterialID, filterMaterialType, filterMaterialGroup, filterQuality, companyID },
    method: GET,
    responseType: 'blob', // important
  });
};

export const getCompletedOrderList = (fromDate, toDate, companyID, filterMaterialType) => {
  return request({
    url: '/report/order/completed/list',
    params: { fromDate, toDate, companyID, filterMaterialType },
    method: GET,
  });
};

export const getRelatedData = (orderType, companyID) => {
  return request({
    url: '/order/related-data',
    params: { orderType, companyID },
    method: GET,
  });
};

export const getFilteredOrders = (orderType, companyID, materialID, supplier, consumer, recipeNo, deliver, fromDate, toDate) => {
  return request({
    url: '/order/filter',
    params: { orderType, companyID, materialID, supplier, consumer, recipeNo, deliver, fromDate, toDate },
    method: GET,
  });
};

export const exportOrderReport = (fromDate, toDate, companyID, filterMaterialType) => {
  return request({
    url: '/report/order',
    params: { fromDate, toDate, companyID, filterMaterialType },
    method: GET,
    responseType: 'blob', // important
  });
};

export const exportStockInOrderRecipe = (orderID) => {
  return request({
    url: `/report/order/${orderID}/stock-in/recipe`,
    method: GET,
    responseType: 'blob', // important
  });
};

export const exportStockOutOrderRecipe = (orderID) => {
  return request({
    url: `/report/order/${orderID}/stock-out/recipe`,
    method: GET,
    responseType: 'blob', // important
  });
};

export const exportTestRecipe = (orderID) => {
  return request({
    url: `/report/order/${orderID}/test/recipe`,
    method: GET,
    responseType: 'blob', // important
  });
};

export const getEngineAnalysisList = (companyID) => {
  return request({
    url: '/engine/analysis/list',
    params: { companyID },
    method: GET,
  });
};

export const getEngineAnalysisInfo = (engineAnalysisID) => {
  return request({
    url: '/engine/analysis/info',
    params: { engineAnalysisID },
    method: GET,
  });
};

export const addEngineAnalysisInfo = (engineAnalysisID, engineAnalysisName, engineID, engineType, repairDate = '', repairLevel = '', companyID, updatedUser) => {
  return request({
    url: '/engine/analysis/info',
    params: { engineAnalysisID, engineAnalysisName, engineID, engineType, repairDate, repairLevel, companyID, updatedUser },
    method: POST,
  });
};

export const deleteEngineAnalysisInfo = (engineAnalysisID) => {
  return request({
    url: '/engine/analysis/info',
    params: { engineAnalysisID },
    method: DELETE,
  });
};

export const getComponentList = (engineAnalysisID) => {
  return request({
    url: '/engine/analysis/components',
    params: { engineAnalysisID },
    method: GET,
  });
};

export const insertComponents = (engineAnalysisID, components, updatedUser) => {
  return request({
    url: '/engine/analysis/components',
    params: { engineAnalysisID, updatedUser },
    data: components,
    method: POST,
  });
};

export const updateComponents = (engineAnalysisID, components, updatedUser) => {
  return request({
    url: '/engine/analysis/components',
    params: { engineAnalysisID, updatedUser },
    data: components,
    method: PUT,
  });
};

export const exportEngineAnalysisReport = (engineAnalysisID) => {
  return request({
    url: '/report/engine-analysis',
    params: { engineAnalysisID },
    method: GET,
    responseType: 'blob', // important
  });
};

export const exportMaterialReport = () => {
  return request({
    url: '/report/material',
    method: GET,
    responseType: 'blob', // important
  });
};

export const getVCFList = (companyID) => {
  return request({
    url: '/vcf/list',
    params: { companyID },
    method: GET,
  });
};

export const saveVCF = (vcfKey, vcf, companyID, updatedUser) => {
  return request({
    url: '/vcf',
    params: { vcfKey, vcf, companyID, updatedUser },
    method: POST,
  });
};

export const getFuelOrderList = (companyID, fromDate, toDate, fuelOrderType, supplier, consumer) => {
  return request({
    url: '/fuel/order/list',
    params: { companyID, fromDate, toDate, fuelOrderType, supplier, consumer },
    method: GET,
  });
};

export const saveFuelStock = (fuelOrderType, fuelMaterialID, realFuelQuantity, standardFuelQuantity, companyID, updatedUser) => {
  return request({
    url: '/fuel/stock/save',
    params: { fuelOrderType, fuelMaterialID, realFuelQuantity, standardFuelQuantity, companyID, updatedUser },
    method: PUT,
  });
};

export const saveFuelOrder = (
  fuelOrderType,
  fuelMaterialID,
  fuelMaterialName,
  fuelOrderNote,
  realFuelQuantity,
  standardFuelQuantity,
  requestDate,
  supplier,
  recipeNo,
  consumer,
  amount = '',
  companyID,
  updatedUser
) => {
  return request({
    url: '/fuel/order/save',
    params: {
      fuelOrderType,
      fuelMaterialID,
      fuelMaterialName,
      fuelOrderNote,
      realFuelQuantity,
      standardFuelQuantity,
      requestDate,
      supplier,
      recipeNo,
      consumer,
      amount,
      companyID,
      updatedUser,
    },
    method: POST,
  });
};

export const getFuelStockQuantity = (companyID, updatedUser) => {
  return request({
    url: '/fuel/stock/real-quantity',
    params: {
      companyID,
      updatedUser,
    },
    method: GET,
  });
};

export const updateFuelStockQuantity = (companyID, realFuelQuantity, updatedUser) => {
  return request({
    url: '/fuel/stock/update',
    params: {
      companyID,
      realFuelQuantity,
      updatedUser,
    },
    method: PUT,
  });
};

export const exportFuelReport = (fromDate, toDate, companyID, updatedUser) => {
  return request({
    url: '/report/fuel',
    params: { fromDate, toDate, companyID, updatedUser },
    method: GET,
    responseType: 'blob', // important
  });
};
