const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const dotenv = require("dotenv");
dotenv.config({ path: "./config/config.env" });
// const schedule = require('node-schedule');
const { ToadScheduler, SimpleIntervalJob, AsyncTask, Task } = require('toad-scheduler')
const schedule = require('./app/controllers/schedule.js');

// const indexRouter = require('./routes/index');
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

global.KAKAO_ID = process.env.KAKAO_ID;
global.KAKAO_PWD = process.env.KAKAO_PWD;
global.PROCESS_TERM = process.env.PROCESS_TERM;
global.PROCESS_MAX = process.env.PROCESS_MAX;
global.PROCESS_TERM_MTS = process.env.PROCESS_TERM_MTS;
global.PROCESS_MAX_MTS = process.env.PROCESS_MAX_MTS;

const scheduler = new ToadScheduler()

const task_kko = new Task('KKO trigger', async () => {
    schedule.processMessage();
});

const task_mts = new Task('MTS trigger', async () => {
    schedule.processMessageMTS();
});

// const job_kko = new SimpleIntervalJob({ seconds: PROCESS_TERM }, task_kko)
const job_mts = new SimpleIntervalJob({ seconds: PROCESS_TERM_MTS }, task_mts)

// scheduler.addSimpleIntervalJob(job_kko)
scheduler.addSimpleIntervalJob(job_mts)

module.exports = app;