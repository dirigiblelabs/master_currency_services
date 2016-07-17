/* globals $ */
/* eslint-env node, dirigible */

var request = require("net/http/request");
var response = require("net/http/response");
var database = require("db/database");

var datasource = database.getDatasource();

// read all entities and print them as JSON array to response
exports.readMaster_currencyList = function(limit, offset, sort, desc) {
    var connection = datasource.getConnection();
    try {
        var result = [];
        var sql = "SELECT ";
        if (limit !== null && offset !== null) {
            sql += " " + datasource.getPaging().genTopAndStart(limit, offset);
        }
        sql += " * FROM MASTER_CURRENCY";
        if (sort !== null) {
            sql += " ORDER BY " + sort;
        }
        if (sort !== null && desc !== null) {
            sql += " DESC ";
        }
        if (limit !== null && offset !== null) {
            sql += " " + datasource.getPaging().genLimitAndOffset(limit, offset);
        }
        var statement = connection.prepareStatement(sql);
        var resultSet = statement.executeQuery();
        while (resultSet.next()) {
            result.push(createEntity(resultSet));
        }
        var jsonResponse = JSON.stringify(result, null, 2);
        response.println(jsonResponse);
    } catch(e){
        var errorCode = response.BAD_REQUEST;
        exports.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
};

//create entity as JSON object from ResultSet current Row
function createEntity(resultSet) {
    var result = {};
    result.currency_code = resultSet.getString("CURRENCY_CODE");
    result.currency_entity = resultSet.getString("CURRENCY_ENTITY");
    result.currency_name = resultSet.getString("CURRENCY_NAME");
	result.currency_numeric_code = resultSet.getInt("CURRENCY_NUMERIC_CODE");
	result.currency_minor_unit = resultSet.getInt("CURRENCY_MINOR_UNIT");
    return result;
}

function convertToDateString(date) {
    var fullYear = date.getFullYear();
    var month = date.getMonth() < 10 ? "0" + date.getMonth() : date.getMonth();
    var dateOfMonth = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
    return fullYear + "/" + month + "/" + dateOfMonth;
}


exports.countMaster_currency = function() {
    var count = 0;
    var connection = datasource.getConnection();
    try {
    	var sql = 'SELECT COUNT(*) FROM MASTER_CURRENCY';
        var statement = connection.prepareStatement(sql);
        var rs = statement.executeQuery();
        if (rs.next()) {
            count = rs.getInt(1);
        }
    } catch(e){
        var errorCode = response.BAD_REQUEST;
        exports.printError(errorCode, errorCode, e.message);
    } finally {
        connection.close();
    }
    response.println(count);
};

exports.metadataMaster_currency = function() {
	var entityMetadata = {
		name: 'master_currency',
		type: 'object',
		properties: []
	};
	
	var propertycurrency_code = {
		name: 'currency_code',
		type: 'string',
	key: 'true',
	required: 'true'
	};
    entityMetadata.properties.push(propertycurrency_code);

	var propertycurrency_entity = {
		name: 'currency_entity',
		type: 'string'
	};
    entityMetadata.properties.push(propertycurrency_entity);

	var propertycurrency_name = {
		name: 'currency_name',
		type: 'string'
	};
    entityMetadata.properties.push(propertycurrency_name);

	var propertycurrency_numeric_code = {
		name: 'currency_numeric_code',
		type: 'integer'
	};
    entityMetadata.properties.push(propertycurrency_numeric_code);

	var propertycurrency_minor_unit = {
		name: 'currency_minor_unit',
		type: 'integer'
	};
    entityMetadata.properties.push(propertycurrency_minor_unit);


	response.println(JSON.stringify(entityMetadata));
};

exports.hasConflictingParameters = function(id, count, metadata) {
    if(id !== null && count !== null){
    	printError(response.EXPECTATION_FAILED, 1, "Expectation failed: conflicting parameters - id, count");
        return true;
    }
    if(id !== null && metadata !== null){
    	printError(response.EXPECTATION_FAILED, 2, "Expectation failed: conflicting parameters - id, metadata");
        return true;
    }
    return false;
}

// check whether the parameter exists 
exports.isInputParameterValid = function(paramName) {
    var param = request.getParameter(paramName);
    if(param === null || param === undefined){
    	printError(response.PRECONDITION_FAILED, 3, "Expected parameter is missing: " + paramName);
        return false;
    }
    return true;
}

// print error
exports.printError = function(httpCode, errCode, errMessage, errContext) {
    var body = {'err': {'code': errCode, 'message': errMessage}};
    response.setStatus(httpCode);
    response.setHeader("Content-Type", "application/json");
    response.print(JSON.stringify(body));
    console.error(JSON.stringify(body));
    if (errContext !== null) {
    	console.error(JSON.stringify(errContext));
    }
}

