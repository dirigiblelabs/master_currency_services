/* globals $ */
/* eslint-env node, dirigible */

var entityMaster_currency = require('master_currency_services/currency_lib');
var request = require("net/http/request");
var response = require("net/http/response");
var xss = require("utils/xss");

handleRequest();

function handleRequest() {
	
	response.setContentType("application/json; charset=UTF-8");
	response.setCharacterEncoding("UTF-8");
	
	// get method type
	var method = request.getMethod();
	method = method.toUpperCase();
	
	//get primary keys (one primary key is supported!)
	var idParameter = entityMaster_currency.getPrimaryKey();
	
	// retrieve the id as parameter if exist 
	var id = xss.escapeSql(request.getParameter(idParameter));
	var count = xss.escapeSql(request.getParameter('count'));
	var metadata = xss.escapeSql(request.getParameter('metadata'));
	var sort = xss.escapeSql(request.getParameter('sort'));
	var limit = xss.escapeSql(request.getParameter('limit'));
	var offset = xss.escapeSql(request.getParameter('offset'));
	var desc = xss.escapeSql(request.getParameter('desc'));
	
	if (limit === null) {
		limit = 100;
	}
	if (offset === null) {
		offset = 0;
	}
	
	if(!entityMaster_currency.hasConflictingParameters(id, count, metadata)) {
		// switch based on method type
		if ((method === 'POST')) {
			// create
			entityMaster_currency.createMaster_currency();
		} else if ((method === 'GET')) {
			// read
			if (id) {
				entityMaster_currency.readMaster_currencyEntity(id);
			} else if (count !== null) {
				entityMaster_currency.countMaster_currency();
			} else if (metadata !== null) {
				entityMaster_currency.metadataMaster_currency();
			} else {
				entityMaster_currency.readMaster_currencyList(limit, offset, sort, desc);
			}
		} else if ((method === 'PUT')) {
			// update
			entityMaster_currency.updateMaster_currency();    
		} else if ((method === 'DELETE')) {
			// delete
			if(entityMaster_currency.isInputParameterValid(idParameter)){
				entityMaster_currency.deleteMaster_currency(id);
			}
		} else {
			entityMaster_currency.printError(response.BAD_REQUEST, 4, "Invalid HTTP Method", method);
		}
	}
	
	// flush and close the response
	response.flush();
	response.close();
}