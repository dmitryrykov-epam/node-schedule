#!/usr/bin/env node
/// <reference path="./typings.d.ts" />

import * as express from 'express';
import { readFile } from 'fs';
import * as path from 'path';
import * as ip from 'ip';

const app = express()
    .set('protocol', 'http')
    .set('domain', ip.address())
    .set('port', 3000);

const files = [
    {
        name: 'rsreu',
        alias: "РГРТУ",
        path: path.resolve(__dirname, './../data/rsreu.json'),
    }
];

const universities = [];

const buildRouter = ({timeSlots, schedule}: ScheduleRequestAnswer) => {
    const router = express.Router();
    const groups = Object.keys(schedule);
    
    router.get('/list', (_, res) => res.json(groups).end());

    const buildGroupEndpoint = (group: string) => {
        const scheduleObject = {
            numerator: schedule[group].map(day => day.map(slot => slot ? slot.denominator : null)),
            denominator: schedule[group].map(day => day.map(slot => slot ? slot.denominator : null)),
        };
        const lectorsList = [...scheduleObject.numerator, ...scheduleObject.denominator]
            .reduce((acc, next) => [...acc, ...next], [])
            .filter(lesson => lesson)
            .map(lesson => lesson.lector)
            .reduce((acc, next) => [...acc, ...next], [])
            .reduce((acc, next) => acc.indexOf(next) > -1 ? acc : [...acc, next], []);
        const lessonsList = [...scheduleObject.numerator, ...scheduleObject.denominator]
            .reduce((acc, next) => [...acc, ...next], [])
            .filter(lesson => lesson)
            .map(lesson => lesson.name)
            .reduce((acc, next) => acc.indexOf(next) > -1 ? acc : [...acc, next], []);
            
        router.get(
            `/${group}`,
            (_, res) => res.json({ timeSlots, schedule: scheduleObject, lectorsList, lessonsList }).end(),
        );
    }

    groups.map(buildGroupEndpoint);

    return router;
};

const showInfo = (app: express.Application) => {
    const basePath = `${app.get('protocol')}://${app.get('domain')}:${app.get('port')}`;

    return `Server started at ${basePath}

    Available routes:
        ${basePath}/list - List of all available universities
        ${basePath}/<university_name>/list - List of all available groups at university
        ${basePath}/<university_name>/<group_id> - Schedule
    `;
};

const promises = files.map(({name, path, alias}) => {
    return new Promise((resolve, reject) => {
        readFile(path, (err, json) => {
            try {
                if (err) {
                    throw err;
                } else {
                    resolve(JSON.parse(json.toString()));
                }
            } catch (e) {
                reject(e);
            }
        });
    })
    .then((data: ScheduleRequestAnswer) => buildRouter(data))
    .then(router => app.use(`/${name}`, router))
    .then(() => universities.push({name, alias}));
});

Promise.all(promises)
    .then(() => app.get('/list', (_, res) => res.json(universities).end()))
    .then(() => app.all('**', (_, res) => res.status(404).json("Not found").end()))
    .then(() => app.listen(app.get('port'), app.get('domain'), () => console.log(showInfo(app))))
    .catch(error => console.error("Can't start server", error));