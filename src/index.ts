/// <reference path="./typings.d.ts" />

import * as express from 'express';
import { readFile } from 'fs';
import * as path from 'path';

const app = express();

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

    const buildGroupEndpoint = (group: string) => router
        .get(`/${group}`, (_, res) => res.json({ timeSlots, schedule: schedule[group] }).end());

    groups.map(buildGroupEndpoint);

    return router;
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
    .then(() => app.listen(3000, 'localhost', () => console.log("Server started")))
    .catch(error => console.error("Can't start server", error));