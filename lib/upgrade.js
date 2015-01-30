"use strict";

var pjson = require('../package.json'),

	NodeBB = require('./nodebb'),

	async = require('async'),

	Upgrade = {};

Upgrade.doUpgrade = function(oldVersion, newVersion, callback) {
	var thisVersion;

	async.series([
		function(next) {
			thisVersion = '0.2.2';

			if (oldVersion < thisVersion) {
				getAllSids(function(err, sids) {
					async.each(sids, function(sid, next) {
						NodeBB.db.setObjectField('shout:' + sid, 'sid', sid, next);
					}, next);
				});
			} else {
				next();
			}
		}
	], function(err) {
		if (err) {
			error(err);
		} else {
			done();
		}
	});

	function done() {
		NodeBB.winston.info('[' + pjson.name + '] Upgraded from ' + oldVersion + ' to ' + newVersion);
		callback();
	}

	function error(err) {
		NodeBB.winston.error(err);
		NodeBB.winston.info('[' + pjson.name + '] No upgrade performed, old version was ' + oldVersion + ' and new version is ' + newVersion);
		callback();
	}
};

function getAllShouts(fields, callback) {
	getAllSids(function(err, sids) {
		if (err || !sids || !sids.length) return callback(err);

		var keys = sids.map(function (sid) {
			return 'shout:' + sid;
		});

		NodeBB.db.getObjectsFields(keys, fields, callback);
	});
}

function getAllSids(callback) {
	NodeBB.db.getListRange('shouts', 0, -1, callback);
}

module.exports = Upgrade;