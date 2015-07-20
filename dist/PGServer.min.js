
/**************************************************************************/
/*                                                                        */
/* Copyright (c)2010-2012  Pinguo Company             　　　　　　　      */
/*                 品果科技                            版权所有 2010-2012 */
/*                                                                        */
/* PROPRIETARY RIGHTS of Pinguo Company are involved in the  　　　　　　 */
/* subject matter of this material.  All manufacturing, reproduction, use,*/
/* and sales rights pertaining to this subject matter are governed by the */
/* license agreement.  The recipient of this software implicitly accepts  */
/* the terms of the license.                                              */
/* 本软件文档资料是品果公司的资产,任何人士阅读和使用本资料必须获得        */
/* 相应的书面授权,承担保密责任和接受相应的法律约束.                       */
/*                                                                        */
/**************************************************************************/

/*
@author zhangzhi
@email zhangzhi@camera360.com
@edit by liangyunzhu 2015/06/17
@email liangyunzhu@camera360.com
*/

;(function(window) {

	var Server = {},
		config = {
			host:window.location.host,
			mode:'dev'
		};

	Server.setConfig = function(params){
		for(var key in params){
			config[key] = params[key];
		}
	};

	var lang = {
		timeout:'请求超时',
		error404:'没有找到',
		error500:'服务出错'
	};

	var getJSON = function() {
		var p = getJSONParseParams(arguments);
		p.retry = 0;

		var host = config.host;

		var serverIp = window.location.protocol+'//'+host;

		p.method = window.PG.config.appName +'/'+ p.method;
		
		p.server = serverIp + (serverIp[serverIp.length - 1] == '/' ? '' : '/') + p.method;

		console.log("doAjaxRequest requesting " + p.server);
		console.log("doAjaxRequest requesting " + p.method + " ", p.serverData);
		p.t = new Date().getTime();
		
		return doAjaxRequest(p);

	}

	var doAjaxRequest = function(p) {
			return $.ajax({
				timeout: 30000,
				type: "get",
				url: p.server,
				data: p.serverData,
				dataType: "jsonp",
				jsonp: 'jsonpCallback',
				success: function(resp) {
					console.log("resp " + p.method + " COST=" + (new Date().getTime() - p.t));
					console.log("resp " + p.method + " ", resp);
					if (p.callback) {
						p.callback(resp);
					}



				},
				error: function(request, textStatus, errorThrown) {
					console.log("resp " + p.method + " error errorThrown=" + errorThrown);
					console.log("resp " + p.method + " error textStatus=" + textStatus);
					if (errorThrown == 'abort' || errorThrown == '') return;
					if (p.retry <= 2) {
						console.log("retrying request " + p.method + " times=" + p.retry);
						p.retry++;
						doAjaxRequest(p);
					} else {
						p.callback({
							status: 500,
							message: lang.timeout
						});
					}

				},
				statusCode: {
					404: function() {
						console.log("resp " + p.method + " statusCode 400");
						p.callback({
							status: 404,
							message: lang.error404
						});
					},
					500: function() {
						console.log("resp " + p.method + " statusCode 500");
						p.callback({
							status: 500,
							message: lang.error500
						});
					}
				}
			});
	}

	//分析getJSON函数的参数
	var getJSONParseParams = function(p) {
		var method = null,
			callback = null,
			serverData = {};
		switch (p.length) {
			case 0:
			case 1:
				throw Error('Missing Arguments');
				break;
			case 2:
				method = p[0];
				callback = p[1];
				if (!callback instanceof Function) {
					throw Error('Invild Arguments');
				}
				break;
			case 3:
				method = p[0];
				serverData = p[1];
				callback = p[2];
				if (!callback instanceof Function) {
					throw Error('Invild Arguments');
				}
				break;
		}

		return {
			method: method,
			callback: callback,
			serverData: serverData
		};
	}

	var a = Server;

	a.getTicket = function(url, json, callback){
		$.ajax({
			url: url,
			type: 'GET',
			dataType: 'jsonp',
			jsonp:'jsonpCallback', 
			data: json,
		})
		.done(function(res) {
			if (callback) callback(res);
		})
		.fail(function() {
		})
	};

	var Promise = window.PGPromise;

	a.statistics = function(data){
		return new Promise(function(callback){
			getJSON('Statistics', data, callback?callback:function(){});
		});
	}

	window.PGServer = Server;
	
})(window);




