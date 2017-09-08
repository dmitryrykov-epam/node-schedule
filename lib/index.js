#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var fs_1 = require("fs");
var path = require("path");
var app = express()
    .set('protocol', 'http')
    .set('domain', 'localhost')
    .set('port', 3000);
var files = [
    {
        name: 'rsreu',
        alias: "РГРТУ",
        path: path.resolve(__dirname, './../data/rsreu.json'),
    }
];
var universities = [];
var buildRouter = function (_a) {
    var timeSlots = _a.timeSlots, schedule = _a.schedule;
    var router = express.Router();
    var groups = Object.keys(schedule);
    router.get('/list', function (_, res) { return res.json(groups).end(); });
    var buildGroupEndpoint = function (group) { return router
        .get("/" + group, function (_, res) { return res.json({ timeSlots: timeSlots, schedule: schedule[group] }).end(); }); };
    groups.map(buildGroupEndpoint);
    return router;
};
var showInfo = function (app) {
    var basePath = app.get('protocol') + "://" + app.get('domain') + ":" + app.get('port');
    return "Server started at " + basePath + "\n\n    Available routes:\n        " + basePath + "/list - List of all available universities\n        " + basePath + "/<university_name>/list - List of all available groups at university\n        " + basePath + "/<university_name>/<group_id> - Schedule\n    ";
};
var promises = files.map(function (_a) {
    var name = _a.name, path = _a.path, alias = _a.alias;
    return new Promise(function (resolve, reject) {
        fs_1.readFile(path, function (err, json) {
            try {
                if (err) {
                    throw err;
                }
                else {
                    resolve(JSON.parse(json.toString()));
                }
            }
            catch (e) {
                reject(e);
            }
        });
    })
        .then(function (data) { return buildRouter(data); })
        .then(function (router) { return app.use("/" + name, router); })
        .then(function () { return universities.push({ name: name, alias: alias }); });
});
Promise.all(promises)
    .then(function () { return app.get('/list', function (_, res) { return res.json(universities).end(); }); })
    .then(function () { return app.all('**', function (_, res) { return res.status(404).json("Not found").end(); }); })
    .then(function () { return app.listen(app.get('port'), app.get('domain'), function () { return console.log(showInfo(app)); }); })
    .catch(function (error) { return console.error("Can't start server", error); });
